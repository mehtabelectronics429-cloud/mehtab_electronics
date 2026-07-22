import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import ProductCard from "@/components/ui/ProductCard";
import { getCategories } from "@/lib/categories";
import { getCatalogProducts, toMarketingProduct } from "@/lib/catalog";
import { PRODUCTS as DEFAULT_PRODUCTS, type Product } from "@/lib/data";

/**
 * Home "shop" band  categories and featured products, both pulled live from the
 * admin dashboard (Mongo). Falls back to seeded defaults so the section is never
 * empty before the admin adds content.
 */
export default async function HomeCatalog() {
  const categories = await getCategories();

  let products: Product[] = [];
  try {
    const catalog = await getCatalogProducts({ limit: 8 });
    products = catalog.map(toMarketingProduct);
  } catch {
    /* fall through to defaults */
  }
  if (products.length === 0) products = DEFAULT_PRODUCTS;
  const featured = products.slice(0, 6);

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* categories */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono-label">Shop by category</div>
            <h2 className="mt-4 display-lg text-fg">
              Everything you <span className="text-accent">need.</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 items-center gap-1.5 border-b border-brand/60 pb-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:border-brand sm:inline-flex"
          >
            All products <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products/${c.slug}`}
              className="group relative overflow-hidden rounded-lg border border-line/15 shadow-card"
            >
              <div className="relative aspect-[4/3]">
                <SmartImage
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg uppercase tracking-wide text-white">
                    {c.name}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                {c.description && (
                  <div className="mt-1 text-xs text-white/60">
                    {c.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* featured products */}
        {featured.length > 0 && (
          <>
            <div className="mt-20 mono-label">Featured products</div>
            <h3 className="mt-4 display-md text-fg">Popular right now.</h3>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
