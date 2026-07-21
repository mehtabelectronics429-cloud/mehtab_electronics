import { Supplier } from "@/lib/db/models/Supplier";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { supplierInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireCap("suppliers.view");
    await connectMongo();
    const doc = await Supplier.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Supplier not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("suppliers.manage");
    await connectMongo();
    const body = supplierInput.partial().parse(await req.json());
    const doc = await Supplier.findOneAndUpdate({ _id: params.id, ...notDeleted }, body, { returnDocument: "after" });
    if (!doc) throw new ApiError(404, "Supplier not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("suppliers.manage");
    await connectMongo();
    await softDeleteById(Supplier, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
