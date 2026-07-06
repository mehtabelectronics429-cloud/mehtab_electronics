"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Play, ShieldCheck, SunMedium, Cctv } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import ParticlesBG from "@/components/ui/ParticlesBG";
import { COMPANY } from "@/lib/data";

const chips = [
  { icon: SunMedium, label: "Solar", accent: "text-solar" },
  { icon: Cctv, label: "CCTV", accent: "text-cyan" },
  { icon: ShieldCheck, label: "Security", accent: "text-energy" },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-28">
      {/* ── Layer 1: solid dark base + looping video (low opacity) ── */}
      <div aria-hidden className="absolute inset-0 -z-30 overflow-hidden bg-[#04060B]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* subtle brand glows on the dark base */}
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-electric/12 blur-[150px] animate-aurora" />
        <div className="absolute right-[-10rem] top-24 h-[30rem] w-[30rem] rounded-full bg-cyan/10 blur-[160px] animate-aurora [animation-delay:-7s]" />
        {/* keep the base dark so particles + text read */}
        <div className="absolute inset-0 bg-[#04060B]/65" />
        <div className="absolute inset-0 [background:radial-gradient(120%_100%_at_50%_35%,transparent_22%,rgba(4,6,11,0.95)_100%)]" />
      </div>

      {/* ── Layer 2: mouse-reactive 3D particles over the video ── */}
      <ParticlesBG color="#38d6ff" count={520} size={11} className="-z-20 opacity-55" />

      {/* ── Layer 3: floating transparent glass content ── */}
      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="animated-border relative mx-auto overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.04] px-6 py-10 text-center backdrop-blur-2xl md:px-12 md:py-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-cyan/15 blur-[120px]" />

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-energy animate-pulse" />
            Electronics & Smart Energy · Est. {COMPANY.founded}
          </motion.span>

          <h1 className="mt-7 font-display font-bold leading-[0.96] tracking-tight text-[clamp(2.1rem,5vw,4.5rem)]">
            <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="block text-gradient">
              Smart Energy.
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} className="block text-fg">
              Absolute Security.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fg/70 md:text-lg"
          >
            We engineer futuristic homes and businesses — solar power, AI security, smart
            automation and clean energy storage, delivered as one seamless system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton href="#contact">
              Book a Site Survey <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="#experience" variant="ghost">
              <Play className="h-4 w-4" /> Enter the Showroom
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {chips.map((c) => (
              <span key={c.label} className="sheen inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg/75 backdrop-blur-md">
                <c.icon className={`h-4 w-4 ${c.accent}`} /> {c.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* stat strip — transparent glass */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1 }}
          className="mx-auto mt-5 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl md:grid-cols-4"
        >
          {COMPANY.stats.map((s) => (
            <div key={s.label} className="px-6 py-5 text-center">
              <div className="font-display text-2xl text-fg md:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-fg/50">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-cyan" />
        </div>
      </div>
    </section>
  );
}
