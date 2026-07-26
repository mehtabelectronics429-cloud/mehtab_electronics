"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  SunIcon,
  CameraIcon,
  Search,
  Package,
} from "lucide-react";
import { COMPANY } from "@/lib/data";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/ui/Logo";

type NavChild = {
  label: string;
  href: string;
  desc?: string;
  icon?: ReactNode;
  image?: string;
};
type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavChild[];
};

const SERVICES: NavChild[] = [
  {
    icon: <SunIcon size={22} />,
    label: "Solar Systems",
    href: "/services/solar",
  },
  {
    icon: <CameraIcon size={22} />,
    label: "CCTV & Security",
    href: "/services/cctv",
  },
];

const STATIC_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services", children: SERVICES },
  { label: "Products", href: "/products", children: [] },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function CategoryThumb({
  image,
  label,
  icon,
}: {
  image?: string;
  label: string;
  icon?: ReactNode;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="h-9 w-9 shrink-0 rounded-md object-cover"
      />
    );
  }
  if (icon) {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
        {icon}
      </span>
    );
  }
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
      <Package className="h-5 w-5" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [categories, setCategories] = useState<NavChild[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/categories");
        if (!res.ok) return;
        const data = (await res.json()) as {
          items?: { name: string; slug: string; image?: string }[];
        };
        if (cancelled) return;
        setCategories(
          (data.items ?? []).map((c) => ({
            label: c.name,
            href: `/products/${c.slug}`,
            image: c.image?.trim() || undefined,
          })),
        );
      } catch {
        /* keep empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const NAV = useMemo(
    () =>
      STATIC_NAV.map((item) =>
        item.label === "Products"
          ? { ...item, children: categories.length ? categories : undefined }
          : item,
      ),
    [categories],
  );

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/" && pathname?.startsWith(item.href));

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  };

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

        <div className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item);
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex font-mono text-[0.72rem] font-bold uppercase tracking-[0.16em] transition-colors duration-300",
                    active ? "text-brand" : "text-fg/60 hover:text-fg",
                  )}
                >
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
                <div className="invisible absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-line/15 bg-surface/95 p-1.5 shadow-card-lg backdrop-blur-xl">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-brand/10"
                      >
                        <CategoryThumb
                          image={c.image}
                          label={c.label}
                          icon={c.icon}
                        />
                        <span className="font-display text-sm uppercase tracking-wide text-fg">
                          {c.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-line/15 text-fg/70 transition-colors hover:text-fg"
          >
            <Search className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <a
            href={COMPANY.phoneHref}
            className="btn-brand !py-2.5 text-gray-800"
          >
            <Phone className="h-3.5 w-3.5" /> Call Now
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-line/15 text-fg"
          >
            <Search className="h-4 w-4" />
          </button>
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
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto max-w-7xl px-5 pb-4 md:px-8"
          >
            <form
              onSubmit={submitSearch}
              className="flex items-center gap-2 rounded-lg border border-line/15 bg-surface/95 p-2 shadow-card backdrop-blur-xl"
            >
              <Search className="ml-2 h-4 w-4 shrink-0 text-fg/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-fg outline-none placeholder:text-fg/40"
              />
              <button type="submit" className="btn-brand !py-2 text-sm">
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <div className="space-y-1 pb-2 pl-1">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-fg/70 hover:bg-brand/10"
                        >
                          <CategoryThumb
                            image={c.image}
                            label={c.label}
                            icon={c.icon}
                          />
                          <span>{c.label}</span>
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
