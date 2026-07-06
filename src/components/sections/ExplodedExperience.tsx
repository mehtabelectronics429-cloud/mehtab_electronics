"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useScroll, useTransform, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MousePointer2 } from "lucide-react";
import Icon from "@/components/ui/Icon";
import MagneticButton from "@/components/ui/MagneticButton";
import { explodePhase, type ExplodePhase } from "@/lib/three-utils";
import type { ExplodePart } from "@/lib/data";

const loading = () => (
  <div className="absolute inset-0 grid place-items-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
  </div>
);
const SCENES = {
  inverter: dynamic(() => import("@/components/three/InverterScene"), { ssr: false, loading }),
  camera: dynamic(() => import("@/components/three/CameraScene"), { ssr: false, loading }),
};

const PHASE_CAPTION: Record<ExplodePhase, { eyebrow: string; text: string }> = {
  component: { eyebrow: "", text: "" },
  intro: { eyebrow: "Meet the hardware", text: "Every system begins as a beautifully engineered object." },
  closer: { eyebrow: "A closer look", text: "Scroll to move through the product." },
  explode: { eyebrow: "Exploded view", text: "Watch it come apart — panel by panel." },
  enter: { eyebrow: "Step inside", text: "Now we travel within the product itself." },
  end: { eyebrow: "Reassembled", text: "Precision-built, sealed and ready to install." },
};

export default function ExplodedExperience({
  variant, eyebrow, title, parts, images, accent = "#22E0FF", cta,
}: {
  variant: "inverter" | "camera";
  eyebrow: string;
  title: string;
  parts: ExplodePart[];
  images?: string[];
  accent?: string;
  cta?: { label: string; href: string };
}) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  const railWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  const [state, setState] = useState<{ phase: ExplodePhase; index: number }>({ phase: "intro", index: -1 });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = explodePhase(p, parts.length);
    setState((prev) => (prev.phase === next.phase && prev.index === next.index ? prev : next));
  });

  const Scene = SCENES[variant];
  const active = state.phase === "component" ? parts[state.index] : null;

  return (
    <section ref={container} className="dark relative h-[440vh] bg-[#04060B] md:h-[660vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[radial-gradient(120%_120%_at_50%_-10%,#0b1120_0%,#04060B_60%)]">
        {/* 3D layer (lazy) */}
        <Scene progress={scrollYProgress} />

        {/* vignette */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_38%,rgba(4,6,11,0.9)_100%)]" />

        {/* header */}
        <div className="pointer-events-none absolute left-6 top-24 md:left-16 md:top-28">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="display-md mt-3 max-w-md text-white">{title}</h2>
        </div>

        {/* phase caption / component card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-24 px-6 md:bottom-auto md:right-14 md:top-1/2 md:w-[24rem] md:-translate-y-1/2 md:px-0">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={`c-${state.index}`}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="animated-border mx-auto max-w-md rounded-3xl glass p-6"
              >
                {images?.[state.index] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={images[state.index]} alt={active.title} loading="lazy" className="mb-4 h-32 w-full rounded-2xl object-cover ring-1 ring-white/10" />
                )}
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-cyan ring-1 ring-white/10">
                    <Icon name={active.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-white/40">{String(state.index + 1).padStart(2, "0")} / {String(parts.length).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-lg text-white">{active.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{active.description}</p>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
                  <div className="flex items-center gap-2 text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-energy" /> {active.benefits}</div>
                  <div className="flex items-center gap-2 font-mono uppercase tracking-widest text-cyan/80"><span className="h-1.5 w-1.5 rounded-full bg-cyan" /> {active.spec}</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`p-${state.phase}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-md text-center md:text-left"
              >
                <span className="eyebrow">{PHASE_CAPTION[state.phase].eyebrow}</span>
                <p className="mt-3 text-lg leading-relaxed text-white/75">{PHASE_CAPTION[state.phase].text}</p>
                {state.phase === "end" && cta && (
                  <div className="pointer-events-auto mt-6 flex justify-center md:justify-start">
                    <MagneticButton href={cta.href}>{cta.label} <ArrowUpRight className="h-4 w-4" /></MagneticButton>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* progress rail + step dots */}
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {parts.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${state.phase === "component" && state.index === i ? "w-6 bg-cyan" : "w-1.5 bg-white/25"}`} />
            ))}
          </div>
          <div className="h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
            <motion.div style={{ width: railWidth }} className="h-full rounded-full bg-gradient-to-r from-electric via-cyan to-energy" />
          </div>
        </div>

        {/* scroll hint */}
        <motion.div style={{ opacity: hintOpacity }} className="pointer-events-none absolute bottom-8 right-8 hidden items-center gap-2 text-xs text-white/50 md:flex">
          <MousePointer2 className="h-4 w-4" /> Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
