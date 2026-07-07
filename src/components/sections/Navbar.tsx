"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { COMPANY } from "@/lib/data";
import MagneticButton from "@/components/ui/MagneticButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const ROUTES = [
  { label: "Products", href: "/products" },
  { label: "Solar", href: "/solar" },
  { label: "Security", href: "/security" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 320 && y > last && !open);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -120 : 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className={cn("mx-auto flex max-w-7xl items-center justify-between px-5 py-4 transition-all duration-500 md:px-8", scrolled && "mt-3 md:mx-6")}>
        <div className={cn("flex w-full items-center justify-between rounded-full px-4 py-2 transition-all duration-500", scrolled && "glass hairline px-5")}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyan shadow-glow-blue">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display text-sm tracking-wider text-fg">MEHTAB</span>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {ROUTES.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className={cn("relative text-sm transition-colors duration-300", active ? "text-fg" : "text-fg/60 hover:text-fg")}>
                  {l.label}
                  {active && <motion.span layoutId="nav-active" className="absolute -bottom-1.5 left-0 h-px w-full bg-cyan" />}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <MagneticButton href="/contact" className="!px-6 !py-2.5 text-xs">Get a Quote</MagneticButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" className="grid h-10 w-10 place-items-center rounded-full glass hairline text-fg">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-5 glass hairline rounded-3xl p-6 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {ROUTES.map((l) => (
                <Link key={l.href} href={l.href} className="text-lg text-fg/80">{l.label}</Link>
              ))}
              <Link href="/contact" className="mt-2 rounded-full bg-gradient-to-r from-electric to-cyan px-6 py-3 text-center text-sm font-medium text-white">
                Get a Quote · {COMPANY.phone}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
