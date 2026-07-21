import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ProductCard from "@/components/ui/ProductCard";
import Contact from "@/components/sections/Contact";
import {
  getCatalogProducts,
  toMarketingProduct,
  categoryImage,
} from "@/lib/catalog";
import { PRODUCTS as DEFAULT_PRODUCTS, type Product } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/** Public category slugs → catalogue category name + copy. */
const CATEGORIES: Record<
  string,
  { name: string; eyebrow: string; blurb: string }
> = {
  "solar-panels": {
    name: "Solar Panels",
    eyebrow: "Products · Solar",
    blurb:
      "Tier-1 mono-PERC and N-type modules from Longi and JinKO — sized for homes, farms and commercial roofs.",
  },
  inverters: {
    name: "Inverters",
    eyebrow: "Products · Inverters",
    blurb:
      "Hybrid and on-grid inverters from Inverex, itel and Solis — dual MPPT, battery-ready and net-metering compliant.",
  },
  batteries: {
    name: "Batteries",
    eyebrow: "Products · Backup",
    blurb:
      "Lithium (LiFePO4) and deep-cycle tubular batteries for reliable backup and daily solar storage.",
  },
  cameras: {
    name: "Cameras",
    eyebrow: "Products · Security",
    blurb:
      "HD and 4K IP cameras — bullet, dome and PTZ — with night vision, mobile viewing and NVR storage.",
  },
};

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const c = CATEGORIES[params.category];
  if (!c) return { title: "Products — Mehtab Electronics" };
  return { title: `${c.name} — Mehtab Electronics`, description: c.blurb };
}

async function productsForCategory(name: string): Promise<Product[]> {
  // Prefer live catalogue from the admin dashboard; fall back to seeded defaults.
  try {
    const catalog = await getCatalogProducts({ category: name });
    if (catalog.length) return catalog.map(toMarketingProduct);
  } catch (err) {
    console.error("catalog load failed", err);
  }
  return DEFAULT_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === name.toLowerCase(),
  );
}

export default async function ProductCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cfg = CATEGORIES[params.category];
  if (!cfg) notFound();

  const products = await productsForCategory(cfg.name);

  return (
    <main>
      <PageHero
        crumb={cfg.name}
        eyebrow={cfg.eyebrow}
        title={<>{cfg.name}</>}
        subtitle={cfg.blurb}
        image={categoryImage(cfg.name)}
      />

      <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fg/50 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All products
        </Link>

        {products.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-line/15 bg-surface/40 p-10 text-center shadow-card">
            <p className="font-display text-2xl uppercase text-fg">
              Stock updating
            </p>
            <p className="mt-3 text-sm text-fg/60">
              New {cfg.name.toLowerCase()} are being added. Message us for
              current availability and pricing.
            </p>
            <a
              href={waLink(`Hello, I'd like pricing on ${cfg.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand mx-auto mt-6"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </div>
        )}
      </section>

      <Contact />
    </main>
  );
}
