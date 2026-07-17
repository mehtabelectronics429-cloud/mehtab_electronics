"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { PROJECTS } from "@/lib/data";

export default function Projects() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono-label">Recent work</div>
            <h2 className="mt-4 display-lg text-fg">
              Projects across
              <br />
              <span className="text-accent">Punjab.</span>
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden shrink-0 items-center gap-1.5 border-b border-brand/60 pb-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:border-brand sm:inline-flex"
          >
            See all projects <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-lg border border-line/15 shadow-card transition-shadow duration-300 hover:shadow-card-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-brand">
                  {p.location}
                </div>
                <div className="mt-1.5 font-display text-xl uppercase tracking-wide text-white">
                  {p.title}
                </div>
              </div>
              <span className="absolute right-4 top-4 rounded-sm bg-black/50 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                {p.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
