"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Play, Sparkles } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import SmartImage from "@/components/ui/SmartImage";
import TiltCard from "@/components/ui/TiltCard";
import AuroraBackground from "@/components/ui/AuroraBackground";
import HeroParticleCanvas from "@/components/ui/HeroParticleCanvas";
import { img } from "@/lib/utils";
import { COMPANY } from "@/lib/data";

const PRODUCTS = [
  { label: "Solar Panel", tag: "Harvest", image: img("photo-1509391366360-2e959784a276", 800), accent: "text-solar" },
  { label: "Solar Inverter", tag: "Convert", image: img("photo-1581092160562-40aa08e78837", 800), accent: "text-cyan" },
  { label: "Security Camera", tag: "Protect", image: img("photo-1557597774-9d273605dfa9", 800), accent: "text-electric" },
];

const HEADLINE = [
  { text: "Powering", grad: false },
  { text: "Tomorrow.", grad: true },
  { text: "Securing", grad: false },
  { text: "Today.", grad: true },
];

function HeroBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
      {/* hero-specific photographic layer */}
      <div
        className="absolute inset-0 bg-cover bg-[center_30%] opacity-[0.22] mix-blend-multiply saturate-90 dark:opacity-[0.32] dark:mix-blend-luminosity"
        style={{ backgroundImage: `url(${img("photo-1509391366360-2e959784a276", 1920)})` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-right opacity-[0.12] mix-blend-soft-light dark:opacity-[0.2]"
        style={{ backgroundImage: `url(${img("photo-1557597774-9d273605dfa9", 1600)})` }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgb(var(--elevated)/0.7)_0%,rgb(var(--bg)/0.55)_55%)]" />
      <AuroraBackground />
      <HeroParticleCanvas density="rich" />

      <div className="absolute inset-0 bg-grid-lines [background-size:56px_56px] opacity-[0.28] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,black,transparent)] dark:opacity-20" />

      {/* text-side veil — lighter so bg stays visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/78 via-bg/45 to-transparent dark:from-bg/82 dark:via-bg/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent" />
    </div>
  );
}

function ProductBackdrop() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % PRODUCTS.length), 4200);
    return () => clearInterval(id);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.08, filter: "blur(20px)" }}
          animate={{ opacity: 0.2, scale: 1, filter: "blur(4px)" }}
          exit={{ opacity: 0, scale: 0.96, filter: "blur(20px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-[-4%] top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 overflow-hidden rounded-[2.5rem] dark:opacity-100"
        >
          <SmartImage src={PRODUCTS[i].image} alt="" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-br from-bg/30 to-bg/70 dark:from-bg/50 dark:to-bg/85" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PremiumHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <HeroBackdrop />
      <ProductBackdrop />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-28 md:px-8 lg:grid-cols-2 lg:gap-10">
        <motion.div style={{ y: contentY, opacity: fade }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="eyebrow inline-flex items-center gap-2 rounded-full border border-line/10 bg-surface/60 px-4 py-2 backdrop-blur-md dark:bg-white/5"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan" />
            Electronics & Smart Energy
          </motion.span>

          <h1 className="mt-6 font-display font-bold leading-[0.94] tracking-tight text-[clamp(2.5rem,6vw,5.25rem)]">
            {HEADLINE.map((line, i) => (
              <span key={line.text} className="block overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`block ${line.grad ? "text-gradient" : "text-fg"}`}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="lead mt-7 max-w-md"
          >
            Solar panels, inverters and security cameras — professionally installed for homes and businesses across Pakistan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="/contact">
              Book a Site Survey <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="/products" variant="ghost">
              <Play className="h-4 w-4" /> Explore Products
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: cardsY, opacity: fade }} className="relative hidden h-[28rem] lg:block">
          {PRODUCTS.map((p, i) => {
            const layout = ["left-0 top-2 w-52", "right-4 top-24 w-56", "left-12 bottom-12 w-56"][i];
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.45 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute ${layout}`}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                >
                  <TiltCard intensity={10} className="overflow-hidden rounded-2xl glass hairline shadow-glass">
                    <div className="relative aspect-[5/4] overflow-hidden">
                      <SmartImage src={p.image} alt={p.label} className="absolute inset-0 h-full w-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/20 to-transparent" />
                      <span className={`absolute left-3 top-3 rounded-full border border-line/10 bg-surface/70 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-widest backdrop-blur ${p.accent}`}>
                        {p.tag}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="font-display text-sm text-fg">{p.label}</div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex flex-wrap gap-2 lg:hidden">
          {PRODUCTS.map((p) => (
            <span key={p.label} className="rounded-full border border-line/10 bg-surface/70 px-3 py-1.5 text-xs text-fg/70 backdrop-blur-md">
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-5 rounded-full border border-line/10 bg-surface/70 px-6 py-2.5 text-xs text-fg/55 backdrop-blur-md dark:bg-white/5 md:flex"
      >
        {COMPANY.stats.slice(0, 3).map((s, i) => (
          <span key={s.label} className="flex items-center gap-2">
            {i > 0 && <span className="h-3 w-px bg-line/15" />}
            <b className="font-display text-fg">{s.value}</b>
            {s.label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
