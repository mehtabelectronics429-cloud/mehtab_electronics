import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Services from "@/components/sections/Services";
import FeatureSections from "@/components/sections/FeatureSections";
import Process from "@/components/sections/Process";
import Packages from "@/components/sections/Packages";
import WhyUs from "@/components/sections/WhyUs";
import Contact from "@/components/sections/Contact";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services — Mehtab Electronics",
  description: "Solar panel installation, inverters, on-grid setups and CCTV security cameras — engineered end to end.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        crumb="Services"
        eyebrow="What we offer"
        title={<>Solar & security, <span className="text-gradient">one team</span>.</>}
        subtitle="Solar panels, inverters and security cameras — designed, installed and maintained by one accountable team."
        image={img("photo-1497366811353-6870744d04b2", 1400)}
        accentColor="#2E6BFF"
        chips={["Solar panels", "Inverters", "CCTV cameras", "Maintenance"]}
      />
      <Services />
      <FeatureSections />
      <Process />
      <Packages />
      <WhyUs />
      <Contact />
    </main>
  );
}
