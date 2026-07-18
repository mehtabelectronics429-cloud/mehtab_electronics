import { Category } from "@/lib/db/models/Category";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { categoryInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { slugify } from "@/lib/categories";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    const body = categoryInput.partial().parse(await req.json());
    const update: Record<string, unknown> = { ...body };
    if (body.name && !body.slug) update.slug = slugify(body.name);
    if (body.slug) update.slug = slugify(body.slug);
    const doc = await Category.findOneAndUpdate({ _id: params.id, ...notDeleted }, update, { returnDocument: "after" });
    if (!doc) throw new ApiError(404, "Category not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    await softDeleteById(Category, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
