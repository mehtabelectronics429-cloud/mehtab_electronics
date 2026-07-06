"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { COMPANY, SERVICES } from "@/lib/data";
import { Phone, Mail, MapPin, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function Contact({ showHeading = true }: { showHeading?: boolean }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", service: SERVICES[0].title, message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const details = [
    { icon: Phone, label: "Call us", value: COMPANY.phone, href: COMPANY.phoneHref },
    { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: MapPin, label: "Visit", value: COMPANY.address },
    { icon: Clock, label: "Hours", value: COMPANY.hours },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-60" />
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            {showHeading ? (
              <SectionHeading
                eyebrow="Start your project"
                title={<>Let&apos;s build something <span className="text-gradient">powerful</span>.</>}
                intro="Book a free site survey. Tell us about your building and goals — our engineers will design a system that fits."
              />
            ) : (
              <div>
                <span className="eyebrow">Reach us directly</span>
                <p className="lead mt-5 max-w-md">Prefer to talk? Call, email or drop by — or use the form and we&apos;ll reply within one business day.</p>
              </div>
            )}

            {/* quick actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={COMPANY.phoneHref} className="sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-electric to-cyan px-6 py-3 text-sm font-medium text-white shadow-glow-blue transition-transform duration-300 hover:scale-[1.03]">
                <Phone className="h-4 w-4" /> Call now
              </a>
              <WhatsAppButton label="WhatsApp us" message={`Hello ${COMPANY.name}, I'd like a free site survey.`} />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {details.map((d) => (
                <Reveal key={d.label}>
                  <a href={d.href} className="flex h-full items-start gap-3 rounded-2xl glass hairline p-5 transition-colors duration-300 hover:border-cyan/30">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fg/5 text-cyan ring-1 ring-fg/10">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-mono text-[0.7rem] uppercase tracking-widest text-fg/45">{d.label}</div>
                      <div className="mt-1 text-sm text-fg/85">{d.value}</div>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>

            {/* animated map placeholder */}
            <Reveal delay={0.1}>
              <div className="mt-4 relative overflow-hidden rounded-2xl glass hairline h-40">
                <div className="absolute inset-0 bg-grid-lines [background-size:36px_36px] opacity-40" />
                <div className="absolute inset-0 bg-aurora opacity-50" />
                <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-glow">
                  <span className="absolute inset-0 rounded-full bg-cyan/60 animate-pulseRing" />
                </span>
                <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] uppercase tracking-widest text-fg/50">Lahore · Punjab · PK</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-[2rem] glass hairline p-7 md:p-9">
              {sent ? (
                <div className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-14 w-14 text-energy" />
                  <h3 className="mt-6 font-display text-xl text-fg">Request received</h3>
                  <p className="mt-3 max-w-sm text-sm text-fg/60">Thanks, {form.name || "there"}. Our team will reach out within one business day to schedule your free site survey.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-sm text-cyan underline-offset-4 hover:underline">Send another request</button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <Field label="Full name">
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ayesha Khan" className="input" />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 3xx xxxxxxx" className="input" />
                  </Field>
                  <Field label="Service of interest">
                    <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="input">
                      {SERVICES.map((s) => <option key={s.key} className="bg-surface">{s.title}</option>)}
                    </select>
                  </Field>
                  <Field label="Tell us about your project">
                    <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Roof size, load, location, timeline…" className="input resize-none" />
                  </Field>
                  <button type="submit" className="sheen group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric to-cyan px-8 py-4 text-sm font-medium text-white shadow-glow-blue transition-transform duration-300 hover:scale-[1.02]">
                    Request free site survey
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  <p className="text-center text-xs text-fg/40">No obligation · We reply within 1 business day</p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[0.7rem] uppercase tracking-widest text-fg/45">{label}</span>
      {children}
    </label>
  );
}
