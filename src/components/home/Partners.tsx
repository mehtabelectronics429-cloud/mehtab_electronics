"use client";

import { motion } from "framer-motion";
import { PARTNERS } from "@/lib/data";

export default function Partners() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
        <div className="mono-label">Certified &amp; authorized</div>
        <h2 className="mt-4 display-md text-fg">Backed by the biggest names.</h2>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PARTNERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group flex flex-col items-center justify-center rounded-lg bg-white px-4 py-7 shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg"
            >
              <span className="font-display text-xl uppercase tracking-wide text-[#111]">{p.name}</span>
              <span className="mt-2 text-center font-mono text-[0.55rem] uppercase tracking-[0.15em] text-neutral-500">
                {p.role}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
