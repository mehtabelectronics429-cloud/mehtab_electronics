import { Material } from "@/lib/db/models/Material";
import { requireCap, json, errorResponse, parsePagination, paginate, serializeDoc } from "@/lib/api/http";
import { materialInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";

export async function GET(req: Request) {
  try {
    await requireCap("materials.view");
    await connectMongo();
    const p = parsePagination(new URL(req.url));
    const filter: Record<string, unknown> = {};
    if (p.q) filter.name = new RegExp(p.q, "i");
    return json(await paginate(Material, filter, p));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("materials.manage");
    await connectMongo();
    const body = materialInput.parse(await req.json());
    const doc = await Material.create(body);
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
