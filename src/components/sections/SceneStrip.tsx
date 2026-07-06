"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Scene = { eyebrow: string; title: string; body: string; image: string; accent?: string };
const glow: Record<string, string> = {
  cyan: "text-cyan", solar: "text-solar", energy: "text-energy", electric: "text-electric",
};

function Strip({ scene, index }: { scene: Scene; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);

  return (
    <div ref={ref} className="relative flex min-h-[85vh] items-center overflow-hidden">
      <motion.div style={{ scale, y }} className="absolute inset-0 -z-10">
        <SmartImage src={scene.image} alt={scene.title} className="h-full w-full" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#04060B] via-[#04060B]/70 to-[#04060B]/30" />

      <motion.div style={{ y: textY }} className={cn("mx-auto w-full max-w-7xl px-6 md:px-8", index % 2 === 1 && "text-right")}>
        <div className={cn("max-w-xl", index % 2 === 1 && "ml-auto")}>
          <Reveal>
            <span className={cn("font-display text-6xl md:text-8xl", glow[scene.accent ?? "cyan"])}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <span className="eyebrow mt-4 block">{scene.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.14}>
            <h3 className="display-md mt-3 text-white">{scene.title}</h3>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={cn("mt-5 text-lg leading-relaxed text-white/70", index % 2 === 1 && "ml-auto")}>{scene.body}</p>
          </Reveal>
        </div>
      </motion.div>
    </div>
  );
}

export default function SceneStrip({ scenes }: { scenes: Scene[] }) {
  return (
    <section className="dark relative bg-[#04060B]">
      {scenes.map((s, i) => (
        <Strip key={s.title} scene={s} index={i} />
      ))}
    </section>
  );
}
