import { Product } from "@/lib/db/models/Product";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { productInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireCap("products.view");
    await connectMongo();
    const doc = await Product.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Product not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    const body = productInput.partial().parse(await req.json());
    const doc = await Product.findOneAndUpdate({ _id: params.id, ...notDeleted }, body, { returnDocument: 'after' });
    if (!doc) throw new ApiError(404, "Product not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    await softDeleteById(Product, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
