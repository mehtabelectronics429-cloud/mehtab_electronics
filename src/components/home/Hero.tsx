"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, MapPin } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { COMPANY } from "@/lib/data";
import { HERO_IMAGE } from "@/lib/assets";

const HERO_IMG = HERO_IMAGE;

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* full-bleed photographic backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <SmartImage src={HERO_IMG} alt="" className="h-full w-full" imgClassName="object-cover" priority />
        {/* dark scrim — heavy on the left where the text sits, lighter on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-16 md:px-8">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mono-label inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/5 px-4 py-2"
        >
          <MapPin className="h-3.5 w-3.5" />
          {COMPANY.region}
        </motion.span>

        <h1 className="mt-7 display-xl max-w-4xl text-fg">
          {["Power your home.", "Protect what", "matters."].map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                {line === "Protect what" ? (
                  <>
                    <span className="text-accent">Protect</span> what
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="lead mt-7 max-w-xl"
        >
          Solar system installation, CCTV networks and wholesale supply — trusted by homeowners,
          farmers and businesses across Punjab since day one.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link href="/contact" className="btn-brand">
            Get Free Quote <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#calculator" className="btn-outline">
            <Calculator className="h-4 w-4" /> Calculate My System
          </a>
        </motion.div>
      </div>
    </section>
  );
}
