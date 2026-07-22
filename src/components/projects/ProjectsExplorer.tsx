"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check, MessageCircle, Maximize2 } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import Slideshow from "@/components/ui/Slideshow";
import { PROJECTS_DATA, type Project } from "@/lib/projects";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Solar", "Inverter", "Battery", "CCTV"] as const;

export default function ProjectsExplorer() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const shown = useMemo(
    () =>
      filter === "All"
        ? PROJECTS_DATA
        : PROJECTS_DATA.filter((p) => p.category === filter),
    [filter],
  );

  // lock background scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
      {/* filters */}
      <div className="mb-10 flex flex-wrap gap-2.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] transition-colors",
              f === filter
                ? "border-brand bg-brand text-on-brand"
                : "border-line/15 bg-surface/40 text-fg/60 hover:text-fg",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* bento gallery of project covers */}
      <motion.div
        layout
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 [grid-auto-rows:9rem] sm:[grid-auto-rows:10rem] lg:[grid-auto-rows:12rem]"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.button
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              onClick={() => setActive(p)}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-line/15 text-left shadow-card",
                i === 0 && "col-span-2 row-span-2",
              )}
            >
              <SmartImage
                src={p.images[0]}
                alt={p.title}
                className="absolute inset-0 h-full w-full"
                imgClassName="transition-transform duration-700 group-hover:scale-105"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-85 transition-opacity group-hover:opacity-100" />
              <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 p-3",
                  i === 0 && "p-5",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-on-brand">
                    {p.category}
                  </span>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-white/70">
                    {p.images.length} photos
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-1.5 font-display uppercase tracking-wide text-white",
                    i === 0 ? "text-lg md:text-2xl" : "text-xs md:text-sm",
                  )}
                >
                  {p.title}
                </div>
                {i === 0 && (
                  <div className="mt-1 text-xs text-white/70">{p.location}</div>
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* detail modal  portaled to <body> so `fixed` escapes the transformed page wrapper */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {active && (
              <ProjectModal project={active} onClose={() => setActive(null)} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slides = project.images.map((src) => ({
    src,
    sub: project.category,
    caption: project.title,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm md:p-8"
      data-lenis-prevent
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-4xl overflow-hidden rounded-lg border border-line/15 bg-surface shadow-card-lg"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-md bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          {/* gallery */}
          <div className="p-4 md:p-5">
            <Slideshow slides={slides} aspect="aspect-[4/3]" interval={5000} />
          </div>

          {/* details */}
          <div className="flex flex-col p-6 md:p-7">
            <div className="flex items-center gap-2">
              <span className="rounded-sm bg-brand px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-on-brand">
                {project.category}
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fg/45">
                {project.year}
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl uppercase leading-none tracking-wide text-fg md:text-3xl">
              {project.title}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-fg/55">
              <MapPin className="h-3.5 w-3.5 text-brand" /> {project.location}
            </div>
            <div className="mt-3 inline-flex w-fit rounded-md border border-brand/30 bg-brand/[0.06] px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-brand">
              {project.spec}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-fg/70">
              {project.summary}
            </p>

            <ul className="mt-5 space-y-2.5">
              {project.details.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-2.5 text-sm text-fg/75"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    strokeWidth={2.5}
                  />
                  {d}
                </li>
              ))}
            </ul>

            <a
              href={waLink(
                `Hello Mehtab Electronics! I saw the "${project.title}" project (${project.location}) and I'd like something similar.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand mt-7"
            >
              <MessageCircle className="h-4 w-4" /> Get a similar system
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
