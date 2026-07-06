import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ExplodedExperience from "@/components/sections/ExplodedExperience";
import FeatureRow from "@/components/ui/FeatureRow";
import SceneStrip from "@/components/sections/SceneStrip";
import Projects from "@/components/sections/Projects";
import Technology from "@/components/sections/Technology";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { FEATURES } from "@/lib/features";
import { SCENE_STRIPS, CAMERA_PARTS, CAMERA_PART_IMAGES } from "@/lib/data";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Security & CCTV — Mehtab Electronics",
  description: "AI CCTV, alarms, access control and electric fencing — monitored 24/7 with encrypted backup.",
};

export default function SecurityPage() {
  return (
    <main>
      <PageHero
        crumb="Security & CCTV"
        eyebrow="CCTV · Access · Fencing"
        title={<>Security that <span className="text-gradient">actually watches</span>.</>}
        subtitle="4K AI cameras, monitored alarms, access control and electric fencing — one encrypted system, live on any device."
        image={img("photo-1557597774-9d273605dfa9", 1400)}
        accentColor="#22E0FF"
        chips={["4K AI cameras", "Access control", "Electric fencing", "Cloud + NVR"]}
      />

      {/* Cinematic scroll-driven exploded view of an AI security camera */}
      <ExplodedExperience
        variant="camera"
        eyebrow="Inside the lens"
        title="The AI camera, deconstructed."
        parts={CAMERA_PARTS}
        images={CAMERA_PART_IMAGES}
        accent="#22E0FF"
        cta={{ label: "Secure my property", href: "/contact" }}
      />

      <FeatureRow {...FEATURES[0]} />
      <SceneStrip scenes={[SCENE_STRIPS[0]]} />
      <Projects />
      <Technology />
      <Testimonials />
      <Contact />
    </main>
  );
}
