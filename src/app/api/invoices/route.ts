import { Invoice } from "@/lib/db/models/Invoice";
import { Customer } from "@/lib/db/models/Customer";
import {
  requireUser,
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { invoiceInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

async function nextNumber() {
  const count = await Invoice.countDocuments({});
  return `INV-${2000 + count + 1}`;
}

function mapInvoice(item: Record<string, unknown>) {
  const customer = item.customerId as { _id?: unknown; name?: string } | string | null;
  return {
    ...item,
    customerId: typeof customer === "object" && customer?._id ? String(customer._id) : customer ? String(customer) : null,
    customer: typeof customer === "object" && customer?.name ? customer.name : "",
    date: item.date instanceof Date ? (item.date as Date).toISOString().slice(0, 10) : item.date,
  };
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "billing.view.all") && !can(user.role, "billing.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const status = url.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const customers = await Customer.find({
        ...notDeleted,
        name: rx,
      })
        .select("_id")
        .lean();
      const customerIds = customers.map((c) => c._id);
      filter.$or = [
        { number: rx },
        { notes: rx },
        ...(customerIds.length ? [{ customerId: { $in: customerIds } }] : []),
      ];
    }
    if (!can(user.role, "billing.view.all")) {
      if (!user.employeeId) return json({ items: [], page: 1, limit: p.limit, total: 0, totalPages: 1 });
      filter.employeeId = user.employeeId;
    }
    const result = await paginate(Invoice, filter, { ...p, populate: "customerId" });
    return json({ ...result, items: result.items.map(mapInvoice) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("billing.manage");
    await connectMongo();
    const body = invoiceInput.parse(await req.json());
    const customer = await Customer.findOne({ _id: body.customerId, ...notDeleted });
    if (!customer) throw new ApiError(400, "Invalid customer");
    // If line items are provided, the total is computed from them.
    const amount =
      body.items && body.items.length
        ? invoiceTotals(body).total
        : body.amount ?? 0;
    const doc = await Invoice.create({
      ...body,
      amount,
      number: body.number || (await nextNumber()),
      date: new Date(body.date),
      employeeId: body.employeeId || user.employeeId || null,
      paid: body.paid ?? 0,
      status: body.status || "draft",
    });
    const populated = await Invoice.findById(doc._id).populate("customerId");
    return json(mapInvoice(serializeDoc(populated!)), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
