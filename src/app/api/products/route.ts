import { Product } from "@/lib/db/models/Product";
import { requireCap, json, errorResponse, parsePagination, paginate, serializeDoc } from "@/lib/api/http";
import { productInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";

export async function GET(req: Request) {
  try {
    await requireCap("products.view");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const category = url.searchParams.get("category");
    const filter: Record<string, unknown> = {};
    if (category && category !== "all") filter.category = category;
    if (p.q) filter.$text = { $search: p.q };
    return json(await paginate(Product, filter, p));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("products.manage");
    await connectMongo();
    const body = productInput.parse(await req.json());
    const doc = await Product.create(body);
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
