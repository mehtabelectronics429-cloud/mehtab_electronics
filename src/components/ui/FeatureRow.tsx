"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import Icon from "./Icon";
import SmartImage from "./SmartImage";
import MagneticButton from "./MagneticButton";
import { cn } from "@/lib/utils";
import type { Feat } from "@/lib/features";

export type { Feat } from "@/lib/features";

export default function FeatureRow({
  id, eyebrow, title, body, points = [], image, reverse, accent = "text-cyan", cta = "Discuss your project",
}: Feat) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id={id} ref={ref} className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className={cn("grid items-center gap-12 lg:grid-cols-2", reverse && "lg:[direction:rtl]")}>
        <div className="lg:[direction:ltr]">
          <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>
          <Reveal delay={0.08}><h2 className="display-lg mt-4 text-fg">{title}</h2></Reveal>
          <Reveal delay={0.16}><p className="mt-6 max-w-lg text-lg leading-relaxed text-fg/60">{body}</p></Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map((p, i) => (
              <Reveal key={i} delay={0.2 + i * 0.06}>
                <div className="flex items-center gap-3 rounded-2xl glass hairline px-4 py-3">
                  <Icon name={p.icon} className={cn("h-5 w-5 shrink-0", accent)} />
                  <span className="text-sm text-fg/75">{p.text}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4} className="mt-8">
            <MagneticButton href="#contact" variant="ghost">{cta}</MagneticButton>
          </Reveal>
        </div>

        <motion.div style={{ y }} className="relative lg:[direction:ltr]">
          <div className="overflow-hidden rounded-[2rem] glass p-2">
            <SmartImage src={image} alt={typeof title === "string" ? title : eyebrow} className="aspect-[4/3] rounded-3xl" />
          </div>
          <div className={cn("absolute -z-10 h-40 w-40 rounded-full blur-3xl", reverse ? "-left-6 -top-6" : "-right-6 -bottom-6", "bg-cyan/25")} />
        </motion.div>
      </div>
    </section>
  );
}
