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
  description: "CCTV, solar, inverters, UPS, batteries, smart automation, electric fencing, networking and annual maintenance — engineered end to end.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        crumb="Services"
        eyebrow="Everything we do"
        title={<>One studio for <span className="text-gradient">every system</span>.</>}
        subtitle="From a single camera to a full solar-plus-security ecosystem — designed, installed and maintained by one accountable team."
        image={img("photo-1497366811353-6870744d04b2", 1400)}
        accentColor="#2E6BFF"
        chips={["Solar & storage", "CCTV & access", "Automation", "Networking", "AMC"]}
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
