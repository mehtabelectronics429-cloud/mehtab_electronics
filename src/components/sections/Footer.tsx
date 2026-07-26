"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { COMPANY } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import Logo from "@/components/ui/Logo";

const EXPLORE = [
  { label: "Solar Systems", href: "/services/solar" },
  { label: "CCTV & Security", href: "/services/cctv" },
  { label: "Products", href: "/products" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Search", href: "/search" },
];

export default function Footer() {
  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/categories");
        if (!res.ok) return;
        const data = (await res.json()) as {
          items?: { name: string; slug: string }[];
        };
        if (!cancelled) setCategories(data.items ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="relative border-t border-line/15 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <Logo markSize={42} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg/50">
              Solar systems, CCTV networks and wholesale supply engineered
              across Punjab from our Narowal base.
            </p>
          </div>

          <FooterCol title="Explore">
            {EXPLORE.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-fg/60 transition-colors hover:text-brand"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Products">
            {categories.length === 0 ? (
              <li>
                <Link
                  href="/products"
                  className="text-sm text-fg/60 transition-colors hover:text-brand"
                >
                  All products
                </Link>
              </li>
            ) : (
              categories.slice(0, 8).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products/${c.slug}`}
                    className="text-sm text-fg/60 transition-colors hover:text-brand"
                  >
                    {c.name}
                  </Link>
                </li>
              ))
            )}
          </FooterCol>

          <FooterCol title="Contact">
            {COMPANY.contacts.map((c) => (
              <li key={c.phone}>
                <a
                  href={c.phoneHref}
                  className="flex items-center gap-2 text-sm text-fg/60 hover:text-brand"
                >
                  <Phone className="h-3.5 w-3.5 text-brand" /> {c.phone}
                </a>
              </li>
            ))}
            <li>
              <a
                href={waLink(`Hello ${COMPANY.name}!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-fg/60 hover:text-brand"
              >
                <MessageCircle className="h-3.5 w-3.5 text-brand" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 text-sm text-fg/60 hover:text-brand"
              >
                <Mail className="h-3.5 w-3.5 text-brand" /> {COMPANY.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-fg/60">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />{" "}
              Narowal, Punjab, Pakistan
            </li>
          </FooterCol>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line/15 pt-7 md:flex-row">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-fg/40">
            © {new Date().getFullYear()} {COMPANY.name} Mudassar Sherazi &amp;
            M. Qasim
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-fg/40">
            Serving all Punjab
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-brand">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}
