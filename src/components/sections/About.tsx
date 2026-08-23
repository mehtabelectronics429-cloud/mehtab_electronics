"use client";

import Reveal from "@/components/ui/Reveal";
import GlassCard from "@/components/ui/GlassCard";
import SmartImage from "@/components/ui/SmartImage";
import { Heart, Lightbulb, HandHeart } from "lucide-react";

const tributes = [
  {
    icon: Lightbulb,
    title: "A visionary",
    body: "He saw solar and security as the future long before Punjab did  and built a name on it.",
  },
  {
    icon: HandHeart,
    title: "A mentor",
    body: "He led by example, teaching a family and a team the value of honest work and genuine care.",
  },
  {
    icon: Heart,
    title: "A heart of gold",
    body: "Trusted by thousands, remembered by all  his warmth is woven into everything we do.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2">
        {/* Portrait */}
        <Reveal delay={0.15} className="relative order-1 lg:order-none">
          <GlassCard className="overflow-hidden p-2">
            <SmartImage
              src="/images/founder-legacy.jpg"
              alt="Late Mr. Muhammad Ijaz, Founder of Mehtab Electronics, with Mudassar Sherazi Adv., CEO"
              className="aspect-[5/4] rounded-2xl"
              priority
            />
          </GlassCard>
          <div className="absolute -bottom-6 -left-6 hidden w-64 rounded-2xl glass hairline p-5 md:block">
            <div className="font-display text-sm tracking-wide text-fg">
              Late Mr. Muhammad Ijaz
            </div>
            <div className="mt-1 text-xs leading-relaxed text-fg/50">
              Founder, with Mudassar Sherazi Adv.  CEO, Mehtab Electronics
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan/30 blur-3xl" />
        </Reveal>

        {/* Tribute */}
        <div>
          <div className="mono-label text-brand">In loving memory</div>
          <h2 className="mt-4 display-lg text-fg">
            Inspiration personified
            <span className="text-gradient"> the legend of electronics</span>.
          </h2>
          <p className="lead mt-5 max-w-xl">
            The founder of Mehtab Electronics. A visionary, a mentor, a heart of
            gold  who turned a small electronics shop into one of Punjab&apos;s
            most trusted names in solar and security. His legacy lives on in
            every install, every promise kept and every family we serve.
          </p>

          <div className="mt-10 space-y-5">
            {tributes.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl glass hairline text-brand">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-display text-sm tracking-wide text-fg">
                      {t.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-fg/55">
                      {t.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
