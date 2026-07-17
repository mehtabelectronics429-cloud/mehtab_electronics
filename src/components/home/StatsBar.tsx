"use client";

import { motion } from "framer-motion";
import { Wrench, Users, Award, MapPinned } from "lucide-react";
import { COMPANY } from "@/lib/data";

const ICONS = [Wrench, Users, Award, MapPinned];

/** The bold accent band of headline numbers under the hero. */
export default function StatsBar() {
  return (
    <section className="relative bg-brand text-on-brand">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-8 md:grid-cols-4 md:px-8">
        {COMPANY.stats.map((s, i) => {
          const Icon = ICONS[i];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <Icon className="h-5 w-5 shrink-0 opacity-70" strokeWidth={2.2} />
              <div className="leading-none">
                <div className="font-display text-3xl md:text-4xl">{s.value}</div>
                <div className="mt-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] opacity-80">
                  {s.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
