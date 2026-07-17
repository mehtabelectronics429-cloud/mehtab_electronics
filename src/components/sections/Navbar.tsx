"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { COMPANY } from "@/lib/data";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

const ROUTES = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-brand text-on-brand">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20V8l8-5 8 5v12" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </span>
      <span className="font-display text-base uppercase tracking-wide text-fg">
        Mehtab <span className="text-brand">Electronics</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled ? "border-b border-line/15 bg-bg/85 shadow-card backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Logo />

        <div className="hidden items-center gap-8 lg:flex">
          {ROUTES.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative font-mono text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors duration-300",
                  active ? "text-brand" : "text-fg/60 hover:text-fg"
                )}
              >
                {l.label}
                {active && <motion.span layoutId="nav-active" className="absolute -bottom-1.5 left-0 h-px w-full bg-brand" />}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a href={COMPANY.phoneHref} className="btn-brand !py-2.5">
            <Phone className="h-3.5 w-3.5" /> Call Now
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-line/15 text-fg"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mb-4 rounded-lg border border-line/15 bg-surface/90 p-6 shadow-card-lg backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {ROUTES.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-fg/80"
                >
                  {l.label}
                </Link>
              ))}
              <a href={COMPANY.phoneHref} className="btn-brand mt-2 justify-center">
                <Phone className="h-3.5 w-3.5" /> Call Now · {COMPANY.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
