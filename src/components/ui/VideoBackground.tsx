"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fullscreen cinematic backdrop (dark theme only).
 * - Plays /videos/hero-bg.mp4 if present (drop your own loop there).
 * - Gracefully falls back to an animated aurora gradient if the video is
 *   missing, on mobile, or when reduced-motion is requested.
 * - Always darkened + noise-textured so foreground content stays readable.
 */
export default function VideoBackground({ src = "/videos/hero-bg.mp4" }: { src?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    if (reduce || small) return; // keep it light on mobile / reduced motion
    const v = video.current;
    if (!v) return;
    const onOk = () => setUseVideo(true);
    v.addEventListener("canplay", onOk, { once: true });
    v.addEventListener("error", () => setUseVideo(false), { once: true });
    v.load();
    v.play().catch(() => {});
    return () => v.removeEventListener("canplay", onOk);
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-30 hidden overflow-hidden dark:block">
      {/* animated aurora fallback (always rendered behind the video) */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#0b1120_0%,#04060B_55%)]" />
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-electric/20 blur-[150px] animate-aurora" />
      <div className="absolute right-[-12rem] top-24 h-[38rem] w-[38rem] rounded-full bg-cyan/15 blur-[160px] animate-aurora [animation-delay:-7s]" />
      <div className="absolute bottom-[-14rem] left-1/3 h-[44rem] w-[44rem] rounded-full bg-energy/10 blur-[170px] animate-aurora [animation-delay:-12s]" />

      {/* video */}
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${useVideo ? "opacity-100" : "opacity-0"}`}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* darken + vignette */}
      <div className="absolute inset-0 bg-[#04060B]/70" />
      <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_40%,transparent_40%,rgba(4,6,11,0.85)_100%)]" />

      {/* animated grain / noise */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}
