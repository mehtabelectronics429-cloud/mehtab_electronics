"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, MapPin } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import {
  INSTALLATION_VIDEOS,
  embedUrl,
  videoThumb,
  type InstallationVideoItem,
} from "@/lib/videos";
import { cn } from "@/lib/utils";

export default function InstallVideos() {
  const [videos, setVideos] =
    useState<InstallationVideoItem[]>(INSTALLATION_VIDEOS);
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<InstallationVideoItem | null>(null);

  // Prefer real videos from the admin module; fall back to the dummy set.
  useEffect(() => {
    let alive = true;
    fetch("/api/catalog/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        const items = data?.items as InstallationVideoItem[] | undefined;
        if (items && items.length) setVideos(items);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(videos.map((v) => v.category)))],
    [videos],
  );
  const shown = useMemo(
    () => (filter === "All" ? videos : videos.filter((v) => v.category === filter)),
    [videos, filter],
  );

  // Body-scroll lock + Escape close while the player modal is open.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
      <div className="mb-10 flex flex-wrap gap-2.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-md border px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] transition-colors",
              c === filter
                ? "border-brand bg-brand text-on-brand"
                : "border-line/15 bg-surface/40 text-fg/60 hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className="group relative overflow-hidden rounded-xl border border-line/15 text-left shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="relative aspect-video overflow-hidden">
              <SmartImage
                src={videoThumb(v)}
                alt={v.title}
                className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <span className="absolute left-3 top-3 rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide text-on-brand">
                {v.category}
              </span>
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                </span>
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="font-display uppercase tracking-wide text-white">
                {v.title}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-white/70">
                <MapPin className="h-3 w-3" /> {v.location}
                {v.spec ? <span className="text-white/40">· {v.spec}</span> : null}
              </div>
            </div>
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="py-16 text-center text-fg/50">No videos in this category yet.</p>
      )}

      <VideoModal active={active} onClose={() => setActive(null)} />
    </section>
  );
}

function VideoModal({
  active,
  onClose,
}: {
  active: InstallationVideoItem | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-line/15 bg-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                key={active.id}
                src={embedUrl(active.videoUrl)}
                title={active.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <span className="rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide text-on-brand">
                {active.category}
              </span>
              <h3 className="mt-3 font-display text-2xl uppercase tracking-wide text-fg">
                {active.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-fg/60">
                <MapPin className="h-4 w-4" /> {active.location}
                {active.spec ? <span>· {active.spec}</span> : null}
              </div>
              {active.summary ? (
                <p className="mt-4 max-w-2xl text-fg/70">{active.summary}</p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
