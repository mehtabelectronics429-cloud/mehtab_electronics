"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  SunIcon,
  CameraIcon,
  BatteryFull,
  ChartBarStackedIcon,
} from "lucide-react";
import { COMPANY } from "@/lib/data";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/ui/Logo";

type NavItem = {
  label: string;
  href: string;
  icon?: any;
  children?: { label: string; href: string; desc?: string; icon?: any }[];
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        icon: <SunIcon size={30} />,
        label: "Solar Systems",
        href: "/services/solar",
        desc: "On-grid, off-grid & hybrid installs",
      },
      {
        icon: <CameraIcon size={30} />,
        label: "CCTV & Security",
        href: "/services/cctv",
        desc: "HD/4K camera networks",
      },
    ],
  },
  {
    label: "Products",
    href: "/products",
    children: [
      {
        icon: <SunIcon size={30} />,
        label: "Solar Panels",
        href: "/products/solar-panels",
        desc: "Tier-1 mono-PERC modules",
      },
      {
        icon: <ChartBarStackedIcon size={30} />,
        label: "Inverters",
        href: "/products/inverters",
        desc: "Hybrid & on-grid inverters",
      },
      {
        icon: <BatteryFull size={30} />,
        label: "Batteries",
        href: "/products/batteries",
        desc: "Lithium & tubular backup",
      },
      {
        icon: <CameraIcon size={30} />,
        label: "Cameras",
        href: "/products/cameras",
        desc: "IP & analog CCTV",
      },
    ],
  },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/" && pathname?.startsWith(item.href));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-line/15 bg-bg/85 shadow-card backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Logo markSize={38} />

        {/* desktop nav */}
        <div className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item);
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex relative font-mono text-[0.72rem] font-bold uppercase tracking-[0.16em] transition-colors duration-300",
                    active ? "text-brand" : "text-fg/60 hover:text-fg",
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            }
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 font-mono text-[0.72rem] font-bold uppercase tracking-[0.16em] transition-colors duration-300",
                    active ? "text-brand" : "text-fg/60 hover:text-fg",
                  )}
                >
                  {item.label}
                  <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
                </Link>
                {/* dropdown */}
                <div className="invisible absolute left-1/2 top-full z-10 w-64 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-lg border border-line/15 bg-surface/95 p-2 shadow-card-lg backdrop-blur-xl">
                    {item.children.map((c) => (
                      <div className="flex items-center gap-2 p-1 rounded-md transition-colors hover:bg-brand/10">
                        <span>{c.icon}</span>
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block rounded-md  transition-colors hover:bg-brand/10"
                        >
                          <div className="flex font-display text-sm uppercase tracking-wide text-fg">
                            <span> {c.label} </span>
                          </div>
                          {c.desc && (
                            <div className="mt-0.5 text-xs text-fg/50">
                              {c.desc}
                            </div>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a
            href={COMPANY.phoneHref}
            className="btn-brand !py-2.5 text-gray-800"
          >
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

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mb-4 max-h-[80vh] overflow-y-auto rounded-lg border border-line/15 bg-surface/95 p-4 shadow-card-lg backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col">
              {NAV.map((item) => (
                <div
                  key={item.href}
                  className="border-b border-line/10 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 py-3 font-mono text-sm font-bold uppercase tracking-[0.16em] text-fg/80"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <button
                        onClick={() =>
                          setOpenGroup((g) =>
                            g === item.label ? null : item.label,
                          )
                        }
                        aria-label={`Toggle ${item.label}`}
                        className="grid h-9 w-9 place-items-center text-fg/50"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openGroup === item.label && "rotate-180",
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {item.children && openGroup === item.label && (
                    <div className="pb-2 pl-3">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block py-2 text-sm text-fg/60"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <a
                href={COMPANY.phoneHref}
                className="btn-brand mt-4 justify-center"
              >
                <Phone className="h-3.5 w-3.5" /> Call Now · {COMPANY.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
