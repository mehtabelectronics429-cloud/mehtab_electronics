import { Product } from "@/lib/db/models/Product";
import { requireCap, errorResponse, ApiError } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Download product catalogue as CSV. */
export async function GET(req: Request) {
  try {
    await requireCap("products.view");
    await connectMongo();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const q = (url.searchParams.get("q") || "").trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (category && category !== "all") filter.category = category;
    if (q) filter.$text = { $search: q };

    const products = await Product.find(filter).sort({ category: 1, brand: 1 }).lean();
    const rows = [
      [
        "Category",
        "Brand",
        "Model",
        "SKU",
        "Barcode",
        "Purchase Price",
        "Selling Price",
        "Stock",
        "Warranty",
        "Description",
      ].join(","),
      ...products.map((p) => {
        const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        return [
          esc(p.category),
          esc(p.brand),
          esc(p.model),
          esc(p.sku),
          esc(p.barcode || ""),
          p.purchasePrice ?? 0,
          p.sellingPrice ?? 0,
          p.stock ?? 0,
          esc(p.warranty || ""),
          esc(p.description || ""),
        ].join(",");
      }),
    ];

    const filename =
      category && category !== "all"
        ? `products-${category.replace(/\s+/g, "-").toLowerCase()}.csv`
        : "products-export.csv";

    return new Response(rows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
