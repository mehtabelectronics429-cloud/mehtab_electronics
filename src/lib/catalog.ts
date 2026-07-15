import { connectMongo } from "@/lib/db/mongodb";
import { Product as ProductModel } from "@/lib/db/models/Product";
import { notDeleted } from "@/lib/db/soft-delete";
import { pkr } from "@/lib/admin/format";
import { img } from "@/lib/utils";
import type { Product } from "@/lib/data";

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
  "solar panels": img("photo-1509391366360-2e959784a276", 1000),
  "solar inverters": img("photo-1581092160562-40aa08e78837", 1000),
  inverters: img("photo-1581092160562-40aa08e78837", 1000),
  batteries: img("photo-1497440001374-f26997328c1b", 1000),
  "security cameras": img("photo-1557597774-9d273605dfa9", 1000),
  "cctv cameras": img("photo-1557597774-9d273605dfa9", 1000),
  "cctv packages": img("photo-1590494165264-1ebe3602eb80", 1000),
  nvr: img("photo-1521791136064-7986c2920216", 1000),
  accessories: img("photo-1613665813446-82a78c468a1d", 1000),
  "networking equipment": img("photo-1518770660439-4636190af475", 1000),
};

const FALLBACK_IMAGE = img("photo-1466611653911-95081537e5b7", 1000);

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
