import { ProductGroup } from "@/lib/db/models/ProductGroup";
import { Product } from "@/lib/db/models/Product";
import {
  requireUser,
  requireCap,
  json,
  errorResponse,
  softDeleteById,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { productGroupInput } from "@/lib/api/schemas";
import { mapGroup } from "@/lib/api/product-groups";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (!can(user.role, "products.view")) throw new ApiError(403, "Forbidden");
    await connectMongo();
    const doc = await ProductGroup.findOne({
      _id: params.id,
      ...notDeleted,
    }).populate("items.productId");
    if (!doc) throw new ApiError(404, "Group not found");
    return json(mapGroup(serializeDoc(doc)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    const body = productGroupInput.partial().parse(await req.json());

    if (body.items) {
      const ids = body.items.map((i) => i.productId);
      const found = await Product.countDocuments({
        _id: { $in: ids },
        ...notDeleted,
      });
      if (found !== new Set(ids).size) {
        throw new ApiError(400, "One or more products no longer exist");
      }
    }

    const doc = await ProductGroup.findOneAndUpdate(
      { _id: params.id, ...notDeleted },
      body,
      { returnDocument: "after" },
    ).populate("items.productId");
    if (!doc) throw new ApiError(404, "Group not found");
    return json(mapGroup(serializeDoc(doc)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    await softDeleteById(ProductGroup, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
