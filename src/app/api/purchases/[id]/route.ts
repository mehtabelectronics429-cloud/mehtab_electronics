import { Purchase } from "@/lib/db/models/Purchase";
import { Supplier } from "@/lib/db/models/Supplier";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { purchasePaymentInput, purchaseEditInput } from "@/lib/api/schemas";
import { Product } from "@/lib/db/models/Product";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { logActivity } from "@/lib/db/logActivity";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireCap("purchases.view");
    await connectMongo();
    const doc = await Purchase.findOne({ _id: params.id, ...notDeleted }).populate("supplierId");
    if (!doc) throw new ApiError(404, "Purchase not found");
    const s = doc.supplierId as unknown as { _id?: unknown; name?: string } | null;
    const isObj = typeof s === "object" && s !== null;
    return json({
      ...serializeDoc(doc),
      supplierId: isObj && s?._id ? String(s._id) : doc.supplierId ? String(doc.supplierId) : null,
      supplier: isObj && s?.name ? s.name : "",
      date: doc.date instanceof Date ? doc.date.toISOString().slice(0, 10) : doc.date,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Record a payment to the supplier against this purchase. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireCap("purchases.manage");
    await connectMongo();
    const body = await req.json();

    // Invoice URL update (supplier bill upload).
    if (typeof body.invoiceUrl === "string") {
      const doc = await Purchase.findOne({ _id: params.id, ...notDeleted });
      if (!doc) throw new ApiError(404, "Purchase not found");
      doc.invoiceUrl = body.invoiceUrl;
      await doc.save();
      await logActivity({
        actor: user.name,
        actorId: user.id,
        action: "uploaded invoice for",
        target: doc.ref,
        kind: "stock",
      });
      return json(serializeDoc(doc));
    }

    const { amount } = purchasePaymentInput.parse(body);

    const doc = await Purchase.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Purchase not found");

    const pay = Math.min(amount, doc.amount - doc.paid);
    if (pay <= 0) throw new ApiError(400, "Nothing left to pay");

    doc.paid += pay;
    doc.status = doc.paid >= doc.amount ? "paid" : "partial";
    await doc.save();

    // Reduce what we owe the supplier.
    await Supplier.findByIdAndUpdate(doc.supplierId, { $inc: { balance: -pay } });

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "paid supplier for",
      target: doc.ref,
      kind: "payment",
    });

    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * Full edit of a purchase: supplier, bill no., date, line items, charges and
 * notes. Stock received is adjusted by the change in quantities and the
 * supplier balance(s) by the change in what is still owed.
 */
export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireCap("purchases.manage");
    await connectMongo();
    const body = purchaseEditInput.parse(await req.json());
    const doc = await Purchase.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Purchase not found");

    const oldSupplierId = String(doc.supplierId);
    const supplierChanged = !!body.supplierId && body.supplierId !== oldSupplierId;
    if (supplierChanged) {
      const supplier = await Supplier.findOne({ _id: body.supplierId, ...notDeleted });
      if (!supplier) throw new ApiError(400, "Invalid supplier");
    }

    const oldItems = doc.items.map((i) => ({
      productId: i.productId ? String(i.productId) : null,
      name: i.name,
      qty: i.qty,
      unitCost: i.unitCost,
    }));
    const newItems = body.items
      ? body.items.map((i) => ({
          productId: i.productId || null,
          name: i.name.trim(),
          qty: i.qty,
          unitCost: i.unitCost,
        }))
      : oldItems;

    const total =
      Math.round(
        invoiceTotals({
          items: newItems.map((i) => ({ qty: i.qty, unitPrice: i.unitCost })),
          discount: body.discount ?? doc.discount,
          taxRate: body.taxRate ?? doc.taxRate,
          shipping: body.shipping ?? doc.shipping,
        }).total * 100,
      ) / 100;
    if (total + 0.005 < doc.paid) {
      throw new ApiError(
        400,
        `New total (Rs ${total.toLocaleString("en-PK")}) is less than what was already paid (Rs ${doc.paid.toLocaleString("en-PK")}).`,
      );
    }

    // Per-product change in units received: positive = more received.
    const qtyOf = (items: typeof newItems) => {
      const m = new Map<string, number>();
      for (const it of items) if (it.productId) m.set(it.productId, (m.get(it.productId) ?? 0) + it.qty);
      return m;
    };
    const before = qtyOf(oldItems);
    const after = qtyOf(newItems);
    const deltas = new Map<string, number>();
    for (const id of new Set([...before.keys(), ...after.keys()])) {
      const d = (after.get(id) ?? 0) - (before.get(id) ?? 0);
      if (d !== 0) deltas.set(id, d);
    }

    // Removing received units needs them still on the shelf — all-or-nothing.
    const products = deltas.size
      ? await Product.find({ _id: { $in: Array.from(deltas.keys()) } }).select("brand model stock")
      : [];
    const productById = new Map(products.map((p) => [String(p._id), p]));
    for (const [id, d] of deltas) {
      const p = productById.get(id);
      if (d < 0 && p && p.stock < -d) {
        throw new ApiError(
          400,
          `Can't remove ${-d} × ${`${p.brand} ${p.model}`.trim()} — only ${p.stock} left in stock (the rest was already sold).`,
        );
      }
    }
    const applied: [string, number][] = [];
    for (const [id, d] of deltas) {
      if (!productById.has(id)) continue;
      const updated = await Product.findOneAndUpdate(
        d < 0 ? { _id: id, stock: { $gte: -d } } : { _id: id },
        { $inc: { stock: d } },
      );
      if (!updated) {
        for (const [rid, rd] of applied) await Product.updateOne({ _id: rid }, { $inc: { stock: -rd } });
        const p = productById.get(id)!;
        throw new ApiError(400, `Not enough stock left to reduce ${`${p.brand} ${p.model}`.trim()}`);
      }
      applied.push([id, d]);
    }

    // Refresh the purchase price for product lines whose cost changed or were added.
    if (body.items) {
      const oldCost = new Map(oldItems.filter((i) => i.productId).map((i) => [i.productId!, i.unitCost]));
      for (const it of newItems) {
        if (!it.productId || oldCost.get(it.productId) === it.unitCost) continue;
        await Product.updateOne({ _id: it.productId }, { $set: { purchasePrice: it.unitCost } });
      }
    }

    // Supplier balance tracks the unpaid amount of this purchase.
    const oldOwed = doc.amount - doc.paid;
    const newOwed = total - doc.paid;
    if (supplierChanged) {
      await Supplier.findByIdAndUpdate(oldSupplierId, { $inc: { balance: -oldOwed } });
      await Supplier.findByIdAndUpdate(body.supplierId, { $inc: { balance: newOwed } });
    } else if (newOwed !== oldOwed) {
      await Supplier.findByIdAndUpdate(oldSupplierId, { $inc: { balance: newOwed - oldOwed } });
    }

    if (body.items) doc.items = newItems as unknown as typeof doc.items;
    if (body.discount !== undefined) doc.discount = body.discount;
    if (body.taxRate !== undefined) doc.taxRate = body.taxRate;
    if (body.shipping !== undefined) doc.shipping = body.shipping;
    if (body.supplierInvoiceNo !== undefined) doc.supplierInvoiceNo = body.supplierInvoiceNo;
    if (body.notes !== undefined) doc.notes = body.notes;
    if (body.date) doc.date = new Date(body.date);
    if (supplierChanged) doc.supplierId = body.supplierId as unknown as typeof doc.supplierId;
    doc.amount = total;
    doc.status = doc.paid <= 0 ? "unpaid" : doc.paid >= total ? "paid" : "partial";
    await doc.save();

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "edited purchase",
      target: doc.ref,
      kind: "stock",
    });

    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("purchases.manage");
    await connectMongo();
    await softDeleteById(Purchase, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
