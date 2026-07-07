"use client";

import AuroraBackground from "@/components/ui/AuroraBackground";
import HeroParticleCanvas from "@/components/ui/HeroParticleCanvas";
import { img } from "@/lib/utils";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Full-page ambient backdrop — image, aurora, particles; visible in light & dark. */
export default function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />

      {/* solar panels — stronger in dark, soft multiply in light */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.18] mix-blend-multiply saturate-[0.85] dark:opacity-[0.28] dark:mix-blend-luminosity dark:saturate-100"
        style={{ backgroundImage: `url(${img("photo-1509391366360-2e959784a276", 1920)})` }}
      />
      {/* tech atmosphere layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] mix-blend-soft-light dark:opacity-[0.14]"
        style={{ backgroundImage: `url(${img("photo-1451187580459-43490279c0fa", 1920)})` }}
      />

      {/* readability wash — lets imagery show through both themes */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/68 via-bg/80 to-bg/92 dark:from-bg/74 dark:via-bg/84 dark:to-bg/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-8%,rgb(var(--elevated)/0.55)_0%,transparent_55%)]" />

      <AuroraBackground />
      <HeroParticleCanvas density="subtle" className="opacity-100" />

      <div className="absolute inset-0 bg-grid-lines [background-size:52px_52px] opacity-[0.22] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_45%,black,transparent)] dark:opacity-[0.16]" />

      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay dark:opacity-[0.07]"
        style={{ backgroundImage: NOISE, backgroundSize: "180px 180px" }}
      />
    </div>
  );
}
