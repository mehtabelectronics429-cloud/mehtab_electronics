import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ExplodedExperience from "@/components/sections/ExplodedExperience";
import FeatureRow from "@/components/ui/FeatureRow";
import SceneStrip from "@/components/sections/SceneStrip";
import Projects from "@/components/sections/Projects";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { FEATURES } from "@/lib/features";
import { SCENE_STRIPS, CAMERA_PARTS, CAMERA_PART_IMAGES } from "@/lib/data";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Security & CCTV — Mehtab Electronics",
  description: "4K security camera installation, CCTV packages and NVR systems — professionally installed with mobile viewing.",
};

export default function SecurityPage() {
  return (
    <main>
      <PageHero
        crumb="Security & CCTV"
        eyebrow="Cameras · NVR · Installation"
        title={<>Security that <span className="text-gradient">actually watches</span>.</>}
        subtitle="4K AI security cameras, NVR recording and professional installation — live on your phone, day and night."
        image={img("photo-1557597774-9d273605dfa9", 1400)}
        accentColor="#22E0FF"
        chips={["4K AI cameras", "NVR recording", "Mobile viewing", "Professional install"]}
      />

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
      <Testimonials />
      <Contact />
    </main>
  );
}
