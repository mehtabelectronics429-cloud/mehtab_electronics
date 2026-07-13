"use client";

import AuroraBackground from "@/components/ui/AuroraBackground";
import HeroParticleCanvas from "@/components/ui/HeroParticleCanvas";
import { img } from "@/lib/utils";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Full-page ambient backdrop — one photo layer + light particles (sections stay clear). */
export default function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />

      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-multiply saturate-[0.85] dark:opacity-[0.26] dark:mix-blend-luminosity dark:saturate-100"
        style={{ backgroundImage: `url(${img("photo-1509391366360-2e959784a276", 1600)})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/82 to-bg/94 dark:from-bg/76 dark:via-bg/86 dark:to-bg/96" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-8%,rgb(var(--elevated)/0.5)_0%,transparent_55%)]" />

      <AuroraBackground />
      <HeroParticleCanvas density="normal" className="opacity-100" />

      <div className="absolute inset-0 bg-grid-lines [background-size:52px_52px] opacity-[0.18] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_45%,black,transparent)] dark:opacity-[0.14]" />

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.06]"
        style={{ backgroundImage: NOISE, backgroundSize: "180px 180px" }}
      />
    </div>
  );
}
