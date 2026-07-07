"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import TiltCard from "@/components/ui/TiltCard";
import SmartImage from "@/components/ui/SmartImage";
import Particles from "@/components/ui/Particles";
import { img } from "@/lib/utils";
import { ENABLE_HERO_3D } from "@/lib/config";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const PRODUCTS = [
  { name: "Solar Panel", spec: "555W Mono-PERC", image: img("photo-1509391366360-2e959784a276", 900), accent: "text-solar" },
  { name: "Solar Inverter", spec: "10kW Hybrid", image: img("photo-1581092160562-40aa08e78837", 900), accent: "text-cyan" },
  { name: "Security Camera", spec: "4K AI ColorVu", image: img("photo-1557597774-9d273605dfa9", 900), accent: "text-electric" },
  { name: "Lithium Battery", spec: "15kWh Storage", image: img("photo-1620714223084-8fcacc6dfd8d", 900), accent: "text-energy" },
];

const LINES = ["Powering", "Tomorrow.", "Securing", "Today."];

/* Layer 1 — cinematic animated backdrop (fog, rays, noise, vignette) */
function Backdrop({ rotate }: { rotate: MotionValue<number> }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-40 overflow-hidden bg-[#04060B]">
      <motion.div style={{ rotate }} className="absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 [background:conic-gradient(from_200deg_at_50%_50%,transparent,rgba(34,224,255,0.10)_20deg,transparent_60deg,rgba(46,107,255,0.10)_130deg,transparent_200deg,rgba(56,246,164,0.06)_300deg,transparent)]" />
      </motion.div>
      <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-electric/15 blur-[150px] animate-aurora" />
      <div className="absolute right-[-12rem] top-24 h-[38rem] w-[38rem] rounded-full bg-cyan/12 blur-[160px] animate-aurora [animation-delay:-8s]" />
      <div className="absolute bottom-[-14rem] left-1/3 h-[40rem] w-[40rem] rounded-full bg-energy/8 blur-[170px] animate-aurora [animation-delay:-13s]" />
      {/* animated noise */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }} />
      <div className="absolute inset-0 [background:radial-gradient(120%_100%_at_50%_35%,transparent_25%,rgba(4,6,11,0.92)_100%)]" />
    </div>
  );
}

/* Layer 3b — giant cross-fading background product behind the cards */
function BackgroundProducts() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % PRODUCTS.length), 3800);
    return () => clearInterval(t);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none absolute right-[-6%] top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 [perspective:1200px] lg:block">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.15, rotateY: 40, filter: "blur(16px)" }}
          animate={{ opacity: 0.28, scale: 1, rotateY: 0, filter: "blur(3px)" }}
          exit={{ opacity: 0, scale: 0.9, rotateY: -40, filter: "blur(16px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 overflow-hidden rounded-[3rem]"
        >
          <SmartImage src={PRODUCTS[i].image} alt="" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#04060B]/40 to-[#04060B]/80" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* Layer 3 — floating glass product cards */
function ProductCards() {
  const layout = [
    "left-0 top-0", "right-2 top-24", "left-6 top-52", "right-0 top-72",
  ];
  return (
    <div className="relative hidden h-[30rem] w-full lg:block">
      <BackgroundProducts />
      {PRODUCTS.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{ opacity: { duration: 0.8, delay: 0.4 + i * 0.12 }, y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 } }}
          className={`absolute ${layout[i]} w-56`}
        >
          <TiltCard intensity={12} className="overflow-hidden rounded-3xl glass hairline shadow-glass">
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
              <SmartImage src={p.image} alt={p.name} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04060B]/70 to-transparent" />
            </div>
            <div className="p-4" style={{ transform: "translateZ(30px)" }}>
              <div className={`font-mono text-[0.62rem] uppercase tracking-widest ${p.accent}`}>{p.spec}</div>
              <div className="mt-1 font-display text-sm text-white">{p.name}</div>
            </div>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);   // slower
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, 220]);    // faster
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden px-6 py-28 md:px-10">
      {/* Layer 1 */}
      <Backdrop rotate={bgRotate} />

      {/* Layer 2 — 3D particles + morphing sphere (or light fallback) */}
      {ENABLE_HERO_3D ? (
        <div className="absolute inset-0 -z-30"><HeroScene progress={scrollYProgress} count={4200} /></div>
      ) : (
        <div className="pointer-events-none absolute inset-0 -z-30 opacity-70"><Particles count={44} /></div>
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
        {/* Layer 4 — hero content */}
        <motion.div style={{ y: contentY, opacity: fade }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-energy animate-pulse" /> Electronics & Smart Energy
          </motion.span>

          <h1 className="mt-7 font-display font-bold leading-[0.98] tracking-tight text-[clamp(2.6rem,6vw,5.5rem)]">
            {LINES.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 40, filter: "blur(12px)", letterSpacing: "0.2em" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "-0.01em" }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`block ${i % 2 === 0 ? "text-fg" : "text-gradient"}`}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-7 max-w-md text-base leading-relaxed text-fg/65 md:text-lg"
          >
            Solar power, AI security, smart automation and clean energy storage — engineered into one seamless, futuristic system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <MagneticButton href="/contact">Book a Site Survey <ArrowUpRight className="h-4 w-4" /></MagneticButton>
            <MagneticButton href="/products" variant="ghost"><Play className="h-4 w-4" /> Explore Products</MagneticButton>
          </motion.div>
        </motion.div>

        {/* Layer 3 — floating product cards */}
        <motion.div style={{ y: cardsY, opacity: fade }}>
          <ProductCards />
        </motion.div>
      </div>

      {/* Layer 5 — glass UI overlays */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 mx-auto hidden max-w-7xl items-center justify-between px-10 md:flex">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-fg/40">Est. 2009 · Lahore, PK</span>
        <span className="flex items-center gap-2 text-xs text-fg/45"><span className="h-4 w-px animate-pulse bg-cyan" /> Scroll to explore</span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-fg/40">60 FPS · Cinematic</span>
      </div>
    </section>
  );
}
