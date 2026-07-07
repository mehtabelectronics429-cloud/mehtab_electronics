"use client";

import { useMemo } from "react";

/** Lightweight floating CSS particles (no canvas cost). */
export default function Particles({ count = 26 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: -Math.random() * 6,
        dur: Math.random() * 5 + 5,
        op: Math.random() * 0.15 + 0.25,
      })),
    [count],
  );
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-electric/75 animate-floaty shadow-[0_0_14px_3px_rgba(46,107,255,0.5)] dark:bg-cyan/85 dark:shadow-[0_0_14px_3px_rgba(34,224,255,0.6)]"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: d.op,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
