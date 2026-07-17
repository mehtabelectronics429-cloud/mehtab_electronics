"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Zap, MessageCircle, RotateCcw } from "lucide-react";
import { APPLIANCES, COMPANY } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Approx. average daily run-time (hours) per appliance, used only to estimate kWh. */
const HOURS: Record<string, number> = {
  "LED Bulb / Saver": 5,
  "Ceiling Fan": 10,
  "Pedestal Fan": 8,
  "LED TV": 5,
  Refrigerator: 8,
  "Deep Freezer": 9,
  "AC 1.0 Ton (Inverter)": 6,
  "AC 1.5 Ton (Inverter)": 6,
  "AC 2.0 Ton": 6,
  "Computer / Laptop": 6,
  "Wi-Fi Router": 24,
  Iron: 0.5,
  "Water Pump / Motor": 0.3,
  "Washing Machine": 0.5,
  "Microwave Oven": 0.2,
  "Electric Kettle": 0.2,
};

const SIZES = [1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 50];

export default function LoadCalculator() {
  const [qty, setQty] = useState<number[]>(() => APPLIANCES.map((a) => a.qty));
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const set = (i: number, delta: number) =>
    setQty((prev) => prev.map((v, idx) => (idx === i ? Math.max(0, Math.min(50, v + delta)) : v)));
  const reset = () => setQty(APPLIANCES.map((a) => a.qty));

  const { dailyKwh, peakKw, recommended } = useMemo(() => {
    let continuousW = 0;
    let shortW = 0;
    let kwh = 0;
    APPLIANCES.forEach((a, i) => {
      const n = qty[i];
      if (!n) return;
      const w = a.watts * n;
      if (a.shortUse) shortW += w;
      else continuousW += w;
      kwh += (w * (HOURS[a.name] ?? 4)) / 1000;
    });
    // short-use gear is derated so the system isn't oversized for a 5-minute iron
    const peak = (continuousW + shortW * 0.5) / 1000;
    const target = Math.max(kwh / 4, peak * 1.4);
    const rec = SIZES.find((s) => s >= target) ?? SIZES[SIZES.length - 1];
    return { dailyKwh: kwh, peakKw: peak, recommended: rec };
  }, [qty]);

  const summary = useMemo(() => {
    const picked = APPLIANCES.map((a, i) => ({ a, n: qty[i] }))
      .filter((x) => x.n > 0)
      .map((x) => `• ${x.a.name} ×${x.n}`)
      .join("\n");
    return (
      `Hello ${COMPANY.name}! I used the load calculator.\n\n` +
      (name ? `Name: ${name}\n` : "") +
      (city ? `City: ${city}\n` : "") +
      `\nDaily usage: ${dailyKwh.toFixed(1)} kWh\n` +
      `Peak load: ${peakKw.toFixed(1)} kW\n` +
      `Recommended: ${recommended} kW solar system\n\n` +
      `My appliances:\n${picked || "—"}\n\nPlease send me a quote.`
    );
  }, [qty, name, city, dailyKwh, peakKw, recommended]);

  return (
    <section id="calculator" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ── left: pitch + result + lead form ── */}
        <div>
          <div className="mono-label">Free tool</div>
          <h2 className="mt-4 display-lg text-fg">
            Load calculator
            <br />
            <span className="text-accent">for Pakistani</span> homes.
          </h2>
          <p className="lead mt-6 max-w-md">
            Tell us what you run at home — fans, AC, fridge, lights. We estimate your daily usage and
            recommend the right solar system size. Send the result on WhatsApp and we&apos;ll follow up
            with a quote.
          </p>

          <p className="mt-6 max-w-md rounded-md border border-brand/25 bg-brand/[0.06] p-4 text-xs leading-relaxed text-fg/70">
            <b className="text-brand">Note:</b> Iron, water pump, washing machine and similar appliances
            only run for a few minutes at a time — we count them at reduced load so your system size
            stays realistic, not oversized.
          </p>

          {/* result panel */}
          <div className="mt-8 rounded-lg border border-brand/40 bg-brand/[0.04] p-6 shadow-card">
            <div className="grid grid-cols-2 gap-6">
              <Metric label="Daily usage" value={dailyKwh.toFixed(1)} unit="kWh" />
              <Metric label="Peak load" value={peakKw.toFixed(1)} unit="kW" />
            </div>
            <div className="mt-6 border-t border-line/15 pt-5">
              <div className="mono-label">Recommended system</div>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-5xl leading-none text-brand">{recommended}</span>
                <span className="mb-1 font-display text-lg uppercase text-fg">kW Solar System</span>
              </div>
            </div>
          </div>

          {/* lead inputs */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input !rounded-md"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
              className="input !rounded-md"
            />
          </div>
          <a
            href={waLink(summary)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand mt-4 w-full justify-center !py-4 !text-sm"
          >
            <MessageCircle className="h-4 w-4" /> Send estimate on WhatsApp
          </a>
        </div>

        {/* ── right: appliance picker ── */}
        <div className="rounded-lg border border-line/15 bg-surface/40 p-5 shadow-card md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-brand">
              <Zap className="h-4 w-4" /> Pick your appliances
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-fg/45 transition-colors hover:text-fg"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {APPLIANCES.map((a, i) => (
              <div
                key={a.name}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border p-3 transition-colors",
                  qty[i] > 0 ? "border-brand/45 bg-brand/[0.05]" : "border-line/15 bg-bg/40"
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-fg">{a.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="font-mono text-[0.6rem] uppercase tracking-wider text-fg/45">
                      {a.watts}W
                    </span>
                    {a.shortUse && (
                      <span className="rounded-sm bg-fg/10 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-fg/55">
                        Short use
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Stepper onClick={() => set(i, -1)} disabled={qty[i] === 0}>
                    <Minus className="h-3.5 w-3.5" />
                  </Stepper>
                  <span className="w-5 text-center font-display text-base text-fg">{qty[i]}</span>
                  <Stepper onClick={() => set(i, 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Stepper>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="mono-label !text-fg/45">{label}</div>
      <div className="mt-1 flex items-end gap-1">
        <span className="font-display text-4xl leading-none text-fg">{value}</span>
        <span className="mb-1 font-mono text-xs uppercase text-fg/50">{unit}</span>
      </div>
    </div>
  );
}

function Stepper({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center rounded-md border border-line/15 text-fg/80 transition-colors hover:border-brand/50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
