import { connectMongo } from "@/lib/db/mongodb";
import { Category as CategoryModel } from "@/lib/db/models/Category";
import { Product as ProductModel } from "@/lib/db/models/Product";
import { notDeleted } from "@/lib/db/soft-delete";
import { categoryImage } from "@/lib/catalog";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
};

/** kebab-case slug from a display name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Server-side categories from admin (Category collection), else distinct product categories. */
export async function getCategories(): Promise<PublicCategory[]> {
  try {
    await connectMongo();
    const docs = await CategoryModel.find(notDeleted).sort("order name").lean();
    if (docs.length) {
      return docs.map((d) => ({
        id: String(d._id),
        name: d.name ?? "",
        slug: d.slug || slugify(d.name ?? ""),
        image: d.image?.trim() || categoryImage(d.name ?? ""),
        description: d.description ?? "",
        order: Number(d.order ?? 0),
      }));
    }

    const names = (await ProductModel.distinct("category", {
      ...notDeleted,
    })) as string[];
    return names
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((name, i) => ({
        id: slugify(name),
        name,
        slug: slugify(name),
        image: categoryImage(name),
        description: "",
        order: i + 1,
      }));
  } catch (err) {
    console.error("getCategories failed", err);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<PublicCategory | null> {
  const categories = await getCategories();
  const lower = slug.trim().toLowerCase();
  return (
    categories.find(
      (c) => c.slug === lower || slugify(c.name) === lower,
    ) ?? null
  );
}
