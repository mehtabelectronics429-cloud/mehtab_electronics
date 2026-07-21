import { Installation } from "@/lib/db/models/Installation";
import { Invoice } from "@/lib/db/models/Invoice";
import { Product } from "@/lib/db/models/Product";
import { WhatsAppMessage } from "@/lib/db/models/WhatsAppMessage";
import { Activity } from "@/lib/db/models/Activity";
import { requireUser, json, errorResponse } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    await connectMongo();

    const employeeFilter =
      !can(user.role, "installations.view.all") && user.employeeId
        ? {
            $or: [
              { employeeId: user.employeeId },
              { employeeIds: user.employeeId },
            ],
          }
        : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayInstalls,
      pendingInstalls,
      completedInstalls,
      pendingApproval,
      invoices,
      lowStock,
      pendingWhatsapp,
      activity,
    ] = await Promise.all([
      Installation.countDocuments({
        ...notDeleted,
        ...employeeFilter,
        date: { $gte: today },
      }),
      Installation.countDocuments({
        ...notDeleted,
        ...employeeFilter,
        status: { $in: ["pending", "assigned", "in_progress"] },
      }),
      Installation.countDocuments({
        ...notDeleted,
        ...employeeFilter,
        status: "completed",
      }),
      Installation.countDocuments({ ...notDeleted, status: "submitted" }),
      Invoice.find({ ...notDeleted })
        .select("amount cost paid status")
        .lean(),
      Product.countDocuments({ ...notDeleted, stock: { $lte: 5 } }),
      WhatsAppMessage.countDocuments({
        ...notDeleted,
        status: { $in: ["queued", "failed"] },
      }),
      Activity.find({ ...notDeleted })
        .sort({ at: -1 })
        .limit(10)
        .lean(),
    ]);

    const approved = invoices.filter((i) => i.status === "approved");
    const revenue = approved.reduce((s, i) => s + (i.amount || 0), 0);
    // Accurate cost/profit from the goods+materials cost recorded on each invoice.
    const cost = approved.reduce((s, i) => s + (i.cost || 0), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? profit / revenue : 0;
    const collected = invoices.reduce((s, i) => s + (i.paid || 0), 0);
    const outstanding = invoices.reduce(
      (s, i) => s + Math.max(0, (i.amount || 0) - (i.paid || 0)),
      0,
    );

    return json({
      kpis: {
        todayInstalls,
        pendingInstalls,
        completedInstalls,
        pendingApproval,
        revenue,
        outstanding,
        collected,
        cost,
        profit,
        margin,
        // kept for backward compatibility with any existing reads
        expenses: cost,
        inventoryValue: 0,
        lowStock,
        pendingWhatsapp,
      },
      activity: activity.map((a) => ({
        id: String(a._id),
        actor: a.actor,
        action: a.action,
        target: a.target,
        at: a.at,
        kind: a.kind,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
