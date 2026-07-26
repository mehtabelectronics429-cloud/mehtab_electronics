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
import { getCategoryBySlug } from "@/lib/categories";
import type { Product } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const c = await getCategoryBySlug(params.category);
  if (!c) return { title: "Products  Mehtab Electronics" };
  return {
    title: `${c.name}  Mehtab Electronics`,
    description: c.description || `${c.name} from Mehtab Electronics.`,
  };
}

async function productsForCategory(name: string): Promise<Product[]> {
  try {
    const catalog = await getCatalogProducts({ category: name });
    return catalog.map(toMarketingProduct);
  } catch (err) {
    console.error("catalog load failed", err);
    return [];
  }
}

export default async function ProductCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cfg = await getCategoryBySlug(params.category);
  if (!cfg) notFound();

  const products = await productsForCategory(cfg.name);

  return (
    <main>
      <PageHero
        crumb={cfg.name}
        eyebrow={`Products · ${cfg.name}`}
        title={<>{cfg.name}</>}
        subtitle={
          cfg.description ||
          `Browse ${cfg.name.toLowerCase()} from Mehtab Electronics.`
        }
        image={cfg.image || categoryImage(cfg.name)}
      />

      <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fg/50 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All products
        </Link>

        {products.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
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
