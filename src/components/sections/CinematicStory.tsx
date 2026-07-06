"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { SCENES } from "@/lib/data";

const ShowroomScene = dynamic(() => import("@/components/three/ShowroomScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
    </div>
  ),
});

const BANDS: [number, number][] = [
  [0.0, 0.16], [0.18, 0.33], [0.37, 0.52], [0.55, 0.67], [0.7, 0.83], [0.87, 1.0],
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

export default function CinematicStory() {
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
