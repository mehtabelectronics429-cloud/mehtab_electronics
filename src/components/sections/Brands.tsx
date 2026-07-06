"use client";

import { BRANDS } from "@/lib/data";

export default function Brands() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section className="relative overflow-hidden py-16">
      <div className="mx-auto mb-8 max-w-7xl px-6 text-center md:px-8">
        <span className="kicker">Brands we deploy</span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
        <div className="flex w-max animate-marquee gap-4">
          {row.map((b, i) => (
            <span key={i} className="whitespace-nowrap rounded-full glass hairline px-6 py-3 text-sm font-medium text-fg/70">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
