import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, CheckCircle2 } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SmartImage from "@/components/ui/SmartImage";
import Contact from "@/components/sections/Contact";
import {
  getCatalogProductById,
  categoryImage,
  toMarketingProduct,
} from "@/lib/catalog";
import { waLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const item = await getCatalogProductById(params.id);
  if (!item) return { title: "Product  Mehtab Electronics" };
  return {
    title: `${item.brand} ${item.model}  Mehtab Electronics`,
    description: item.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getCatalogProductById(params.id);
  if (!item) notFound();
  const product = toMarketingProduct(item);

  return (
    <main>
      <PageHero
        crumb="Products"
        eyebrow="Product detail"
        title={<>{product.name}</>}
        subtitle={product.description}
        image={product.image || categoryImage(product.category)}
      />

      <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-fg/50 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-line/15 bg-surface/60 p-4 shadow-card">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <SmartImage
                src={product.image}
                alt={product.name}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-line/15 bg-surface/70 p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-cyan">
                  {product.category}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-fg/60">
                  {product.model}
                </span>
              </div>
              <h2 className="mt-5 font-display text-2xl text-fg">
                Built for reliable performance and easy installation.
              </h2>
              <p className="mt-3 text-sm leading-7 text-fg/65">
                {product.description}
              </p>
              {product.price && (
                <p className="mt-4 text-lg font-semibold text-cyan">
                  {product.price}
                </p>
              )}
              <a
                href={waLink(
                  `Hello, I would like pricing and details for ${product.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="sheen mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-[#052e16]"
              >
                <MessageCircle className="h-4 w-4" /> Ask for pricing
              </a>
            </div>

            <div className="rounded-[1.75rem] border border-line/15 bg-surface/70 p-6 shadow-card">
              <h3 className="font-display text-lg text-fg">Key features</h3>
              <ul className="mt-4 space-y-3 text-sm text-fg/70">
                {(product.features && product.features.length > 0
                  ? product.features
                  : product.specs
                ).map((entry) => (
                  <li key={entry} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <div className="rounded-[1.75rem] border border-line/15 bg-surface/70 p-6 shadow-card">
                <h3 className="font-display text-lg text-fg">
                  Why buyers choose it
                </h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {product.highlights.map((entry) => (
                    <li
                      key={entry}
                      className="rounded-xl border border-line/10 bg-white/5 px-3 py-2 text-sm text-fg/70"
                    >
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
