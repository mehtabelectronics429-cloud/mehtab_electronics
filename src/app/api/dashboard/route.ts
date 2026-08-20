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
      inventoryAgg,
      pendingBillsRaw,
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
        .select("amount cost paid returnedAmount returnedCost status")
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
      Product.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            value: {
              $sum: { $multiply: ["$stock", "$purchasePrice"] },
            },
          },
        },
      ]),
      // Unpaid / partially-paid bills, scoped to what the user may see.
      Invoice.find({
        ...notDeleted,
        status: { $in: ["pending", "approved"] },
        ...(can(user.role, "billing.view.all")
          ? {}
          : user.employeeId
            ? { employeeId: user.employeeId }
            : { _id: null }),
      })
        .select("number amount paid returnedAmount status date customerId")
        .populate("customerId", "name phone whatsapp")
        .sort({ date: 1 })
        .lean(),
    ]);

    // Net customer returns off each invoice so revenue / cost / collected reflect
    // reality (cash refunds reverse both recognised revenue and collected cash).
    for (const i of invoices) {
      const refunded = i.returnedAmount || 0;
      i.amount = (i.amount || 0) - refunded;
      i.cost = (i.cost || 0) - (i.returnedCost || 0);
      i.paid = (i.paid || 0) - refunded;
    }

    const approved = invoices.filter((i) => i.status === "approved");
    const revenue = approved.reduce((s, i) => s + (i.amount || 0), 0);
    // Accurate cost/profit from the goods+materials cost recorded on each invoice.
    const cost = approved.reduce((s, i) => s + (i.cost || 0), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? profit / revenue : 0;
    // Align cash figures with approved revenue recognition.
    const collected = approved.reduce((s, i) => s + (i.paid || 0), 0);
    const outstanding = approved.reduce(
      (s, i) => s + Math.max(0, (i.amount || 0) - (i.paid || 0)),
      0,
    );
    const inventoryValue = Number(inventoryAgg[0]?.value ?? 0);

    // Build the pending-bills list: net balance (after returns) still owed.
    const pendingBillsAll = (
      pendingBillsRaw as {
        _id: unknown;
        number: string;
        amount?: number;
        paid?: number;
        returnedAmount?: number;
        status: string;
        date: Date;
        customerId?: {
          _id?: unknown;
          name?: string;
          phone?: string;
          whatsapp?: string;
        } | null;
      }[]
    )
      .map((i) => {
        const cust = i.customerId;
        const netTotal = (i.amount || 0) - (i.returnedAmount || 0);
        const balance = Math.max(0, netTotal - (i.paid || 0));
        return {
          id: String(i._id),
          number: i.number,
          customer: cust?.name || "Walk-in",
          customerId: cust?._id ? String(cust._id) : null,
          phone: cust?.phone || "",
          whatsapp: cust?.whatsapp || "",
          amount: netTotal,
          paid: i.paid || 0,
          balance,
          status: i.status,
          date:
            i.date instanceof Date
              ? i.date.toISOString().slice(0, 10)
              : i.date,
        };
      })
      .filter((b) => b.balance > 0);

    const pendingBillsTotal = pendingBillsAll.reduce(
      (s, b) => s + b.balance,
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
        inventoryValue,
        lowStock,
        pendingWhatsapp,
        pendingBillsCount: pendingBillsAll.length,
        pendingBillsTotal,
      },
      pendingBills: pendingBillsAll.slice(0, 12),
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
