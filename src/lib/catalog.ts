import { connectMongo } from "@/lib/db/mongodb";
import { Product as ProductModel } from "@/lib/db/models/Product";
import { notDeleted } from "@/lib/db/soft-delete";
import type { Product } from "@/lib/data";
import { SOLAR_PANELS, INVERTERS, BATTERIES, CAMERA } from "@/lib/assets";
import { Types } from "mongoose";

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
  features?: string;
  highlights?: string;
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
  if (item.stock > 0)
    specs.push(item.stock <= 5 ? "Limited stock" : "In stock");
  else specs.push("Inquire availability");

  let badge: string | undefined;
  if (item.stock > 0 && item.stock <= 5) badge = "Limited";
  else if (item.stock > 5) badge = "In stock";

  const features = (item.features || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  const highlights = (item.highlights || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  return {
    id: item.id,
    name,
    category: item.category,
    model: item.model,
    // Public site never shows catalogue prices — enquire via WhatsApp.
    price: undefined,
    description:
      item.description?.trim() ||
      `${name}  tap WhatsApp for pricing and installation details.`,
    specs: specs.slice(0, 4),
    image: item.image?.trim() || categoryImage(item.category),
    badge,
    features,
    highlights,
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
  features?: string;
  highlights?: string;
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
    features: doc.features ?? "",
    highlights: doc.highlights ?? "",
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
    .select(
      "category brand model sellingPrice warranty stock description image features highlights",
    )
    .sort("-createdAt")
    .limit(opts?.limit ?? 200)
    .lean();
  return docs.map(serializeCatalog);
}

export async function getCatalogProductById(
  id: string,
): Promise<CatalogItem | null> {
  await connectMongo();
  const doc = await ProductModel.findOne({ _id: id, ...notDeleted })
    .select(
      "category brand model sellingPrice warranty stock description image features highlights",
    )
    .lean();
  if (!doc) return null;
  return serializeCatalog(doc);
}

/** Related products in the same category (excludes current). */
export async function getRelatedCatalogProducts(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<CatalogItem[]> {
  await connectMongo();
  const docs = await ProductModel.find({
    ...notDeleted,
    category,
    ...(Types.ObjectId.isValid(excludeId)
      ? { _id: { $ne: new Types.ObjectId(excludeId) } }
      : {}),
  })
    .select(
      "category brand model sellingPrice warranty stock description image features highlights",
    )
    .sort("-createdAt")
    .limit(limit)
    .lean();
  return docs.map(serializeCatalog);
}

/** Public site search across brand, model, category, description. */
export async function searchCatalogProducts(
  q: string,
  limit = 48,
): Promise<CatalogItem[]> {
  const term = q.trim();
  if (!term) return [];
  await connectMongo();
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(escaped, "i");
  const docs = await ProductModel.find({
    ...notDeleted,
    $or: [
      { brand: rx },
      { model: rx },
      { category: rx },
      { description: rx },
      { sku: rx },
      { barcode: rx },
    ],
  })
    .select(
      "category brand model sellingPrice warranty stock description image features highlights",
    )
    .sort("-createdAt")
    .limit(limit)
    .lean();
  return docs.map(serializeCatalog);
}
