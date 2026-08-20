"use client";

import { Phone, MapPin, MessageCircle, Navigation, Globe } from "lucide-react";
import { COMPANY } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export default function ContactShop() {
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-8 lg:grid-cols-2 lg:items-center">
        {/* left: address + people */}
        <div>
          <div className="mono-label">Visit our shop</div>
          <h2 className="mt-4 display-lg text-fg">
            Come see us in
            <br />
            <span className="text-accent">Narowal.</span>
          </h2>
          <p className="lead mt-6 max-w-md">
            Walk into our shop for hands-on demos, dealer pricing or a chat with
            our team. Prefer to talk first? Call or WhatsApp we respond fast.
          </p>

          {/* what we deal in */}
          <div className="mt-6 flex flex-wrap gap-2">
            {COMPANY.dealsIn.map((item) => (
              <span
                key={item}
                className="rounded-full border border-brand/25 bg-brand/5 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-wide text-fg/70"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Row icon={MapPin} label="Address">
              {COMPANY.address}
            </Row>
            {COMPANY.contacts.map((c) => (
              <Row key={c.name} icon={Phone} label={c.name} href={c.phoneHref}>
                {c.phone}
              </Row>
            ))}
          </div>

          {/* free offer + CTA */}
          <div className="mt-6 rounded-md border border-brand/25 bg-brand/5 p-4">
            <div className="mono-label !text-brand">{COMPANY.freeOffer}</div>
            <p className="mt-1 font-display text-lg uppercase tracking-wide text-fg">
              {COMPANY.ctaLine}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={COMPANY.phoneHref} className="btn-brand text-gray-800">
              <Phone className="h-4 w-4" /> Call now
            </a>
            <a
              href={waLink(`Hello ${COMPANY.name}! I'd like more information.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
            <a
              href={COMPANY.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>

          <a
            href={COMPANY.websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-fg/55 transition-colors hover:text-brand"
          >
            <Globe className="h-4 w-4 text-brand" /> {COMPANY.website}
          </a>
        </div>

        {/* right: map */}
        <div className="relative overflow-hidden rounded-lg border border-line/15 shadow-glow-brand">
          <iframe
            title="Mehtab Electronics — Railway Road, Narowal"
            src={COMPANY.mapEmbed}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[26rem] w-full grayscale-[0.2] contrast-110"
            style={{ border: 0 }}
          />
          <span className="pointer-events-none absolute left-4 top-4 rounded-sm bg-brand px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-on-brand">
            Narowal · PK
          </span>
          <a
            href={COMPANY.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-sm bg-surface/90 px-3 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-fg shadow-card backdrop-blur transition-colors hover:text-brand"
          >
            <Navigation className="h-3.5 w-3.5 text-brand" /> Open in Maps
          </a>
        </div>
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: typeof Phone;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-start gap-3 rounded-md border border-line/15 bg-surface/40 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/10 text-brand ring-1 ring-brand/20">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="mono-label !text-fg/45">{label}</div>
        <div className="mt-1 font-display text-lg uppercase tracking-wide text-fg">
          {children}
        </div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}
