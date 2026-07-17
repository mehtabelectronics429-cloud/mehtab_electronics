import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Specialties from "@/components/home/Specialties";
import LoadCalculator from "@/components/home/LoadCalculator";
import Partners from "@/components/home/Partners";
import Projects from "@/components/home/Projects";
import ContactShop from "@/components/home/ContactShop";

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <Specialties />
      <LoadCalculator />
      <Partners />
      <Projects />
      <ContactShop />
    </main>
  );
}
