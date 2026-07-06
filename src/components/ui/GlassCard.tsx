"use client";

import { cn } from "@/lib/utils";

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}) {
  return (
    <div className={cn("glass rounded-3xl", hover && "glass-hover", glow && "animated-border glow-pulse", className)}>
      {children}
    </div>
  );
}
