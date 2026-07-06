import Hero from "@/components/sections/Hero";
import CinematicStory from "@/components/sections/CinematicStory";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ProductGallery from "@/components/sections/ProductGallery";
import SceneStrip from "@/components/sections/SceneStrip";
import Process from "@/components/sections/Process";
import WhyUs from "@/components/sections/WhyUs";
import IndustriesServed from "@/components/sections/IndustriesServed";
import Brands from "@/components/sections/Brands";
import ProductShowcase from "@/components/sections/ProductShowcase";
import EnergyNetwork from "@/components/sections/EnergyNetwork";
import Technology from "@/components/sections/Technology";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Newsletter from "@/components/sections/Newsletter";
import Contact from "@/components/sections/Contact";
import { SCENE_STRIPS } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <Hero />
      <CinematicStory />
      <Stats />
      <About />
      <Services />
      <FeaturedProducts />
      <ProductGallery />
      <SceneStrip scenes={SCENE_STRIPS} />
      <Process />
      <WhyUs />
      <IndustriesServed />
      <Brands />
      <ProductShowcase />
      <EnergyNetwork />
      <Technology />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Contact />
    </main>
  );
}
