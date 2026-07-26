import { Product } from "@/lib/db/models/Product";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { json, errorResponse } from "@/lib/api/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public read-only product catalog for the marketing site. Omits purchasePrice. */
export async function GET(req: Request) {
  try {
    await connectMongo();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(
      200,
      Math.max(1, Number(url.searchParams.get("limit") || 100)),
    );
    const filter: Record<string, unknown> = { ...notDeleted };
    if (category && category !== "all") filter.category = category;
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [
        { brand: rx },
        { model: rx },
        { category: rx },
        { description: rx },
        { sku: rx },
        { barcode: rx },
      ];
    }

    const docs = await Product.find(filter)
      .select(
        "category brand model warranty stock description image features highlights createdAt",
      )
      .sort("-createdAt")
      .limit(limit)
      .lean();

    const items = docs.map((d) => ({
      id: String(d._id),
      category: d.category,
      brand: d.brand,
      model: d.model,
      warranty: d.warranty ?? "",
      stock: d.stock ?? 0,
      description: d.description ?? "",
      image: d.image ?? "",
      features: d.features ?? "",
      highlights: d.highlights ?? "",
    }));

    return json({ items, total: items.length });
  } catch (err) {
    return errorResponse(err);
  }
}
