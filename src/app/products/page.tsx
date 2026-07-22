import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ProductsCatalog from "@/components/sections/ProductsCatalog";
import SmartImage from "@/components/ui/SmartImage";
import Contact from "@/components/sections/Contact";
import { getCatalogProducts, toMarketingProduct } from "@/lib/catalog";
import { PRODUCTS as DEFAULT_PRODUCTS, type Product } from "@/lib/data";
import {
  SOLAR_PANELS,
  INVERTERS,
  BATTERIES,
  CAMERA,
  HERO_INVERTER,
} from "@/lib/assets";

export const metadata: Metadata = {
  title: "Products  Mehtab Electronics",
  description:
    "Solar panels, inverters, batteries and CCTV cameras  genuine, warrantied, with instant WhatsApp inquiry.",
};

export const dynamic = "force-dynamic";

const CATEGORY_CARDS = [
  { slug: "solar-panels", name: "Solar Panels", image: SOLAR_PANELS[0] },
  { slug: "inverters", name: "Inverters", image: INVERTERS[0] },
  { slug: "batteries", name: "Batteries", image: BATTERIES[0] },
  { slug: "cameras", name: "Cameras", image: CAMERA },
];

export default async function ProductsPage() {
  let products: Product[] = [];
  try {
    const catalog = await getCatalogProducts();
    products = catalog.map(toMarketingProduct);
  } catch (err) {
    console.error("Failed to load product catalog", err);
  }
  // Seeded defaults so the catalogue is never empty before admin adds stock.
  if (products.length === 0) products = DEFAULT_PRODUCTS;

  return (
    <main>
      <PageHero
        crumb="Products"
        eyebrow="The catalogue"
        title={
          <>
            Genuine hardware,{" "}
            <span className="text-gradient">ready to install</span>.
          </>
        }
        subtitle="Solar panels, inverters, batteries and cameras  genuine brands with warranty. Inquire on WhatsApp in one tap for pricing."
        image={HERO_INVERTER}
        chips={[
          "Genuine & warrantied",
          "Dealer pricing",
          "Instant WhatsApp quote",
        ]}
      />

      {/* category shortcuts */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 md:px-8 md:pt-24">
        <div className="mono-label">Shop by category</div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((c) => (
            <Link
              key={c.slug}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <span className="font-display text-lg uppercase tracking-wide text-white">
                  {c.name}
                </span>
                <ArrowUpRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductsCatalog products={products} />
      <Contact />
    </main>
  );
}
