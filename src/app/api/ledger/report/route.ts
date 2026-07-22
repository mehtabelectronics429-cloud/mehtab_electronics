import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
import { requireUser, json, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Customer ledger statement JSON for date-range PDF/CSV reports. */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (
      !can(user.role, "ledger.view.all") &&
      !can(user.role, "ledger.view.own")
    ) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!customerId) throw new ApiError(400, "customerId is required");

    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds) && !ownIds.includes(customerId)) {
      throw new ApiError(403, "Forbidden");
    }

    const customer = await Customer.findOne({ _id: customerId, ...notDeleted }).lean();
    if (!customer) throw new ApiError(404, "Customer not found");

    const filter: Record<string, unknown> = {
      ...notDeleted,
      customerId,
    };
    if (from || to) {
      const date: Record<string, Date> = {};
      if (from) {
        const d = new Date(from);
        d.setHours(0, 0, 0, 0);
        date.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        date.$lte = d;
      }
      filter.date = date;
    }

    const entries = await LedgerEntry.find(filter).sort({ date: 1 }).lean();

    const mapped = entries.map((e) => ({
      id: String(e._id),
      date: new Date(e.date).toISOString().slice(0, 10),
      type: e.type,
      amount: e.amount,
      status: e.status,
      note: e.note || "",
    }));

    const debits = mapped
      .filter((e) => e.amount > 0)
      .reduce((s, e) => s + e.amount, 0);
    const credits = mapped
      .filter((e) => e.amount < 0)
      .reduce((s, e) => s + Math.abs(e.amount), 0);
    const net = mapped.reduce((s, e) => s + e.amount, 0);

    return json({
      customer: {
        id: String(customer._id),
        name: customer.name,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        address: customer.address,
        balance: customer.balance,
      },
      from: from || null,
      to: to || null,
      entries: mapped,
      totals: { debits, credits, net, count: mapped.length },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
