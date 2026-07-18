import { Category } from "@/lib/db/models/Category";
import { requireCap, json, errorResponse, parsePagination, paginate, serializeDoc } from "@/lib/api/http";
import { categoryInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { slugify } from "@/lib/categories";

export async function GET(req: Request) {
  try {
    await requireCap("products.view");
    await connectMongo();
    const p = parsePagination(new URL(req.url));
    const filter: Record<string, unknown> = {};
    if (p.q) filter.name = new RegExp(p.q, "i");
    return json(await paginate(Category, filter, { ...p, sort: "order name" }));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    const body = categoryInput.parse(await req.json());
    const slug = body.slug?.trim() || slugify(body.name);
    const doc = await Category.create({ ...body, slug });
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
