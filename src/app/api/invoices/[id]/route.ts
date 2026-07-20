import { Invoice } from "@/lib/db/models/Invoice";
import {
  requireUser,
  requireCap,
  json,
  errorResponse,
  softDeleteById,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { invoiceInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

function mapInvoice(item: Record<string, unknown>) {
  const customer = item.customerId as
    | { _id?: unknown; name?: string; phone?: string; whatsapp?: string; address?: string }
    | string
    | null;
  const isObj = typeof customer === "object" && customer !== null;
  return {
    ...item,
    customerId: isObj && customer?._id ? String(customer._id) : customer ? String(customer) : null,
    customer: isObj && customer?.name ? customer.name : "",
    customerPhone: isObj ? customer?.phone ?? "" : "",
    customerWhatsapp: isObj ? customer?.whatsapp ?? "" : "",
    customerAddress: isObj ? customer?.address ?? "" : "",
    date: item.date instanceof Date ? (item.date as Date).toISOString().slice(0, 10) : item.date,
  };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    await connectMongo();
    const doc = await Invoice.findOne({ _id: params.id, ...notDeleted }).populate("customerId");
    if (!doc) throw new ApiError(404, "Invoice not found");
    if (!can(user.role, "billing.view.all")) {
      if (!user.employeeId || String(doc.employeeId) !== user.employeeId) throw new ApiError(403, "Forbidden");
    }
    return json(mapInvoice(serializeDoc(doc)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    await connectMongo();
    const body = invoiceInput.partial().parse(await req.json());
    if (body.status === "approved" || body.status === "rejected") {
      await requireCap("billing.approve");
    } else if (!can(user.role, "billing.manage")) {
      throw new ApiError(403, "Forbidden");
    }
    if (body.date) body.date = new Date(body.date as string) as unknown as string;

    // Recompute the total whenever any money-affecting field changes.
    const touchesTotals =
      body.items !== undefined ||
      body.discount !== undefined ||
      body.taxRate !== undefined ||
      body.shipping !== undefined;
    if (touchesTotals) {
      const current = await Invoice.findOne({ _id: params.id, ...notDeleted });
      if (!current) throw new ApiError(404, "Invoice not found");
      (body as Record<string, unknown>).amount = invoiceTotals({
        items: body.items ?? current.items,
        discount: body.discount ?? current.discount,
        taxRate: body.taxRate ?? current.taxRate,
        shipping: body.shipping ?? current.shipping,
      }).total;
    }

    const doc = await Invoice.findOneAndUpdate({ _id: params.id, ...notDeleted }, body, { returnDocument: 'after' }).populate("customerId");
    if (!doc) throw new ApiError(404, "Invoice not found");
    return json(mapInvoice(serializeDoc(doc)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("billing.manage");
    await connectMongo();
    await softDeleteById(Invoice, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
