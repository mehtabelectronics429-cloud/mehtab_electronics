"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { INDUSTRIES } from "@/lib/data";

export default function IndustriesServed() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-8">
      <SectionHeading eyebrow="Industries served" align="center" title={<>Trusted across <span className="text-gradient">every sector</span>.</>} />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {INDUSTRIES.map((ind, i) => (
          <Reveal key={ind.label} delay={(i % 4) * 0.06}>
            <div className="group flex flex-col items-center gap-3 rounded-3xl glass hairline p-7 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fg/5 text-cyan ring-1 ring-line/10 transition-colors group-hover:text-white group-hover:bg-cyan/20">
                <Icon name={ind.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm text-fg/75">{ind.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
