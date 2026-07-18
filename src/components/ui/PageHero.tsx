"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import MagneticButton from "./MagneticButton";
import SmartImage from "./SmartImage";

type Props = {
  crumb: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  image: string;
  accentColor?: string;
  chips?: string[];
};

const anim = (d: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] as const },
});

export default function PageHero({
  crumb,
  eyebrow,
  title,
  subtitle,
  image,
  accentColor = "#FFC21A",
  chips,
}: Props) {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-6 pb-16 pt-36 md:px-8">
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.2] mix-blend-multiply dark:opacity-[0.3] dark:mix-blend-luminosity"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/55 to-bg/35 dark:from-bg/85 dark:via-bg/60 dark:to-bg/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_0%,rgb(var(--brand)/0.08)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.nav
            {...anim(0.05)}
            className="mb-6 flex items-center gap-1.5 text-xs text-fg/45"
          >
            <Link href="/" className="hover:text-fg">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-fg/70">{crumb}</span>
          </motion.nav>

          <motion.span {...anim(0.1)} className="eyebrow">
            {eyebrow}
          </motion.span>
          <motion.h1 {...anim(0.18)} className="display-lg mt-5 text-fg">
            {title}
          </motion.h1>
          <motion.p {...anim(0.28)} className="lead mt-6 max-w-lg">
            {subtitle}
          </motion.p>

          {chips && (
            <motion.div {...anim(0.36)} className="mt-8 flex flex-wrap gap-2.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full glass hairline px-4 py-2 text-xs text-fg/70"
                >
                  {c}
                </span>
              ))}
            </motion.div>
          )}

          <motion.div {...anim(0.44)} className="mt-10 flex flex-wrap gap-4">
            <MagneticButton href="/contact" className="text-gray-800">
              Book a survey <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="/products" variant="ghost">
              Browse products
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[2rem] glass p-2">
            <SmartImage
              src={image}
              alt={crumb}
              className="aspect-[4/5] rounded-3xl md:aspect-[4/4.4]"
              priority
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl glass hairline px-5 py-4 md:block">
            <div className="font-mono text-[0.65rem] uppercase tracking-widest text-fg/45">
              Certified installs
            </div>
            <div className="mt-1 font-display text-lg text-fg">Since 1996</div>
          </div>
          <div
            className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-3xl"
            style={{ background: `${accentColor}44` }}
          />
        </motion.div>
      </div>
    </section>
  );
}
