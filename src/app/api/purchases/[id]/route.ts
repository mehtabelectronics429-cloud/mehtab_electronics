import { Purchase } from "@/lib/db/models/Purchase";
import { Supplier } from "@/lib/db/models/Supplier";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { purchasePaymentInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireCap("purchases.view");
    await connectMongo();
    const doc = await Purchase.findOne({ _id: params.id, ...notDeleted }).populate("supplierId");
    if (!doc) throw new ApiError(404, "Purchase not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

/** Record a payment to the supplier against this purchase. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("purchases.manage");
    await connectMongo();
    const { amount } = purchasePaymentInput.parse(await req.json());

    const doc = await Purchase.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Purchase not found");

    const pay = Math.min(amount, doc.amount - doc.paid);
    if (pay <= 0) throw new ApiError(400, "Nothing left to pay");

    doc.paid += pay;
    doc.status = doc.paid >= doc.amount ? "paid" : "partial";
    await doc.save();

    // Reduce what we owe the supplier.
    await Supplier.findByIdAndUpdate(doc.supplierId, { $inc: { balance: -pay } });

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
