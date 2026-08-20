import { ProductGroup } from "@/lib/db/models/ProductGroup";
import { Product } from "@/lib/db/models/Product";
import {
  requireUser,
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { productGroupInput } from "@/lib/api/schemas";
import { mapGroup } from "@/lib/api/product-groups";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "products.view")) throw new ApiError(403, "Forbidden");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const filter: Record<string, unknown> = {};
    if (url.searchParams.get("active") === "true") filter.active = true;
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.name = rx;
    }
    const result = await paginate(ProductGroup, filter, {
      ...p,
      populate: "items.productId",
    });
    return json({ ...result, items: result.items.map(mapGroup) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    const body = productGroupInput.parse(await req.json());

    // Validate every referenced product exists.
    const ids = body.items.map((i) => i.productId);
    const found = await Product.countDocuments({ _id: { $in: ids }, ...notDeleted });
    if (found !== new Set(ids).size) {
      throw new ApiError(400, "One or more products no longer exist");
    }

    const doc = await ProductGroup.create({
      name: body.name,
      description: body.description ?? "",
      active: body.active ?? true,
      items: body.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    });
    const populated = await ProductGroup.findById(doc._id).populate(
      "items.productId",
    );
    return json(mapGroup(serializeDoc(populated!)), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
