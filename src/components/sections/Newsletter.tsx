"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { COMPANY } from "@/lib/data";

export default function Newsletter() {
  const [sent, setSent] = useState(false);
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-8">
      <Reveal>
        <div className="animated-border relative overflow-hidden rounded-[2.5rem] glass p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-60" />
          <span className="eyebrow">Ready when you are</span>
          <h2 className="display-md mx-auto mt-4 max-w-3xl text-fg">
            Power your building the <span className="text-gradient">smart way</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-fg/60">
            Get a free site survey, or subscribe for energy tips, new products and installation stories.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3">
            {sent ? (
              <div className="flex items-center gap-2 text-energy"><CheckCircle2 className="h-5 w-5" /> You&apos;re subscribed — thank you!</div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex w-full flex-col gap-3 sm:flex-row">
                <input required type="email" placeholder="you@email.com" className="input flex-1" />
                <button type="submit" className="sheen group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric to-cyan px-6 py-3 text-sm font-medium text-white shadow-glow-blue transition-transform duration-300 hover:scale-[1.03]">
                  Subscribe <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </form>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-fg/40">or</span>
              <WhatsAppButton label="Chat on WhatsApp" variant="ghost" message={`Hello ${COMPANY.name}, I'd like a free site survey.`} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
