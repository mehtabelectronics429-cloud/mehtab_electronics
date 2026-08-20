import { Types } from "mongoose";
import {
  Invoice,
  type IInvoiceReturnItem,
} from "@/lib/db/models/Invoice";
import { Product } from "@/lib/db/models/Product";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { saleReturnInput } from "@/lib/api/schemas";
import { returnRefund } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { logActivity } from "@/lib/db/logActivity";

type Ctx = { params: { id: string } };

/**
 * Record a customer return against a sale invoice (a credit note with a cash
 * refund). Standard rules enforced here:
 *  - Manager/admin only (billing.approve).
 *  - Only finalised sales (approved / pending) can be returned.
 *  - Cannot return more units than were sold, net of prior returns.
 *  - A reason is required.
 *  - Resalable units are added back to stock (per-line toggle); their COGS is
 *    reversed. Damaged (non-restocked) units are written off — cost stays.
 * Reporting stays accurate because revenue/COGS/collected are netted by the
 * invoice's returnedAmount / returnedCost fields.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireCap("billing.approve");
    await connectMongo();
    const body = saleReturnInput.parse(await req.json());

    const invoice = await Invoice.findOne({ _id: params.id, ...notDeleted });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status !== "approved" && invoice.status !== "pending") {
      throw new ApiError(
        400,
        `Only finalised sales can be returned (this invoice is ${invoice.status}).`,
      );
    }

    // Units already returned per original line index.
    const returnedByIndex = new Map<number, number>();
    for (const ret of invoice.returns ?? []) {
      for (const it of ret.items ?? []) {
        returnedByIndex.set(
          it.index,
          (returnedByIndex.get(it.index) ?? 0) + it.qty,
        );
      }
    }

    const returnItems: IInvoiceReturnItem[] = [];

    for (const line of body.items) {
      const orig = invoice.items[line.index];
      if (!orig) throw new ApiError(400, `Invalid line index ${line.index}`);
      const alreadyReturned = returnedByIndex.get(line.index) ?? 0;
      const remaining = orig.qty - alreadyReturned;
      if (line.qty > remaining + 1e-9) {
        throw new ApiError(
          400,
          `Cannot return ${line.qty} × "${orig.description}" — only ${remaining} left to return.`,
        );
      }
      // Fold this line into the running tally so repeated indices in the same
      // request can't collectively exceed what's returnable.
      returnedByIndex.set(line.index, alreadyReturned + line.qty);
      // Restock only when the line is linked to a product and marked resalable.
      const restock = line.restock !== false && !!orig.productId;
      returnItems.push({
        index: line.index,
        description: orig.description,
        qty: line.qty,
        unitPrice: orig.unitPrice,
        restock,
        productId: orig.productId ?? null,
      });
    }

    const { refund } = returnRefund(invoice, returnItems);

    // Restock resalable units and reverse their COGS from the goods' cost.
    let restockedCost = 0;
    for (const it of returnItems) {
      if (!it.restock || !it.productId) continue;
      const product = await Product.findOneAndUpdate(
        { _id: it.productId, ...notDeleted },
        { $inc: { stock: it.qty } },
        { returnDocument: "after" },
      );
      if (product) restockedCost += (product.purchasePrice || 0) * it.qty;
    }

    const number = `${invoice.number}/R${(invoice.returns?.length ?? 0) + 1}`;
    const date = new Date();

    invoice.returns.push({
      number,
      date,
      reason: body.reason,
      note: body.note ?? "",
      refund,
      restockedCost,
      employeeId: user.employeeId ? new Types.ObjectId(user.employeeId) : null,
      items: returnItems,
    });
    invoice.returnedAmount = (invoice.returnedAmount || 0) + refund;
    invoice.returnedCost = (invoice.returnedCost || 0) + restockedCost;
    await invoice.save();

    // Ledger trace of the cash refund (customer receivable is unaffected — cash
    // out neutralises the goods coming back, so customer.balance is untouched).
    if (refund > 0) {
      await LedgerEntry.create({
        customerId: invoice.customerId,
        employeeId: user.employeeId || null,
        invoiceId: invoice._id,
        type: "credit",
        amount: -refund,
        status: "approved",
        date,
        note: `Cash refund — return ${number} (${body.reason})`,
      });
    }

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "recorded a sale return",
      target: `${number} · refund Rs ${refund.toLocaleString("en-PK")}`,
      kind: "invoice",
    });

    return json(
      { ...serializeDoc(invoice), returnNumber: number, refund, restockedCost },
      201,
    );
  } catch (err) {
    return errorResponse(err);
  }
}
