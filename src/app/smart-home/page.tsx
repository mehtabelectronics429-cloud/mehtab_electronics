import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import FeatureRow from "@/components/ui/FeatureRow";
import ProductShowcase from "@/components/sections/ProductShowcase";
import Technology from "@/components/sections/Technology";
import EnergyNetwork from "@/components/sections/EnergyNetwork";
import SceneStrip from "@/components/sections/SceneStrip";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import { FEATURES } from "@/lib/features";
import { SCENE_STRIPS } from "@/lib/data";
import { img } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Smart Home & Networking — Mehtab Electronics",
  description: "Automation, lighting, climate, smart locks and mesh WiFi 6 — all in one intelligent app.",
};

export default function SmartHomePage() {
  return (
    <main>
      <PageHero
        crumb="Smart Home"
        eyebrow="Automation · Networking"
        title={<>A home that <span className="text-gradient">responds to you</span>.</>}
        subtitle="Voice, app and scene control for lighting, climate, blinds and locks — over a rock-solid mesh WiFi 6 backbone."
        image={img("photo-1558002038-1055907df827", 1400)}
        accentColor="#38F6A4"
        chips={["Scene control", "Smart locks", "Mesh WiFi 6", "200+ integrations"]}
      />
      <FeatureRow {...FEATURES[3]} />
      <ProductShowcase />
      <SceneStrip scenes={[SCENE_STRIPS[2]]} />
      <Technology />
      <EnergyNetwork />
      <FAQ />
      <Contact />
    </main>
  );
}
