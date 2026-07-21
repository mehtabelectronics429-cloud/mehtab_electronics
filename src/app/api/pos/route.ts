import { Invoice } from "@/lib/db/models/Invoice";
import { Customer } from "@/lib/db/models/Customer";
import { Product } from "@/lib/db/models/Product";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { requireCap, json, errorResponse, serializeDoc, ApiError } from "@/lib/api/http";
import { posSaleInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

async function nextNumber() {
  const count = await Invoice.countDocuments({});
  return `INV-${2000 + count + 1}`;
}

/** Find (or create) the shared walk-in customer for counter sales. */
async function walkInCustomer() {
  const existing = await Customer.findOne({ name: "Walk-in Customer", ...notDeleted });
  if (existing) return existing;
  return Customer.create({ name: "Walk-in Customer", phone: "-", whatsapp: "-", address: "Counter sale" });
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("pos.use");
    await connectMongo();
    const body = posSaleInput.parse(await req.json());

    const customer = body.customerId
      ? await Customer.findOne({ _id: body.customerId, ...notDeleted })
      : await walkInCustomer();
    if (!customer) throw new ApiError(400, "Invalid customer");

    const totals = invoiceTotals({
      items: body.items.map((i) => ({ qty: i.qty, unitPrice: i.unitPrice })),
      discount: body.discount,
      taxRate: body.taxRate,
      shipping: body.shipping,
    });

    // Cost of goods (for accurate profit) from catalogue purchase prices.
    let cost = 0;
    for (const it of body.items) {
      if (!it.productId) continue;
      const p = await Product.findOne({ _id: it.productId, ...notDeleted });
      if (p) cost += (p.purchasePrice || 0) * it.qty;
    }

    const paid = Math.min(totals.total, body.paid ?? totals.total);
    const fullyPaid = paid >= totals.total;
    const date = body.date ? new Date(body.date) : new Date();

    const invoice = await Invoice.create({
      number: await nextNumber(),
      customerId: customer._id,
      employeeId: user.employeeId || null,
      source: "pos",
      items: body.items.map((i) => ({ description: i.description, qty: i.qty, unitPrice: i.unitPrice })),
      discount: body.discount ?? 0,
      taxRate: body.taxRate ?? 0,
      shipping: body.shipping ?? 0,
      amount: totals.total,
      cost,
      paid,
      status: fullyPaid ? "approved" : "pending",
      date,
    });

    // Decrement stock for catalogue items.
    for (const it of body.items) {
      if (it.productId) await Product.findByIdAndUpdate(it.productId, { $inc: { stock: -it.qty } });
    }

    // Ledger: the sale, then the payment taken at the counter.
    await LedgerEntry.create({
      customerId: customer._id,
      employeeId: user.employeeId || null,
      invoiceId: invoice._id,
      type: "invoice",
      amount: totals.total,
      status: "approved",
      date,
      note: `POS sale ${invoice.number}`,
    });
    if (paid > 0) {
      await LedgerEntry.create({
        customerId: customer._id,
        employeeId: user.employeeId || null,
        invoiceId: invoice._id,
        type: "payment",
        amount: paid,
        status: "approved",
        date,
        note: `POS payment for ${invoice.number}`,
      });
    }

    return json({ ...serializeDoc(invoice), balance: totals.total - paid }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
