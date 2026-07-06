"use client";

import { useRef, useEffect, forwardRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
};

/** Magnetic button — elastic.out quickTo per UI/UX Pro Max motion spec. */
const MagneticButton = forwardRef<HTMLAnchorElement, Props>(function MagneticButton(
  { children, href = "#", onClick, variant = "primary", className },
  _ref
) {
  const el = useRef<HTMLAnchorElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    const inner = label.current;
    if (!node || window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(node, "x", { duration: 0.5, ease: "elastic.out(1,0.4)" });
    const yTo = gsap.quickTo(node, "y", { duration: 0.5, ease: "elastic.out(1,0.4)" });
    const lxTo = gsap.quickTo(inner, "x", { duration: 0.5, ease: "elastic.out(1,0.4)" });
    const lyTo = gsap.quickTo(inner, "y", { duration: 0.5, ease: "elastic.out(1,0.4)" });

    const onMove = (e: MouseEvent) => {
      const r = node.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      xTo(mx * 0.3);
      yTo(my * 0.3);
      lxTo(mx * 0.15);
      lyTo(my * 0.15);
    };
    const onLeave = () => {
      xTo(0); yTo(0); lxTo(0); lyTo(0);
    };

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium tracking-wide will-change-transform";
  const styles =
    variant === "primary"
      ? "text-white bg-gradient-to-r from-electric to-cyan shadow-glow-blue"
      : "text-fg/90 glass hairline";

  return (
    <a
      ref={el}
      href={href}
      onClick={onClick}
      data-magnetic
      className={cn(base, styles, className)}
    >
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      )}
      <span ref={label} className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </a>
  );
});

export default MagneticButton;
