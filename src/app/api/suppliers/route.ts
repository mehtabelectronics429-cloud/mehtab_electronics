import { Supplier } from "@/lib/db/models/Supplier";
import { requireCap, json, errorResponse, parsePagination, paginate, serializeDoc } from "@/lib/api/http";
import { supplierInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

export async function GET(req: Request) {
  try {
    await requireCap("suppliers.view");
    await connectMongo();
    const p = parsePagination(new URL(req.url));
    const filter: Record<string, unknown> = { ...notDeleted };
    if (p.q) {
      filter.$or = [
        { name: new RegExp(p.q, "i") },
        { company: new RegExp(p.q, "i") },
        { phone: new RegExp(p.q, "i") },
      ];
    }
    return json(await paginate(Supplier, filter, { ...p, sort: "name" }));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("suppliers.manage");
    await connectMongo();
    const body = supplierInput.parse(await req.json());
    const doc = await Supplier.create({ ...body, balance: body.balance ?? 0 });
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
