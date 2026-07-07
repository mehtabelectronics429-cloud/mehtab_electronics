"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

type Dot = { x: number; y: number; vx: number; vy: number; r: number };
type Density = "subtle" | "normal" | "rich";

const DENSITY: Record<Density, { mobile: number; desktop: number; linkMul: number; dotMul: number }> = {
  subtle: { mobile: 28, desktop: 48, linkMul: 0.85, dotMul: 0.9 },
  normal: { mobile: 36, desktop: 62, linkMul: 1, dotMul: 1 },
  rich: { mobile: 42, desktop: 78, linkMul: 1.2, dotMul: 1.25 },
};

/** Lightweight 2D particle network — theme-aware, pauses off-screen. */
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
    const ctx = canvas.getContext("2d", { alpha: true });
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
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        r: Math.random() * 3.5 + 2.5,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.75);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!visible || count === 0) return;

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
          p.x += (dx / md) * 1.4;
          p.y += (dy / md) * 1.4;
        }
      }

      const linkDist = (dark ? 140 : 125) * cfg.linkMul;
      const linkBase = (dark ? 0.32 : 0.24) * cfg.linkMul;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * linkBase;
            ctx.strokeStyle = dark ? `rgba(34,224,255,${a})` : `rgba(46,107,255,${a})`;
            ctx.lineWidth = dark ? 1.1 : 1;
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
          ctx.fillStyle = `rgba(34,224,255,${(0.5 + p.r * 0.14) * cfg.dotMul})`;
          ctx.shadowColor = "rgba(34,224,255,0.65)";
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = `rgba(46,107,255,${(0.5 + p.r * 0.1) * cfg.dotMul})`;
          ctx.shadowColor = "rgba(46,107,255,0.5)";
          ctx.shadowBlur = 10;
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

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    }, { threshold: 0.02 });
    io.observe(canvas);

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      io.disconnect();
    };
  }, [density]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
