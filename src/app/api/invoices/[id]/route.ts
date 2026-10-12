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
import { invoiceInput, invoiceEditInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { Customer } from "@/lib/db/models/Customer";
import { Product } from "@/lib/db/models/Product";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { logActivity } from "@/lib/db/logActivity";
import { syncCustomerBalances } from "@/lib/ledger/server";

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

/** Sources whose sale took the line items' units out of stock. */
const STOCK_SOURCES = new Set(["pos", "complaint"]);

/** Net quantity per catalogue product across a set of lines. */
function qtyByProduct(items: { productId?: unknown; qty: number }[]) {
  const out = new Map<string, number>();
  for (const it of items) {
    if (!it.productId) continue;
    const id = String(it.productId);
    out.set(id, (out.get(id) ?? 0) + (it.qty || 0));
  }
  return out;
}

/**
 * Full edit of an invoice: customer, date, line items, discount / tax /
 * shipping, cost and notes. Keeps stock (for sales that deducted it), the
 * linked ledger entries and customer balances in step with the change.
 */
export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireCap("billing.manage");
    await connectMongo();
    const body = invoiceEditInput.parse(await req.json());
    const invoice = await Invoice.findOne({ _id: params.id, ...notDeleted });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (!can(user.role, "billing.view.all")) {
      if (!user.employeeId || String(invoice.employeeId) !== user.employeeId) throw new ApiError(403, "Forbidden");
    }

    const hasReturns = (invoice.returns ?? []).length > 0;
    const oldCustomerId = String(invoice.customerId);
    const customerChanged = !!body.customerId && body.customerId !== oldCustomerId;
    if (hasReturns && (body.items || customerChanged)) {
      throw new ApiError(400, "This invoice has returns — its line items and customer can no longer be edited.");
    }
    if (customerChanged) {
      const customer = await Customer.findOne({ _id: body.customerId, ...notDeleted });
      if (!customer) throw new ApiError(400, "Invalid customer");
    }

    const oldItems = invoice.items.map((i) => ({
      description: i.description,
      qty: i.qty,
      unitPrice: i.unitPrice,
      productId: i.productId ? String(i.productId) : null,
    }));
    const newItems = body.items
      ? body.items.map((i) => ({
          description: i.description.trim(),
          qty: i.qty,
          unitPrice: i.unitPrice,
          productId: i.productId || null,
        }))
      : oldItems;

    const totals = invoiceTotals({
      items: newItems,
      discount: body.discount ?? invoice.discount,
      taxRate: body.taxRate ?? invoice.taxRate,
      shipping: body.shipping ?? invoice.shipping,
    });
    const total = Math.round(totals.total * 100) / 100;
    const settled = (invoice.paid ?? 0) + (invoice.returnedAmount ?? 0);
    if (total + 0.005 < settled) {
      throw new ApiError(
        400,
        `New total (Rs ${total.toLocaleString("en-PK")}) is less than what was already paid / refunded (Rs ${settled.toLocaleString("en-PK")}).`,
      );
    }

    // Per-product quantity change: positive = more units sold.
    const before = qtyByProduct(oldItems);
    const after = qtyByProduct(newItems);
    const deltas = new Map<string, number>();
    for (const id of new Set([...before.keys(), ...after.keys()])) {
      const d = (after.get(id) ?? 0) - (before.get(id) ?? 0);
      if (d !== 0) deltas.set(id, d);
    }
    const products = deltas.size
      ? await Product.find({ _id: { $in: Array.from(deltas.keys()) } }).select("brand model stock purchasePrice deletedAt")
      : [];
    const productById = new Map(products.map((p) => [String(p._id), p]));

    // Stock: return removed units, take added units — all-or-nothing.
    if (STOCK_SOURCES.has(invoice.source)) {
      for (const [id, d] of deltas) {
        const p = productById.get(id);
        if (d > 0 && (!p || p.deletedAt)) throw new ApiError(400, "A product on this invoice no longer exists");
        if (d > 0 && p!.stock < d) {
          throw new ApiError(
            400,
            `Insufficient stock for ${`${p!.brand} ${p!.model}`.trim()} (available: ${p!.stock}, extra needed: ${d})`,
          );
        }
      }
      const applied: [string, number][] = [];
      for (const [id, d] of deltas) {
        if (!productById.has(id)) continue;
        const updated = await Product.findOneAndUpdate(
          d > 0 ? { _id: id, stock: { $gte: d } } : { _id: id },
          { $inc: { stock: -d } },
        );
        if (!updated) {
          for (const [rid, rd] of applied) await Product.updateOne({ _id: rid }, { $inc: { stock: rd } });
          const p = productById.get(id)!;
          throw new ApiError(400, `Insufficient stock for ${`${p.brand} ${p.model}`.trim()}`);
        }
        applied.push([id, d]);
      }
    }

    // Cost: explicit value wins; otherwise shift it by the purchase price of
    // the units added / removed so any manual material cost is preserved.
    let cost = invoice.cost ?? 0;
    if (body.cost !== undefined && body.cost !== null) {
      cost = body.cost;
    } else if (deltas.size) {
      for (const [id, d] of deltas) cost += (productById.get(id)?.purchasePrice || 0) * d;
      cost = Math.max(0, Math.round(cost * 100) / 100);
    }

    if (body.items) invoice.items = newItems as unknown as typeof invoice.items;
    if (body.discount !== undefined) invoice.discount = body.discount;
    if (body.taxRate !== undefined) invoice.taxRate = body.taxRate;
    if (body.shipping !== undefined) invoice.shipping = body.shipping;
    if (body.notes !== undefined) invoice.notes = body.notes;
    if (body.date) invoice.date = new Date(body.date);
    if (customerChanged) invoice.customerId = body.customerId as unknown as typeof invoice.customerId;
    invoice.amount = total;
    invoice.cost = cost;
    // A pending invoice that is now covered by what was paid becomes approved.
    if (invoice.status === "pending" && total > 0 && settled + 0.005 >= total) invoice.status = "approved";
    await invoice.save();

    // Ledger: the sale entry mirrors the invoice; payments follow the customer.
    const saleUpdate: Record<string, unknown> = { amount: total };
    if (body.items) saleUpdate.items = newItems;
    if (body.date) saleUpdate.date = invoice.date;
    if (customerChanged) saleUpdate.customerId = invoice.customerId;
    await LedgerEntry.updateMany({ invoiceId: invoice._id, type: "invoice", ...notDeleted }, { $set: saleUpdate });
    if (customerChanged) {
      await LedgerEntry.updateMany(
        { invoiceId: invoice._id, type: { $ne: "invoice" }, ...notDeleted },
        { $set: { customerId: invoice.customerId } },
      );
    }
    await syncCustomerBalances([oldCustomerId, String(invoice.customerId)]);

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "edited an invoice",
      target: invoice.number,
      kind: "invoice",
    });

    const populated = await Invoice.findById(invoice._id).populate("customerId");
    return json(mapInvoice(serializeDoc(populated!)));
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
