import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Projects from "@/components/sections/Projects";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Stats from "@/components/sections/Stats";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects — Mehtab Electronics",
  description: "Selected residential and commercial installations: solar farms, camera grids, smart villas and more.",
};

export default function ProjectsPage() {
  return (
    <main>
      <PageHero
        crumb="Projects"
        eyebrow="Selected work"
        title={<>Installations we're <span className="text-gradient">proud of</span>.</>}
        subtitle="From single villas to 480kW farms and 128-camera corporate grids — engineered end to end and built to last."
        image={img("photo-1497366811353-6870744d04b2", 1400)}
        accentColor="#2E6BFF"
        chips={["Residential", "Commercial", "Solar", "Security"]}
      />
      <Projects />
      <BeforeAfter />
      <Stats />
      <Testimonials />
      <Contact />
    </main>
  );
}
