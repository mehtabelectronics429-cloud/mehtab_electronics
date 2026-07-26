import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ProductCard from "@/components/ui/ProductCard";
import Contact from "@/components/sections/Contact";
import { searchCatalogProducts, toMarketingProduct } from "@/lib/catalog";
import { HERO_INVERTER } from "@/lib/assets";
import SiteSearchForm from "@/components/sections/SiteSearchForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search  Mehtab Electronics",
  description: "Search products and categories across Mehtab Electronics.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || "").trim();
  const results = q
    ? (await searchCatalogProducts(q)).map(toMarketingProduct)
    : [];

  return (
    <main>
      <PageHero
        crumb="Search"
        eyebrow="Find anything"
        title={
          q ? (
            <>
              Results for <span className="text-gradient">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            <>Search the catalogue</>
          )
        }
        subtitle={
          q
            ? `${results.length} product${results.length === 1 ? "" : "s"} matched.`
            : "Search by brand, model, category or keyword."
        }
        image={HERO_INVERTER}
      />

      <section className="relative mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <SiteSearchForm initialQuery={q} />

        {!q ? (
          <p className="mt-10 text-center text-sm text-fg/50">
            Type a keyword above to search products from the live catalogue.
          </p>
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-lg border border-line/15 bg-surface/40 p-10 text-center shadow-card">
            <Search className="mx-auto h-8 w-8 text-fg/30" />
            <p className="mt-4 font-display text-xl uppercase text-fg">
              No matches
            </p>
            <p className="mt-2 text-sm text-fg/60">
              Try another keyword, or browse the full{" "}
              <Link href="/products" className="text-brand underline">
                product catalogue
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <Contact />
    </main>
  );
}
