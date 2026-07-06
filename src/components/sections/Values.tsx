"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { VALUES } from "@/lib/data";

export default function Values() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-8">
      <SectionHeading eyebrow="What we stand for" title={<>Our <span className="text-gradient">core values</span>.</>} />
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delay={(i % 2) * 0.08}>
            <div className="sheen group flex h-full gap-5 rounded-3xl glass hairline p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-electric/30 to-cyan/20 text-cyan ring-1 ring-line/10">
                <Icon name={v.icon} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-base text-fg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg/60">{v.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
