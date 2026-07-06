"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { BENEFITS } from "@/lib/data";

export default function WhyUs() {
  return (
    <section id="why-us" className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <SectionHeading
        eyebrow="Why Mehtab"
        align="center"
        title={<>Reasons clients <span className="text-gradient">never look elsewhere</span>.</>}
        intro="One accountable partner, engineering-grade installs, and support that actually picks up the phone."
      />
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((b, i) => (
          <Reveal key={b.title} delay={(i % 3) * 0.08}>
            <div className="sheen group relative h-full overflow-hidden rounded-3xl glass hairline p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric/30 to-cyan/20 text-cyan ring-1 ring-line/10">
                <Icon name={b.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-display text-base text-fg">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg/60">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
