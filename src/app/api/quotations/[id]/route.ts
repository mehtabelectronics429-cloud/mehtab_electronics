import { Quotation } from "@/lib/db/models/Quotation";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  softDeleteById,
  ApiError,
} from "@/lib/api/http";
import { quotationInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { quotationTotal, toQuotationUpdate } from "../normalize";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireCap("installations.manage");
    await connectMongo();
    const doc = await Quotation.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Quotation not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireCap("installations.manage");
    await connectMongo();
    const body = quotationInput.partial().parse(await req.json());
    const existing = await Quotation.findOne({ _id: params.id, ...notDeleted });
    if (!existing) throw new ApiError(404, "Quotation not found");
    const update = toQuotationUpdate(body);
    update.total = quotationTotal({
      items: body.items ?? existing.items,
      discount: body.discount ?? existing.discount,
      taxRate: body.taxRate ?? existing.taxRate,
      shipping: body.shipping ?? existing.shipping,
    });
    const doc = await Quotation.findOneAndUpdate(
      { _id: params.id, ...notDeleted },
      update,
      { returnDocument: "after" },
    );
    if (!doc) throw new ApiError(404, "Quotation not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireCap("installations.manage");
    await connectMongo();
    await softDeleteById(Quotation, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
