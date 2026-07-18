import { connectMongo } from "@/lib/db/mongodb";
import { Product as ProductModel } from "@/lib/db/models/Product";
import { notDeleted } from "@/lib/db/soft-delete";
import { pkr } from "@/lib/admin/format";
import type { Product } from "@/lib/data";
import { SOLAR_PANELS, INVERTERS, BATTERIES, CAMERA } from "@/lib/assets";

/** Safe public catalog fields (never expose purchasePrice). */
export type CatalogItem = {
  id: string;
  category: string;
  brand: string;
  model: string;
  sellingPrice: number;
  warranty: string;
  stock: number;
  description: string;
  image?: string;
};

const CATEGORY_IMAGES: Record<string, string> = {
  "solar panels": SOLAR_PANELS[0],
  "solar inverters": INVERTERS[0],
  inverters: INVERTERS[0],
  batteries: BATTERIES[0],
  cameras: CAMERA,
  "security cameras": CAMERA,
  "cctv cameras": CAMERA,
  "cctv packages": CAMERA,
  accessories: SOLAR_PANELS[5],
};

const FALLBACK_IMAGE = SOLAR_PANELS[2];

export function categoryImage(category: string) {
  return CATEGORY_IMAGES[category.trim().toLowerCase()] ?? FALLBACK_IMAGE;
}

export function toMarketingProduct(item: CatalogItem): Product {
  const name = `${item.brand} ${item.model}`.trim();
  const specs: string[] = [];
  if (item.warranty) {
    const w = item.warranty.trim();
    specs.push(/warranty/i.test(w) ? w : `${w} warranty`);
  }
  if (item.stock > 0) specs.push(item.stock <= 5 ? "Limited stock" : "In stock");
  else specs.push("Inquire availability");

  let badge: string | undefined;
  if (item.stock > 0 && item.stock <= 5) badge = "Limited";
  else if (item.stock > 5) badge = "In stock";

  return {
    id: item.id,
    name,
    category: item.category,
    model: item.model,
    price: item.sellingPrice > 0 ? pkr(item.sellingPrice) : undefined,
    description:
      item.description?.trim() ||
      `${name} — tap WhatsApp for pricing and installation details.`,
    specs: specs.slice(0, 4),
    image: item.image?.trim() || categoryImage(item.category),
    badge,
  };
}

function serializeCatalog(doc: {
  _id: unknown;
  category?: string;
  brand?: string;
  model?: string;
  sellingPrice?: number;
  warranty?: string;
  stock?: number;
  description?: string;
  image?: string;
}): CatalogItem {
  return {
    id: String(doc._id),
    category: doc.category ?? "",
    brand: doc.brand ?? "",
    model: doc.model ?? "",
    sellingPrice: Number(doc.sellingPrice ?? 0),
    warranty: doc.warranty ?? "",
    stock: Number(doc.stock ?? 0),
    description: doc.description ?? "",
    image: doc.image,
  };
}

/** Server-side catalog load for the marketing site (no auth). */
export async function getCatalogProducts(opts?: {
  category?: string;
  limit?: number;
}): Promise<CatalogItem[]> {
  await connectMongo();
  const filter: Record<string, unknown> = { ...notDeleted };
  if (opts?.category && opts.category !== "all" && opts.category !== "All") {
    filter.category = opts.category;
  }
  const docs = await ProductModel.find(filter)
    .select("category brand model sellingPrice warranty stock description image")
    .sort("-createdAt")
    .limit(opts?.limit ?? 200)
    .lean();
  return docs.map(serializeCatalog);
}
