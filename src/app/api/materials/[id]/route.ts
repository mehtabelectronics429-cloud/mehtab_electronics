import { Material } from "@/lib/db/models/Material";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { materialInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireCap("materials.view");
    await connectMongo();
    const doc = await Material.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Material not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("materials.manage");
    await connectMongo();
    const body = materialInput.partial().parse(await req.json());
    const doc = await Material.findOneAndUpdate({ _id: params.id, ...notDeleted }, body, { returnDocument: 'after' });
    if (!doc) throw new ApiError(404, "Material not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("materials.manage");
    await connectMongo();
    await softDeleteById(Material, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
