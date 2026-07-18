import { connectMongo } from "@/lib/db/mongodb";
import { Category as CategoryModel } from "@/lib/db/models/Category";
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

/** Seeded defaults so the public site always has categories, even before admin adds any. */
export const DEFAULT_CATEGORIES: PublicCategory[] = [
  { id: "d-solar-panels", name: "Solar Panels", slug: "solar-panels", image: categoryImage("Solar Panels"), description: "Tier-1 mono-PERC & N-type modules.", order: 1 },
  { id: "d-inverters", name: "Inverters", slug: "inverters", image: categoryImage("Inverters"), description: "Hybrid & on-grid inverters.", order: 2 },
  { id: "d-batteries", name: "Batteries", slug: "batteries", image: categoryImage("Batteries"), description: "Lithium & tubular backup.", order: 3 },
  { id: "d-cameras", name: "Cameras", slug: "cameras", image: categoryImage("Cameras"), description: "IP & analog CCTV cameras.", order: 4 },
];

/** Server-side category load for the marketing site (no auth). Falls back to defaults. */
export async function getCategories(): Promise<PublicCategory[]> {
  try {
    await connectMongo();
    const docs = await CategoryModel.find(notDeleted).sort("order name").lean();
    if (!docs.length) return DEFAULT_CATEGORIES;
    return docs.map((d) => ({
      id: String(d._id),
      name: d.name ?? "",
      slug: d.slug || slugify(d.name ?? ""),
      image: d.image?.trim() || categoryImage(d.name ?? ""),
      description: d.description ?? "",
      order: Number(d.order ?? 0),
    }));
  } catch (err) {
    console.error("getCategories failed", err);
    return DEFAULT_CATEGORIES;
  }
}
