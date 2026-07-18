import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Specialties from "@/components/home/Specialties";
import Process from "@/components/sections/Process";
import Packages from "@/components/sections/Packages";
import Contact from "@/components/sections/Contact";
import { HERO_SOLAR } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Services — Mehtab Electronics",
  description:
    "Solar system installation, CCTV & security, and wholesale supply — designed, installed and maintained by one accountable team since 1996.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        crumb="Services"
        eyebrow="What we do"
        title={<>Solar, security & <span className="text-gradient">supply</span>.</>}
        subtitle="Three specialties, one trusted team — solar systems, CCTV networks and genuine wholesale equipment across Punjab."
        image={HERO_SOLAR}
        chips={["Solar systems", "CCTV & security", "Wholesale supply", "Since 1996"]}
      />
      <Specialties />
      <Process />
      <Packages />
      <Contact />
    </main>
  );
}
