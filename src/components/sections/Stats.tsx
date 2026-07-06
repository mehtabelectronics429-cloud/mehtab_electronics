"use client";

import Reveal from "@/components/ui/Reveal";
import Counter from "@/components/ui/Counter";
import Icon from "@/components/ui/Icon";
import { IMPACT } from "@/lib/data";

export default function Stats() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-50" />
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="group rounded-3xl glass hairline p-8 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric/30 to-cyan/20 text-cyan ring-1 ring-line/10">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <div className="mt-5 font-display text-4xl text-fg md:text-5xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-sm text-fg/55">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
