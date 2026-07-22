import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProjectsExplorer from "@/components/projects/ProjectsExplorer";
import Stats from "@/components/sections/Stats";
import Contact from "@/components/sections/Contact";
import { HERO_SOLAR } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Projects  Mehtab Electronics",
  description:
    "Real solar installations, inverter setups, battery backups and CCTV networks completed across Punjab. Tap any project to see the details and photos.",
};

export default function ProjectsPage() {
  return (
    <main>
      <PageHero
        crumb="Projects"
        eyebrow="Recent work"
        title={
          <>
            Projects across <span className="text-gradient">Punjab</span>.
          </>
        }
        subtitle="Real solar arrays, hybrid inverter setups, battery backups and CCTV networks. Tap any project to open the full details and photo gallery."
        image={HERO_SOLAR}
        chips={["Solar", "Inverters", "Battery", "CCTV"]}
      />
      <ProjectsExplorer />
      <Stats />
      <Contact />
    </main>
  );
}
