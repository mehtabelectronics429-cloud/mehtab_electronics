import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductsCatalog from "@/components/sections/ProductsCatalog";
import Brands from "@/components/sections/Brands";
import Contact from "@/components/sections/Contact";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products — Mehtab Electronics",
  description: "Solar panels, inverters, batteries, CCTV, biometrics, smart locks, networking and more — with instant WhatsApp inquiry.",
};

export default function ProductsPage() {
  return (
    <main>
      <PageHero
        crumb="Products"
        eyebrow="The catalogue"
        title={<>Premium hardware, <span className="text-gradient">ready to install</span>.</>}
        subtitle="Browse our curated range of solar, security, automation and networking hardware — then inquire on WhatsApp in one tap for pricing and installation."
        image={img("photo-1518770660439-4636190af475", 1400)}
        accentColor="#22E0FF"
        chips={["Genuine brands", "Installed & warrantied", "Instant WhatsApp quote"]}
      />
      <ProductsCatalog />
      <Brands />
      <Contact />
    </main>
  );
}
