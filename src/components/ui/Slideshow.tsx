"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

type Slide = { src: string; caption?: string; sub?: string };

/**
 * Lightweight crossfade slideshow  pure CSS opacity transitions (no heavy
 * carousel lib), autoplay with pause-on-hover, arrows + dots, keyboard-free
 * and reduced-motion friendly.
 */
export default function Slideshow({
  slides,
  className,
  aspect = "aspect-[16/10]",
  interval = 4500,
  autoplay = true,
}: {
  slides: Slide[];
  className?: string;
  aspect?: string;
  interval?: number;
  autoplay?: boolean;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!autoplay || paused || n <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    timer.current = setInterval(() => setI((v) => (v + 1) % n), interval);
    return () => clearInterval(timer.current);
  }, [autoplay, paused, n, interval]);

  if (!n) return null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-line/15 shadow-card",
        aspect,
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, idx) => (
        <div
          key={s.src + idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            idx === i ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={idx !== i}
        >
          <SmartImage
            src={s.src}
            alt={s.caption ?? ""}
            className="h-full w-full"
            priority={idx === 0}
          />
          {(s.caption || s.sub) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                {s.sub && (
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-brand">
                    {s.sub}
                  </div>
                )}
                {s.caption && (
                  <div className="mt-1 font-display text-lg uppercase tracking-wide text-white md:text-xl">
                    {s.caption}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      {n > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-black/45 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/70 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-black/45 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/70 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === i
                    ? "w-6 bg-brand"
                    : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
