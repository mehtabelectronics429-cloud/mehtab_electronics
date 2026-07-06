"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { TECH } from "@/lib/data";

export default function Technology() {
  return (
    <section id="technology" className="relative overflow-hidden py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/10 blur-[160px]" />
      </div>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <SectionHeading
          eyebrow="Under the hood"
          align="center"
          title={<>The <span className="text-gradient">technology</span> that runs it all.</>}
          intro="We only deploy hardware and platforms we'd trust in our own homes — engineered for reliability, intelligence and longevity."
        />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-3xl glass hairline p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric/30 to-cyan/20 text-cyan ring-1 ring-fg/10">
                  <Icon name={t.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-6 font-display text-base text-fg">{t.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg/55">{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
