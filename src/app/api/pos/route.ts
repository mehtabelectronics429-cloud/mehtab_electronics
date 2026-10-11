import { Invoice } from "@/lib/db/models/Invoice";
import { Customer } from "@/lib/db/models/Customer";
import { Product } from "@/lib/db/models/Product";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { requireCap, json, errorResponse, serializeDoc, ApiError } from "@/lib/api/http";
import { posSaleInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { logActivity } from "@/lib/db/logActivity";
import { syncCustomerBalance } from "@/lib/ledger/server";

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
    const isWalkIn = !body.customerId;
    // Bring the stored balance in line with the ledger before taking money against it.
    const previousBalance = isWalkIn ? 0 : await syncCustomerBalance(customer._id);

    const totals = invoiceTotals({
      items: body.items.map((i) => ({ qty: i.qty, unitPrice: i.unitPrice })),
      discount: body.discount,
      taxRate: body.taxRate,
      shipping: body.shipping,
    });

    // Validate stock and compute cost of goods from catalogue purchase prices.
    let cost = 0;
    const stockChecks: { productId: string; name: string; qty: number; stock: number }[] = [];
    for (const it of body.items) {
      if (!it.productId) continue;
      const p = await Product.findOne({ _id: it.productId, ...notDeleted });
      if (!p) throw new ApiError(400, `Product not found for line "${it.description}"`);
      if (p.stock < it.qty) {
        throw new ApiError(
          400,
          `Insufficient stock for ${p.brand} ${p.model}`.trim() +
            ` (available: ${p.stock}, requested: ${it.qty})`,
        );
      }
      stockChecks.push({
        productId: String(p._id),
        name: `${p.brand} ${p.model}`.trim(),
        qty: it.qty,
        stock: p.stock,
      });
      cost += (p.purchasePrice || 0) * it.qty;
    }

    const paid = Math.min(totals.total, body.paid ?? totals.total);
    const fullyPaid = paid >= totals.total;
    // Walk-in is a shared counter account — credit must go on a named customer.
    if (isWalkIn && !fullyPaid) {
      throw new ApiError(400, "Walk-in sales must be paid in full. Select a customer to sell on credit.");
    }
    // Extra cash towards the old balance only once this sale is fully paid.
    const balancePayment =
      !isWalkIn && fullyPaid
        ? Math.round(Math.min(Math.max(0, previousBalance), body.balancePayment ?? 0) * 100) / 100
        : 0;
    const date = body.date ? new Date(body.date) : new Date();

    const invoice = await Invoice.create({
      number: await nextNumber(),
      customerId: customer._id,
      employeeId: user.employeeId || null,
      source: "pos",
      items: body.items.map((i) => ({
        description: i.description,
        qty: i.qty,
        unitPrice: i.unitPrice,
        productId: i.productId || null,
      })),
      discount: body.discount ?? 0,
      taxRate: body.taxRate ?? 0,
      shipping: body.shipping ?? 0,
      amount: totals.total,
      cost,
      paid,
      status: fullyPaid ? "approved" : "pending",
      date,
    });

    // Decrement stock atomically — only if enough units remain.
    for (const it of stockChecks) {
      const updated = await Product.findOneAndUpdate(
        { _id: it.productId, stock: { $gte: it.qty }, ...notDeleted },
        { $inc: { stock: -it.qty } },
        { returnDocument: "after" },
      );
      if (!updated) {
        throw new ApiError(400, `Insufficient stock for ${it.name}`);
      }
    }

    // Ledger: the sale (with its goods lines), the payment taken at the
    // counter, then any extra paid against the previous balance.
    const unitCount = body.items.reduce((s, i) => s + i.qty, 0);
    await LedgerEntry.create({
      customerId: customer._id,
      employeeId: user.employeeId || null,
      invoiceId: invoice._id,
      type: "invoice",
      amount: totals.total,
      status: "approved",
      date,
      note: `POS sale ${invoice.number} · ${unitCount} item${unitCount === 1 ? "" : "s"}`,
      items: body.items.map((i) => ({
        productId: i.productId || null,
        description: i.description,
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
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
    if (balancePayment > 0) {
      await LedgerEntry.create({
        customerId: customer._id,
        employeeId: user.employeeId || null,
        invoiceId: null,
        type: "payment",
        amount: balancePayment,
        status: "approved",
        date,
        note: `Payment against previous balance (at POS, ${invoice.number})`,
      });
    }
    const newBalance = await syncCustomerBalance(customer._id);

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "recorded a POS sale",
      target: `${invoice.number} · ${customer.name}`,
      kind: "invoice",
    });

    return json(
      {
        ...serializeDoc(invoice),
        balance: totals.total - paid,
        previousBalance,
        balancePayment,
        customerBalance: newBalance,
      },
      201,
    );
  } catch (err) {
    return errorResponse(err);
  }
}
