import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ExplodedExperience from "@/components/sections/ExplodedExperience";
import FeatureRow from "@/components/ui/FeatureRow";
import SceneStrip from "@/components/sections/SceneStrip";
import Stats from "@/components/sections/Stats";
import Packages from "@/components/sections/Packages";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";
import { FEATURES } from "@/lib/features";
import { SCENE_STRIPS, INVERTER_PARTS, INVERTER_PART_IMAGES } from "@/lib/data";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Solar Solutions — Mehtab Electronics",
  description: "Solar panel installation, hybrid inverters and on-grid setups — net-metering ready and professionally installed.",
};

export default function SolarPage() {
  return (
    <main>
      <PageHero
        crumb="Solar Solutions"
        eyebrow="Panels · Inverters · Setup"
        title={<>Turn your roof into a <span className="text-gradient-solar">power plant</span>.</>}
        subtitle="Tier-1 solar panels, hybrid inverters and complete on-grid setups — engineered to your load, net-metering handled end to end."
        image={img("photo-1509391366360-2e959784a276", 1400)}
        accentColor="#FF8A34"
        chips={["Mono-PERC panels", "Hybrid inverters", "On-grid setup", "Net metering"]}
      />

      <ExplodedExperience
        variant="inverter"
        eyebrow="Inside the machine"
        title="The hybrid inverter, deconstructed."
        parts={INVERTER_PARTS}
        images={INVERTER_PART_IMAGES}
        accent="#FF8A34"
        cta={{ label: "Get a solar quote", href: "/contact" }}
      />

      <FeatureRow {...FEATURES[1]} />
      <FeatureRow {...FEATURES[2]} />
      <SceneStrip scenes={[SCENE_STRIPS[1], SCENE_STRIPS[2]]} />
      <Stats />
      <Packages />
      <Process />
      <Contact />
    </main>
  );
}
