import { Purchase } from "@/lib/db/models/Purchase";
import { Supplier } from "@/lib/db/models/Supplier";
import { Product } from "@/lib/db/models/Product";
import { requireCap, json, errorResponse, parsePagination, paginate, serializeDoc, ApiError } from "@/lib/api/http";
import { purchaseInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

async function nextRef() {
  const count = await Purchase.countDocuments({});
  return `PUR-${3000 + count + 1}`;
}

function mapPurchase(item: Record<string, unknown>) {
  const s = item.supplierId as { _id?: unknown; name?: string } | string | null;
  const isObj = typeof s === "object" && s !== null;
  return {
    ...item,
    supplierId: isObj && s?._id ? String(s._id) : s ? String(s) : null,
    supplier: isObj && s?.name ? s.name : "",
    date: item.date instanceof Date ? (item.date as Date).toISOString().slice(0, 10) : item.date,
  };
}

export async function GET(req: Request) {
  try {
    await requireCap("purchases.view");
    await connectMongo();
    const p = parsePagination(new URL(req.url));
    const filter: Record<string, unknown> = { ...notDeleted };
    if (p.q) filter.$or = [{ ref: new RegExp(p.q, "i") }, { supplierInvoiceNo: new RegExp(p.q, "i") }];
    const result = await paginate(Purchase, filter, { ...p, sort: "-date", populate: "supplierId" });
    return json({ ...result, items: result.items.map(mapPurchase) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("purchases.manage");
    await connectMongo();
    const body = purchaseInput.parse(await req.json());

    const supplier = await Supplier.findOne({ _id: body.supplierId, ...notDeleted });
    if (!supplier) throw new ApiError(400, "Invalid supplier");

    const totals = invoiceTotals({
      items: body.items.map((i) => ({ qty: i.qty, unitPrice: i.unitCost })),
      discount: body.discount,
      taxRate: body.taxRate,
      shipping: body.shipping,
    });
    const paid = Math.min(totals.total, body.paid ?? 0);
    const status = paid <= 0 ? "unpaid" : paid >= totals.total ? "paid" : "partial";

    const doc = await Purchase.create({
      ref: body.ref || (await nextRef()),
      supplierId: supplier._id,
      supplierInvoiceNo: body.supplierInvoiceNo || "",
      items: body.items.map((i) => ({ productId: i.productId || null, name: i.name, qty: i.qty, unitCost: i.unitCost })),
      discount: body.discount ?? 0,
      taxRate: body.taxRate ?? 0,
      shipping: body.shipping ?? 0,
      amount: totals.total,
      paid,
      status,
      date: new Date(body.date),
      notes: body.notes || "",
    });

    // Receiving stock: increment product stock and refresh the latest purchase cost.
    for (const it of body.items) {
      if (!it.productId) continue;
      await Product.findByIdAndUpdate(it.productId, {
        $inc: { stock: it.qty },
        $set: { purchasePrice: it.unitCost },
      });
    }

    // Increase what we owe this supplier by the unpaid balance.
    await Supplier.findByIdAndUpdate(supplier._id, { $inc: { balance: totals.total - paid } });

    const populated = await Purchase.findById(doc._id).populate("supplierId");
    return json(mapPurchase(serializeDoc(populated!)), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
