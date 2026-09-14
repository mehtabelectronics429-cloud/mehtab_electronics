import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import InstallVideos from "@/components/installations/InstallVideos";
import Stats from "@/components/sections/Stats";
import Contact from "@/components/sections/Contact";
import { HERO_SOLAR } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Installation Videos — Mehtab Electronics",
  description:
    "Watch real solar, inverter, battery and CCTV installations by Mehtab Electronics across Punjab — with the specs and details of each job.",
};

export default function InstallationsPage() {
  return (
    <main>
      <PageHero
        crumb="Installations"
        eyebrow="On-site videos"
        title={
          <>
            Installations, <span className="text-gradient">on video</span>.
          </>
        }
        subtitle="See how we do it — real solar arrays, hybrid inverters, battery backups and CCTV networks installed across Punjab. Tap any video to watch and read the details."
        image={HERO_SOLAR}
        chips={["Solar", "Inverters", "Battery", "CCTV"]}
      />

      <div className="mx-auto max-w-7xl px-6 pt-16 md:px-8">
        <SectionHeading
          eyebrow="Watch"
          title="Installation videos"
          intro="A growing library of our field work. Each clip shows the real install with its key specifications."
        />
      </div>
      <InstallVideos />

      <Stats />
      <Contact />
    </main>
  );
}
