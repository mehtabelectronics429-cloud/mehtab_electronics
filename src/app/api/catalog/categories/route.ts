import { Category } from "@/lib/db/models/Category";
import { Product } from "@/lib/db/models/Product";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { json, errorResponse } from "@/lib/api/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Public categories for marketing navbar / product pages. */
export async function GET() {
  try {
    await connectMongo();
    const cats = await Category.find({ ...notDeleted })
      .sort({ order: 1, name: 1 })
      .lean();

    // If admin categories exist, use them; otherwise derive from products.
    if (cats.length) {
      return json({
        items: cats.map((c) => ({
          id: String(c._id),
          name: c.name,
          slug: c.slug || slugify(c.name),
          image: c.image || "",
          description: c.description || "",
        })),
      });
    }

    const names = await Product.distinct("category", { ...notDeleted });
    return json({
      items: (names as string[])
        .filter(Boolean)
        .sort()
        .map((name) => ({
          id: slugify(name),
          name,
          slug: slugify(name),
          image: "",
          description: "",
        })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
