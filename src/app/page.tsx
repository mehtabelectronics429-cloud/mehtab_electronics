import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Specialties from "@/components/home/Specialties";
import HowWeWork from "@/components/home/HowWeWork";
import LoadCalculator from "@/components/home/LoadCalculator";
import Partners from "@/components/home/Partners";
import HomeCatalog from "@/components/home/HomeCatalog";
import InstallGallery from "@/components/home/InstallGallery";
import PromoBanner from "@/components/home/PromoBanner";
import ContactShop from "@/components/home/ContactShop";

// Categories + products are read live from the admin dashboard.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <Specialties />
      <HowWeWork />
      <HomeCatalog />
      <LoadCalculator />
      <Partners />
      <InstallGallery />
      <PromoBanner />
      <ContactShop />
    </main>
  );
}
