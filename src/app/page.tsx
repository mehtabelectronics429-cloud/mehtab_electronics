import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Specialties from "@/components/home/Specialties";
import HowWeWork from "@/components/home/HowWeWork";
import LoadCalculator from "@/components/home/LoadCalculator";
import CNCAuthorized from "@/components/home/CNCAuthorized";
import Partners from "@/components/home/Partners";
import InstallGallery from "@/components/home/InstallGallery";
import PromoBanner from "@/components/home/PromoBanner";
import ContactShop from "@/components/home/ContactShop";

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <Specialties />
      <HowWeWork />
      <LoadCalculator />
      <CNCAuthorized />
      <Partners />
      <InstallGallery />
      <PromoBanner />
      <ContactShop />
    </main>
  );
}
