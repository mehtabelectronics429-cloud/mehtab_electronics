import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductsCatalog from "@/components/sections/ProductsCatalog";
import Brands from "@/components/sections/Brands";
import Contact from "@/components/sections/Contact";
import { getCatalogProducts, toMarketingProduct } from "@/lib/catalog";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products — Mehtab Electronics",
  description:
    "Solar panels, inverters, security cameras and CCTV packages — with instant WhatsApp inquiry.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products: ReturnType<typeof toMarketingProduct>[] = [];
  try {
    const catalog = await getCatalogProducts();
    products = catalog.map(toMarketingProduct);
  } catch (err) {
    console.error("Failed to load product catalog", err);
  }

  return (
    <main>
      <PageHero
        crumb="Products"
        eyebrow="The catalogue"
        title={
          <>
            Premium hardware, <span className="text-gradient">ready to install</span>.
          </>
        }
        subtitle="Browse live stock from our warehouse — then inquire on WhatsApp in one tap for pricing and installation."
        image={img("photo-1518770660439-4636190af475", 1400)}
        accentColor="#22E0FF"
        chips={["Live inventory", "Installed & warrantied", "Instant WhatsApp quote"]}
      />
      <ProductsCatalog products={products} />
      <Brands />
      <Contact />
    </main>
  );
}
