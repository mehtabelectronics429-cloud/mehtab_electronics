"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, ArrowUpRight } from "lucide-react";
import { COMPANY } from "@/lib/data";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const EXPLORE = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Solar", href: "/solar" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
const CATEGORIES = [
  { label: "Solar Panels", href: "/products" },
  { label: "Inverters", href: "/products" },
  { label: "Security Cameras", href: "/products" },
  { label: "CCTV Packages", href: "/products" },
];
const SOCIALS = [Facebook, Instagram, Linkedin, Youtube];

export default function Footer() {
  const [sent, setSent] = useState(false);
  return (
    <footer className="relative overflow-hidden border-t border-line/10 bg-surface/40">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-electric/15 blur-[140px]" />
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyan shadow-glow-blue">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base tracking-wider text-fg">MEHTAB</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg/50">
              {COMPANY.tagline} Solar panels, inverters and security cameras — professionally installed.
            </p>
            <div className="mt-6 space-y-2 text-sm text-fg/60">
              <a href={COMPANY.phoneHref} className="flex items-center gap-2 hover:text-fg"><Phone className="h-4 w-4 text-cyan" /> {COMPANY.phone}</a>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 hover:text-fg"><Mail className="h-4 w-4 text-cyan" /> {COMPANY.email}</a>
              <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" /> {COMPANY.address}</span>
            </div>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map((S, i) => (
                <a key={i} href="#" aria-label="social" className="grid h-9 w-9 place-items-center rounded-full glass hairline text-fg/70 transition-colors hover:border-cyan/40 hover:text-cyan">
                  <S className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Explore" links={EXPLORE} />
          <div>
            <FooterCol title="Categories" links={CATEGORIES} />
            <div className="mt-8">
              <h4 className="font-mono text-[0.7rem] uppercase tracking-widest text-fg/45">Newsletter</h4>
              {sent ? (
                <p className="mt-4 text-sm text-energy">Subscribed — thank you!</p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-4 flex overflow-hidden rounded-full glass hairline">
                  <input required type="email" placeholder="Email" className="w-full bg-transparent px-4 py-2.5 text-sm text-fg outline-none placeholder:text-fg/40" />
                  <button type="submit" aria-label="Subscribe" className="grid w-11 shrink-0 place-items-center bg-gradient-to-r from-electric to-cyan text-white"><ArrowUpRight className="h-4 w-4" /></button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/10 pt-8 md:flex-row">
          <p className="text-xs text-fg/40">© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <WhatsAppButton label="Chat with us" variant="ghost" className="!py-2 !text-xs" message={`Hello ${COMPANY.name}!`} />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-mono text-[0.7rem] uppercase tracking-widest text-fg/45">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}><Link href={l.href} className="text-sm text-fg/60 transition-colors hover:text-cyan">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
