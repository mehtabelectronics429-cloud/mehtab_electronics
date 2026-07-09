"use client";

import { motion } from "framer-motion";
import { Card } from "./primitives";

/** Lightweight animated SVG charts — no chart library, GPU-cheap. */
export function BarChart({ title, data, labels, accent = "#22E0FF", unit = "" }: { title: string; data: number[]; labels?: string[]; accent?: string; unit?: string }) {
  const max = Math.max(...data, 1);
  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-white/80">{title}</h3>
      <div className="mt-5 flex h-40 items-end gap-1.5">
        {data.map((v, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
            <motion.div
              initial={{ height: 0 }} whileInView={{ height: `${(v / max) * 100}%` }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-t-md" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}44)` }}
              title={`${v}${unit}`}
            />
            {labels && <span className="text-[0.6rem] text-white/30">{labels[i]}</span>}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function LineChart({ title, series, labels }: { title: string; series: { data: number[]; color: string; name: string }[]; labels?: string[] }) {
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1), min = Math.min(...all, 0);
  const W = 320, H = 140, pad = 6;
  const x = (i: number, n: number) => pad + (i / (n - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
        <div className="flex gap-3">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5 text-[0.7rem] text-white/50"><i className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.name}</span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-40 w-full">
        {series.map((s) => {
          const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i, s.data.length)} ${y(v)}`).join(" ");
          return (
            <g key={s.name}>
              <motion.path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeInOut" }} />
            </g>
          );
        })}
      </svg>
      {labels && <div className="mt-1 flex justify-between text-[0.6rem] text-white/30">{labels.filter((_, i) => i % 2 === 0).map((l) => <span key={l}>{l}</span>)}</div>}
    </Card>
  );
}
