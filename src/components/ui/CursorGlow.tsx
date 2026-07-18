"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let x = rx;
    let y = ry;
    let raf = 0;
    let running = false;

    const loop = () => {
      rx += (x - rx) * 0.14;
      ry += (y - ry) * 0.14;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      // Stop the loop once the ring has essentially caught up — saves the main
      // thread from an always-on rAF while the pointer is idle.
      if (Math.abs(x - rx) < 0.3 && Math.abs(y - ry) < 0.3) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      start();
    };

    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("a,button,[data-magnetic]");
      if (ring.current) ring.current.dataset.hover = t ? "true" : "false";
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={ring}
        data-hover="false"
        className="absolute -ml-5 -mt-5 h-10 w-10 rounded-full border border-brand/60 transition-[width,height,opacity] duration-300 data-[hover=true]:h-16 data-[hover=true]:w-16 data-[hover=true]:-ml-8 data-[hover=true]:-mt-8 data-[hover=true]:border-brand"
        style={{ boxShadow: "0 0 30px -6px rgba(234,179,8,0.6)" }}
      />
      <div ref={dot} className="absolute -ml-1 -mt-1 h-2 w-2 rounded-full bg-brand" style={{ boxShadow: "0 0 12px 2px rgba(234,179,8,0.95)" }} />
    </div>
  );
}
