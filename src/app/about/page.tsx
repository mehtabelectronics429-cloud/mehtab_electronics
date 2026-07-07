import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import About from "@/components/sections/About";
import Timeline from "@/components/sections/Timeline";
import Values from "@/components/sections/Values";
import Stats from "@/components/sections/Stats";
import Process from "@/components/sections/Process";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About — Mehtab Electronics",
  description: "The engineering-first energy & security studio behind thousands of installations across Pakistan.",
};

export default function AboutPage() {
  return (
    <main>
      <PageHero
        crumb="About"
        eyebrow="Who we are"
        title={<>The studio for the <span className="text-gradient">next decade</span>.</>}
        subtitle="Since 2009 we've merged Tier-1 solar and security hardware with professional installation craft — panels, inverters and cameras under one roof."
        image={img("photo-1600607687939-ce8a6c25118c", 1400)}
        accentColor="#22E0FF"
        chips={["Est. 2009", "Certified engineers", "One accountable partner"]}
      />
      <About />
      <Timeline />
      <Values />
      <Stats />
      <Process />
      <Team />
      <Testimonials />
      <Contact />
    </main>
  );
}
