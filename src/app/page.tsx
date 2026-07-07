import PremiumHero from "@/components/sections/PremiumHero";
import CinematicStory from "@/components/sections/CinematicStory";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import SceneStrip from "@/components/sections/SceneStrip";
import Process from "@/components/sections/Process";
import WhyUs from "@/components/sections/WhyUs";
import Brands from "@/components/sections/Brands";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import { SCENE_STRIPS } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <PremiumHero />
      <CinematicStory />
      <Stats />
      <About />
      <Services />
      <FeaturedProducts />
      <SceneStrip scenes={SCENE_STRIPS} />
      <Process />
      <WhyUs />
      <Brands />
      <Testimonials />
      <FAQ />
      <Contact />
    </main>
  );
}
