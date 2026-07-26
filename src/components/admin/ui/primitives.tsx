"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md";
export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }>(
  function Button({ className, variant = "primary", size = "md", ...props }, ref) {
    const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 disabled:opacity-50 disabled:pointer-events-none";
    const sizes: Record<BtnSize, string> = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm" };
    const variants: Record<BtnVariant, string> = {
      primary: "bg-gradient-to-r from-electric to-cyan text-white shadow-[0_8px_30px_-12px_rgba(46,107,255,0.7)] hover:brightness-110",
      secondary: "border border-white/10 bg-white/5 text-[var(--admin-fg)] hover:bg-white/10",
      ghost: "text-[var(--admin-muted)] hover:bg-white/5 hover:text-[var(--admin-fg)]",
      danger: "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
    };
    return <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...props} />;
  }
);

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl", className)}>{children}</div>;
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.7rem] font-medium", className)}>{children}</span>;
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-white/10 bg-[var(--admin-input)] px-3.5 text-sm text-[var(--admin-fg)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-cyan/50 focus:ring-2 focus:ring-cyan/15",
          className,
        )}
        {...props}
      />
    );
  }
);
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "admin-select h-10 w-full rounded-xl border border-white/10 bg-[var(--admin-input)] px-3 text-sm text-[var(--admin-fg)] outline-none transition focus:border-cyan/50 focus:ring-2 focus:ring-cyan/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-[var(--admin-input)] px-3.5 py-2.5 text-sm text-[var(--admin-fg)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-cyan/50 focus:ring-2 focus:ring-cyan/15",
          className,
        )}
        {...props}
      />
    );
  }
);
export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-[var(--admin-muted)]", className)} {...props}>
      {children}
    </label>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} />;
}
