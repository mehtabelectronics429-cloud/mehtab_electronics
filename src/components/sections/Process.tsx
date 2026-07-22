"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { PROCESS } from "@/lib/data";

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="process"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40"
    >
      <SectionHeading
        eyebrow="How it works"
        align="center"
        title={
          <>
            From survey to <span className="text-gradient">switch-on</span>.
          </>
        }
        intro="A precise, transparent process  you always know exactly what happens next."
      />

      <div ref={ref} className="relative mt-16">
        {/* center rail */}
        <div className="absolute left-6 top-0 h-full w-px bg-fg/10 md:left-1/2">
          <motion.div
            style={{ height }}
            className="w-px bg-gradient-to-b from-electric via-cyan to-energy"
          />
        </div>

        <div className="space-y-12">
          {PROCESS.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.05}>
              <div
                className={`relative flex items-center gap-8 pl-16 md:pl-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="md:w-1/2" />
                <span className="absolute left-6 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-cyan shadow-glow md:left-1/2">
                  <span className="h-2 w-2 rounded-full bg-[#04060B]" />
                </span>
                <div
                  className={`md:w-1/2 ${i % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"}`}
                >
                  <div className="group rounded-3xl glass hairline p-7 transition-all duration-500 hover:-translate-y-1 hover:border-cyan/30">
                    <div
                      className={`flex items-center gap-3 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-fg/5 text-cyan ring-1 ring-line/10">
                        <Icon name={p.icon} className="h-5 w-5" />
                      </span>
                      <span className="font-display text-3xl text-fg/15">
                        {p.step}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-base text-fg">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg/60">
                      {p.body}
                    </p>
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
