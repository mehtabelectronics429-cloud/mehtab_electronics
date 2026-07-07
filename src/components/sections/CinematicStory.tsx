"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { SCENES } from "@/lib/data";
import { ENABLE_3D } from "@/lib/config";
import Reveal from "@/components/ui/Reveal";
import AuroraBackground from "@/components/ui/AuroraBackground";
import HeroParticleCanvas from "@/components/ui/HeroParticleCanvas";
import { img } from "@/lib/utils";

const ShowroomScene = dynamic(() => import("@/components/three/ShowroomScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
    </div>
  ),
});

const BANDS: [number, number][] = [
  [0.0, 0.22], [0.25, 0.47], [0.5, 0.72], [0.75, 1.0],
];

function SceneText({ progress, band, scene }: { progress: MotionValue<number>; band: [number, number]; scene: (typeof SCENES)[number] }) {
  const [s, e] = band;
  const fade = 0.05;
  const opacity = useTransform(progress, [s - fade, s + fade, e - fade, e + fade], [0, 1, 1, 0]);
  const y = useTransform(progress, [s - fade, s + fade, e - fade, e + fade], [50, 0, 0, -50]);
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 bottom-24 mx-auto max-w-xl px-6 text-center md:left-16 md:right-auto md:mx-0 md:max-w-md md:text-left">
      <span className="eyebrow">{scene.eyebrow}</span>
      <h3 className="display-lg mt-4 text-white">{scene.title}</h3>
      <p className="mt-4 text-base leading-relaxed text-white/65">{scene.body}</p>
    </motion.div>
  );
}

/** Full pinned WebGL showroom (only when ENABLE_3D). */
function Story3D() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  const railWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="experience" ref={container} className="dark relative h-[560vh] bg-[#04060B]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[radial-gradient(120%_120%_at_50%_-10%,#0b1120_0%,#04060B_55%)]">
        <ShowroomScene progress={scrollYProgress} />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_50%,transparent_45%,rgba(4,6,11,0.85)_100%)]" />
        {SCENES.map((sc, i) => (
          <SceneText key={sc.id} progress={scrollYProgress} band={BANDS[i]} scene={sc} />
        ))}
        <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 text-center">
          <span className="eyebrow">The Mehtab Experience</span>
        </div>
        <div className="absolute bottom-8 left-1/2 h-[3px] w-56 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
          <motion.div style={{ width: railWidth }} className="h-full rounded-full bg-gradient-to-r from-electric via-cyan to-energy" />
        </div>
      </div>
    </section>
  );
}

/** Lightweight narrative fallback — no WebGL, fast on any device. */
function StoryLight() {
  return (
    <section id="experience" className="relative overflow-hidden py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.14] mix-blend-multiply dark:opacity-[0.22] dark:mix-blend-luminosity"
        style={{ backgroundImage: `url(${img("photo-1613665813446-82a78c468a1d", 1600)})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/50 via-transparent to-bg/60" />
      <AuroraBackground />
      <HeroParticleCanvas density="normal" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <div className="text-center">
          <span className="eyebrow">The Mehtab Experience</span>
          <h2 className="display-lg mx-auto mt-5 max-w-3xl text-fg">
            Solar power and security, <span className="text-gradient">done right</span>.
          </h2>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SCENES.map((sc, i) => (
            <Reveal key={sc.id} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-3xl glass hairline p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30">
                <span className="font-display text-4xl text-fg/15">{String(i + 1).padStart(2, "0")}</span>
                <span className="eyebrow mt-3 block">{sc.eyebrow}</span>
                <h3 className="mt-2 font-display text-lg text-fg">{sc.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg/60">{sc.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CinematicStory() {
  return ENABLE_3D ? <Story3D /> : <StoryLight />;
}
