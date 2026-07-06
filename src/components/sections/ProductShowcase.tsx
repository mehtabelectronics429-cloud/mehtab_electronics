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
    key: "solar", label: "Hybrid Solar Kit", icon: "SunMedium",
    tagline: "10kW Hybrid System", image: img("photo-1508514177221-188b1cf16e9d", 1200),
    specs: [["Panels", "18 × 555W mono-PERC"], ["Inverter", "10kW hybrid MPPT"], ["Storage", "15kWh lithium"], ["Yield", "~1,450 kWh / month"]],
  },
  {
    key: "security", label: "AI Security Suite", icon: "Cctv",
    tagline: "8-Camera 4K Grid", image: img("photo-1557597774-9d273605dfa9", 1200),
    specs: [["Cameras", "8 × 4K IP, colour night"], ["Analytics", "Person / vehicle AI"], ["Storage", "8TB NVR + cloud"], ["Access", "App + facial unlock"]],
  },
  {
    key: "power", label: "Power Backbone", icon: "BatteryCharging",
    tagline: "Online UPS + Storage", image: img("photo-1581092160562-40aa08e78837", 1200),
    specs: [["UPS", "6kVA online, pure sine"], ["Battery", "Lithium 10kWh"], ["Switchover", "0 ms seamless"], ["Monitoring", "Live load telemetry"]],
  },
  {
    key: "smart", label: "Smart Home Hub", icon: "House",
    tagline: "Unified Automation", image: img("photo-1600607687939-ce8a6c25118c", 1200),
    specs: [["Control", "Voice + app + scenes"], ["Network", "Mesh WiFi 6"], ["Devices", "Lights, locks, climate"], ["Integrations", "200+ ecosystems"]],
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
