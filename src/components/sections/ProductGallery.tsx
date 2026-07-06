"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { img } from "@/lib/utils";

const ITEMS = [
  { name: "4K AI Camera", tag: "Vision", image: img("photo-1557597774-9d273605dfa9", 1000) },
  { name: "Mono-PERC Panel", tag: "Solar", image: img("photo-1509391366360-2e959784a276", 1000) },
  { name: "Hybrid Inverter", tag: "Power", image: img("photo-1581092160562-40aa08e78837", 1000) },
  { name: "Lithium Storage", tag: "Battery", image: img("photo-1497440001374-f26997328c1b", 1000) },
  { name: "Smart Hub", tag: "Automation", image: img("photo-1558002038-1055907df827", 1000) },
  { name: "Mesh WiFi 6", tag: "Network", image: img("photo-1518770660439-4636190af475", 1000) },
];

export default function ProductGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-68%"]);
  const glow = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-7xl px-6 md:px-8">
          <span className="eyebrow">Product gallery</span>
          <h2 className="display-md mt-3 text-fg">Hardware we <span className="text-gradient">stand behind</span>.</h2>
        </div>

        <motion.div style={{ x }} className="flex gap-6 px-6 md:px-8 will-change-transform">
          {ITEMS.map((it, i) => (
            <article key={it.name} className="group relative w-[78vw] shrink-0 overflow-hidden rounded-[2rem] glass hairline sm:w-[52vw] lg:w-[34vw]">
              <div className="relative aspect-[16/11]">
                <SmartImage src={it.image} alt={it.name} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060B] via-transparent to-transparent" />
                <span className="absolute left-5 top-5 rounded-full glass hairline px-3 py-1 text-[0.65rem] uppercase tracking-widest text-cyan">{it.tag}</span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <h3 className="font-display text-lg text-white">{it.name}</h3>
                  <span className="font-mono text-xs text-white/50">0{i + 1}</span>
                </div>
              </div>
            </article>
          ))}
        </motion.div>

        <div className="mx-auto mt-10 h-[3px] w-56 overflow-hidden rounded-full bg-fg/10">
          <motion.div style={{ width: glow }} className="h-full rounded-full bg-gradient-to-r from-electric via-cyan to-energy" />
        </div>
      </div>
    </section>
  );
}
