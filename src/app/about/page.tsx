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
import { HERO_INVERTER } from "@/lib/assets";

export const metadata: Metadata = {
  title: "About — Mehtab Electronics",
  description: "Since 1996, Mehtab Electronics has installed solar systems and CCTV networks and supplied genuine equipment across Punjab from our Narowal base.",
};

export default function AboutPage() {
  return (
    <main>
      <PageHero
        crumb="About"
        eyebrow="Who we are"
        title={<>Trusted in Punjab <span className="text-gradient">since 1996</span>.</>}
        subtitle="From our Narowal base we've grown from electronics and CCTV into complete solar systems and wholesale supply — installed and backed by one accountable team."
        image={HERO_INVERTER}
        chips={["Est. 1996", "Solar · CCTV · Supply", "One accountable partner"]}
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
