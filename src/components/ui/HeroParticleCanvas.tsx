"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

type Dot = { x: number; y: number; vx: number; vy: number; r: number };
type Density = "subtle" | "normal" | "rich";

const DENSITY: Record<
  Density,
  { mobile: number; desktop: number; linkDist: number; speed: number; sizeMin: number; sizeRange: number }
> = {
  subtle: { mobile: 28, desktop: 44, linkDist: 120, speed: 0.36, sizeMin: 2.2, sizeRange: 2.8 },
  normal: { mobile: 36, desktop: 56, linkDist: 135, speed: 0.4, sizeMin: 2.4, sizeRange: 3.2 },
  rich: { mobile: 42, desktop: 68, linkDist: 145, speed: 0.42, sizeMin: 2.6, sizeRange: 3.4 },
};

/** 2D particle network — auto-drifting dots with links; pauses off-screen / tab hidden. */
export default function HeroParticleCanvas({
  className = "",
  density = "normal",
}: {
  className?: string;
  density?: Density;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    const cfg = DENSITY[density];
    const count = reduce ? 0 : mobile ? cfg.mobile : cfg.desktop;

    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let visible = true;
    let mouse = { x: -9999, y: -9999 };

    const seed = () => {
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        r: Math.random() * cfg.sizeRange + cfg.sizeMin,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!visible || count === 0 || document.hidden) return;

      const dark = themeRef.current === "dark";
      ctx.clearRect(0, 0, w, h);

      for (const p of dots) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const md = Math.hypot(dx, dy);
        if (md < 110 && md > 0) {
          p.x += (dx / md) * 1.35;
          p.y += (dy / md) * 1.35;
        }
      }

      const linkDist = cfg.linkDist;
      const linkBase = dark ? 0.3 : 0.22;
      ctx.lineWidth = dark ? 1.05 : 0.95;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * linkBase;
            ctx.strokeStyle = dark ? `rgba(34,224,255,${a})` : `rgba(46,107,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of dots) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (dark) {
          ctx.fillStyle = `rgba(34,224,255,${0.55 + p.r * 0.1})`;
          ctx.shadowColor = "rgba(34,224,255,0.55)";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(46,107,255,${0.5 + p.r * 0.08})`;
          ctx.shadowColor = "rgba(46,107,255,0.4)";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouse = { x: -9999, y: -9999 };
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      io.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
