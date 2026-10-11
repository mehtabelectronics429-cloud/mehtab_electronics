"use client";

import type { ReactNode } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { pkr } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/*
 * One look for product lines everywhere (the POS cart is the reference):
 * numbered rows · item · qty · price · line total, then an items-total
 * footer. Tables on ≥sm screens, stacked cards on phones.
 *
 *  - <LineItemsTable>  read-only lists (ledger, customer history, purchases)
 *  - <LineEditor*>     building blocks for editable line grids
 */

/* ── shared helpers ───────────────────────────────────────────────────── */

const unitsOf = (lines: { qty: number }[]) =>
  lines.reduce((s, l) => s + (Number(l.qty) || 0), 0);

const fmtQty = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toLocaleString("en-PK", { maximumFractionDigits: 2 });

export type SummaryRow = {
  label: ReactNode;
  value: number;
  /** "minus" prints the value as a deduction; "strong" highlights the final row. */
  tone?: "minus" | "strong" | "muted" | "good" | "warn";
};

function SummaryRows({
  rows,
  currency,
}: {
  rows: SummaryRow[];
  currency: (n: number) => string;
}) {
  return (
    <>
      {rows.map((r, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between gap-3 px-3 py-2 text-sm",
            r.tone === "strong"
              ? "bg-cyan/5 text-base font-semibold text-white"
              : r.tone === "good"
                ? "text-emerald-600 dark:text-emerald-300"
                : r.tone === "warn"
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-white/60",
          )}
        >
          <span>{r.label}</span>
          <span className={cn("tabular-nums", r.tone === "strong" && "text-cyan")}>
            {r.tone === "minus" ? `− ${currency(Math.abs(r.value))}` : currency(r.value)}
          </span>
        </div>
      ))}
    </>
  );
}

/* ── read-only table ──────────────────────────────────────────────────── */

export type DisplayLine = {
  description: string;
  qty: number;
  unitPrice: number;
  /** Small text under the name (SKU, "not restocked", …). */
  meta?: ReactNode;
};

export function LineItemsTable({
  items,
  currency = pkr,
  priceLabel = "Price",
  totalLabel = "Items total",
  summary,
  hideItemsTotal = false,
  compact = false,
  empty = "No items",
  className,
}: {
  items: DisplayLine[];
  currency?: (n: number) => string;
  priceLabel?: string;
  totalLabel?: string;
  /** Extra rows under the items total (discount, tax, grand total, paid…). */
  summary?: SummaryRow[];
  hideItemsTotal?: boolean;
  /** Tighter rows for nesting inside lists. */
  compact?: boolean;
  empty?: ReactNode;
  className?: string;
}) {
  items = items.filter((l) => (l.description || "").trim());
  const total = items.reduce((s, l) => s + (l.qty || 0) * (l.unitPrice || 0), 0);
  const units = unitsOf(items);
  const pad = compact ? "px-2.5 py-1.5" : "px-3 py-2.5";

  return (
    <div
      className={cn(
        "line-frame overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      {items.length === 0 ? (
        <div className="px-3 py-6 text-center text-white/40">{empty}</div>
      ) : (
        <>
          {/* wide frame: table */}
          <table className="line-table-wide w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-[0.62rem] uppercase tracking-wider text-white/40">
                <th className={cn(pad, "w-8 font-semibold")}>#</th>
                <th className={cn(pad, "font-semibold")}>Item</th>
                <th className={cn(pad, "text-right font-semibold")}>Qty</th>
                <th className={cn(pad, "text-right font-semibold")}>{priceLabel}</th>
                <th className={cn(pad, "text-right font-semibold")}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className={cn(pad, "text-white/40")}>{i + 1}</td>
                  <td className={pad}>
                    <div className="font-medium leading-snug text-white">{it.description}</div>
                    {it.meta && <div className="mt-0.5 text-[0.65rem] text-white/40">{it.meta}</div>}
                  </td>
                  <td className={cn(pad, "whitespace-nowrap text-right tabular-nums text-white/80")}>
                    {fmtQty(it.qty)}
                  </td>
                  <td className={cn(pad, "whitespace-nowrap text-right tabular-nums text-white/80")}>
                    {currency(it.unitPrice)}
                  </td>
                  <td className={cn(pad, "whitespace-nowrap text-right font-semibold tabular-nums text-white")}>
                    {currency(it.qty * it.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* narrow frame: stacked cards */}
          <ul className="line-table-narrow divide-y divide-white/5">
            {items.map((it, i) => (
              <li key={i} className={cn("flex items-start gap-2", pad)}>
                <span className="w-5 shrink-0 text-white/40">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium leading-snug text-white">{it.description}</div>
                  {it.meta && <div className="mt-0.5 text-[0.65rem] text-white/40">{it.meta}</div>}
                  <div className="mt-0.5 text-[0.7rem] tabular-nums text-white/50">
                    {fmtQty(it.qty)} × {currency(it.unitPrice)}
                  </div>
                </div>
                <span className="whitespace-nowrap font-semibold tabular-nums text-white">
                  {currency(it.qty * it.unitPrice)}
                </span>
              </li>
            ))}
          </ul>

          {(!hideItemsTotal || summary?.length) && (
            <div className="border-t border-white/10">
              {!hideItemsTotal && (
                <SummaryRows
                  currency={currency}
                  rows={[
                    {
                      label: `${totalLabel} (${fmtQty(units)} unit${units === 1 ? "" : "s"})`,
                      value: total,
                      tone: summary?.length ? undefined : "strong",
                    },
                  ]}
                />
              )}
              {summary?.length ? <SummaryRows rows={summary} currency={currency} /> : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── editable grid building blocks ────────────────────────────────────── */

/*
 * Editable rows switch layout on the frame's width (CSS container query in
 * globals.css, `.line-*`): narrow → card per line, wide → one grid row.
 */

export function LineEditorFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // No overflow clipping — product search dropdowns must escape the frame.
  return (
    <div className={cn("line-frame rounded-xl border border-white/10 bg-white/[0.02]", className)}>
      {children}
    </div>
  );
}

export function LineEditorHeader({
  priceLabel = "Price",
  qtyLabel = "Qty",
  extra,
}: {
  priceLabel?: string;
  qtyLabel?: string;
  /** Optional extra column after Item (e.g. "Type"). */
  extra?: string;
}) {
  return (
    <div
      className={cn(
        "line-head rounded-t-xl border-b border-white/10 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-wider text-white/40",
        extra && "has-extra",
      )}
    >
      <span>#</span>
      <span>Item</span>
      {extra && <span>{extra}</span>}
      <span className="text-center">{qtyLabel}</span>
      <span className="text-right">{priceLabel}</span>
      <span className="text-right">Total</span>
      <span />
    </div>
  );
}

export function LineEditorRow({
  index,
  item,
  extra,
  qty,
  price,
  total,
  onRemove,
  removeDisabled,
  labels,
}: {
  /** Phone-only cell captions (default Qty / Price / Total). */
  labels?: { qty?: string; price?: string; total?: string };
  index: number;
  item: ReactNode;
  extra?: ReactNode;
  qty: ReactNode;
  price: ReactNode;
  total: ReactNode;
  /** Omit for rows that can't be removed (e.g. return lines). */
  onRemove?: () => void;
  removeDisabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "line-row border-b border-white/5 px-3 py-2.5 last:border-0",
        extra !== undefined && "has-extra",
      )}
    >
      <span className="line-pad text-sm text-white/40">{index + 1}</span>
      <div className="min-w-0">{item}</div>
      {onRemove ? (
        <button
          type="button"
          title="Remove"
          tabIndex={-1}
          onClick={onRemove}
          disabled={removeDisabled}
          className="line-remove grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <span className="line-remove" />
      )}
      <div className="line-cells">
        {extra !== undefined && <div className="line-extra">{extra}</div>}
        <LabeledCell label={labels?.qty ?? "Qty"}>{qty}</LabeledCell>
        <LabeledCell label={labels?.price ?? "Price"}>{price}</LabeledCell>
        <LabeledCell label={labels?.total ?? "Total"} align="right">
          {total}
        </LabeledCell>
      </div>
    </div>
  );
}

function LabeledCell({
  label,
  align,
  children,
}: {
  label: string;
  align?: "right";
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <div className="line-cap mb-0.5 text-[0.6rem] uppercase tracking-wider text-white/35">
        {label}
      </div>
      {children}
    </div>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max,
  inputRef,
  onEnter,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number | null;
  inputRef?: (el: HTMLInputElement | null) => void;
  onEnter?: () => void;
}) {
  const clamp = (n: number) => {
    let q = Math.max(min, Number.isFinite(n) ? n : min);
    if (max != null && q > max) q = max;
    return q;
  };
  return (
    <div className="flex h-9 w-full items-center rounded-lg border border-white/10">
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onChange(clamp((value || 0) - 1))}
        disabled={(value || 0) <= min}
        className="grid h-full w-8 shrink-0 place-items-center text-white/60 hover:text-cyan disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        min={min}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className="h-full w-full min-w-0 border-x border-white/10 bg-transparent text-center text-sm text-white outline-none [appearance:textfield] focus:bg-white/[0.03] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onChange(clamp((value || 0) + 1))}
        disabled={max != null && (value || 0) >= max}
        className="grid h-full w-8 shrink-0 place-items-center text-white/60 hover:text-cyan disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PriceInput({
  value,
  onChange,
  inputRef,
  onEnter,
  placeholder,
}: {
  value: number;
  onChange: (n: number) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
  onEnter?: () => void;
  placeholder?: string;
}) {
  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="decimal"
      min={0}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      className="h-9 w-full min-w-0 rounded-lg border border-white/10 bg-transparent px-2 text-right text-sm text-white outline-none focus:border-cyan/50"
    />
  );
}

export function LineTotal({
  value,
  currency = pkr,
  hint,
}: {
  value: number;
  currency?: (n: number) => string;
  hint?: ReactNode;
}) {
  return (
    <div className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-white">
      {currency(value)}
      {hint && <div className="text-[0.6rem] font-normal">{hint}</div>}
    </div>
  );
}

/** Items-total footer for editors: count of lines/units + overall total (+ optional extra rows). */
export function LineEditorFooter({
  lines,
  currency = pkr,
  label = "Items total",
  summary,
  actions,
}: {
  lines: { qty: number; unitPrice: number; description?: string }[];
  currency?: (n: number) => string;
  label?: string;
  summary?: SummaryRow[];
  /** Left-side controls (Add line, Add group…). */
  actions?: ReactNode;
}) {
  const filled = lines.filter((l) => (l.description ?? "x").trim() && (l.qty || 0) > 0);
  const total = filled.reduce((s, l) => s + (l.qty || 0) * (l.unitPrice || 0), 0);
  const units = unitsOf(filled);
  return (
    <div className="rounded-b-xl border-t border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
        <div className="ml-auto flex items-baseline gap-3">
          <span className="text-xs text-white/50">
            {label} · {filled.length} line{filled.length === 1 ? "" : "s"} · {fmtQty(units)} unit
            {units === 1 ? "" : "s"}
          </span>
          <span className="text-base font-semibold tabular-nums text-cyan">{currency(total)}</span>
        </div>
      </div>
      {summary?.length ? (
        <div className="border-t border-white/10">
          <SummaryRows rows={summary} currency={currency} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Summary rows for an invoice-style total (only the non-zero adjustments are
 * shown, then the grand total highlighted). Pass `invoiceTotals(...)` output.
 */
export function totalsSummary(
  t: { discount?: number; tax?: number; taxRate?: number; shipping?: number; total: number },
  opts?: { totalLabel?: string; extra?: SummaryRow[] },
): SummaryRow[] {
  const rows: SummaryRow[] = [];
  if (t.discount) rows.push({ label: "Discount", value: t.discount, tone: "minus" });
  if (t.tax) rows.push({ label: `Tax${t.taxRate ? ` (${t.taxRate}%)` : ""}`, value: t.tax });
  if (t.shipping) rows.push({ label: "Shipping / handling", value: t.shipping });
  rows.push({ label: opts?.totalLabel ?? "Total", value: t.total, tone: "strong" });
  return [...rows, ...(opts?.extra ?? [])];
}
