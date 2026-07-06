"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { TIMELINE } from "@/lib/data";

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-28 md:py-40">
      <SectionHeading eyebrow="Company journey" align="center" title={<>Fifteen years, <span className="text-gradient">one obsession</span>.</>} />
      <div ref={ref} className="relative mt-16 pl-10 md:pl-0">
        <div className="absolute left-4 top-0 h-full w-px bg-fg/10 md:left-1/2">
          <motion.div style={{ height }} className="w-px bg-gradient-to-b from-electric via-cyan to-energy" />
        </div>
        <div className="space-y-10">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.05}>
              <div className={`relative flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="hidden md:block md:w-1/2" />
                <span className="absolute left-4 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full bg-cyan shadow-glow md:left-1/2" />
                <div className={`md:w-1/2 ${i % 2 === 0 ? "md:pl-10" : "md:pr-10 md:text-right"}`}>
                  <div className="rounded-3xl glass hairline p-6 transition-transform duration-500 hover:-translate-y-1">
                    <div className="font-display text-2xl text-gradient">{t.year}</div>
                    <h3 className="mt-2 font-display text-base text-fg">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg/60">{t.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
