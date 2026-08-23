"use client";

import { useState } from "react";
import { Phone, MessageCircle, Quote } from "lucide-react";
import { OWNERS, type Owner } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export default function Owners() {
  return (
    <section id="owners" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center">
          <div className="mono-label">Ownership</div>
          <h2 className="mt-4 display-lg text-fg">
            The family behind <span className="text-accent">Mehtab</span>
          </h2>
          <p className="lead mx-auto mt-5 max-w-2xl">
            A team running Mehtab Electronics with one promise since 1996
            genuine products, honest advice and service you can trust.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {OWNERS.map((o) => (
            <OwnerCard key={o.role} owner={o} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OwnerCard({ owner }: { owner: Owner }) {
  const title = owner.name || owner.role;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line/15 bg-surface/40 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow-brand">
      {/* accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0" />

      <div className="grid sm:grid-cols-[minmax(0,15rem)_1fr]">
        {/* portrait */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-brand/20 via-surface to-cyan/10 sm:aspect-auto sm:h-full sm:min-h-[20rem]">
          <Portrait src={owner.image} name={owner.name} />
          {/* subtle overlay for depth / text legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
        </div>

        {/* info */}
        <div className="flex flex-col justify-center p-6 md:p-7">
          {owner.since && (
            <span className="inline-flex w-fit items-center rounded-full border border-brand/25 bg-brand/5 px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand">
              {owner.since}
            </span>
          )}
          <h3 className="mt-3 font-display text-2xl uppercase tracking-wide text-fg">
            {title}
          </h3>
          <div className="mt-0.5 text-sm font-medium text-accent">
            {owner.role}
          </div>

          <p className="relative mt-4 pl-5 text-sm leading-relaxed text-fg/60">
            <Quote className="absolute left-0 top-0.5 h-3.5 w-3.5 text-brand/50" />
            {owner.bio}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {owner.phoneHref && (
              <a
                href={owner.phoneHref}
                className="btn-brand text-gray-800"
                aria-label={`Call ${title}`}
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            )}
            <a
              href={waLink(
                `Hello, I'd like to speak with ${title} at Mehtab Electronics.`,
                owner.whatsapp,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Portrait with a graceful initials fallback until the real photo is added. */
function Portrait({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ME";

  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/25 via-surface to-cyan/10">
        <span className="font-display text-6xl font-bold text-brand/60">
          {initials}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name || "Owner"}
      onError={() => setFailed(true)}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover object-top"
    />
  );
}
