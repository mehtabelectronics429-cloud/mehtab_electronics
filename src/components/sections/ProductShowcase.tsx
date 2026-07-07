"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";
import { img } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PRODUCTS = [
  {
    key: "solar", label: "Solar Setup", icon: "SunMedium",
    tagline: "10kW On-Grid System", image: img("photo-1508514177221-188b1cf16e9d", 1200),
    specs: [["Panels", "18 × 555W mono-PERC"], ["Inverter", "10kW hybrid MPPT"], ["Mounting", "Roof rail kit incl."], ["Yield", "~1,450 kWh / month"]],
  },
  {
    key: "security", label: "CCTV Package", icon: "Cctv",
    tagline: "8-Camera 4K Grid", image: img("photo-1557597774-9d273605dfa9", 1200),
    specs: [["Cameras", "8 × 4K IP, colour night"], ["Analytics", "Person / vehicle AI"], ["Storage", "8TB NVR + cloud"], ["Viewing", "Mobile app access"]],
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const p = PRODUCTS[active];

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <SectionHeading
        eyebrow="Interactive showcase"
        align="center"
        title={<>Configure your <span className="text-gradient">dream setup</span>.</>}
        intro="Explore our signature packages. Every kit is fully customised to your building after a site survey."
      />

      <div className="mt-14 flex flex-wrap justify-center gap-3">
        {PRODUCTS.map((prod, i) => (
          <button
            key={prod.key}
            onClick={() => setActive(i)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm transition-colors duration-300",
              i === active ? "text-obsidian" : "text-fg/70 glass hairline hover:text-fg"
            )}
          >
            {i === active && (
              <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-electric" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              <Icon name={prod.icon} className="h-4 w-4" /> {prod.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-12 grid items-center gap-10 rounded-[2rem] glass hairline p-6 lg:grid-cols-2 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.key + "-img"}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <SmartImage src={p.image} alt={p.label} className="aspect-[4/3] rounded-3xl" />
            <div className="absolute -bottom-4 left-6 rounded-2xl glass hairline px-5 py-3">
              <div className="text-xs text-fg/50">Signature</div>
              <div className="font-display text-sm text-fg">{p.tagline}</div>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.key + "-specs"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45 }}
          >
            <h3 className="font-display text-2xl text-fg">{p.label}</h3>
            <div className="mt-6 divide-y divide-fg/10">
              {p.specs.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3.5">
                  <span className="font-mono text-xs uppercase tracking-widest text-fg/45">{k}</span>
                  <span className="text-sm text-fg">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
