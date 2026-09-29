"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Layers, Plus, Search } from "lucide-react";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { ProductGroup } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/** Shared query key — the Product Groups page invalidates it on every change. */
export const PRODUCT_GROUPS_KEY = ["pos-product-groups"];

/** Active, non-empty product groups (bundles) for one-click adding. */
export function useProductGroups() {
  const { data, isLoading } = useQuery({
    queryKey: PRODUCT_GROUPS_KEY,
    queryFn: () => api.productGroups({ limit: 100 }),
  });
  const groups = useMemo(
    () => (data?.items ?? []).filter((g) => g.active && g.items.length),
    [data],
  );
  return { groups, isLoading };
}

type Line = { productId: string | null; qty: number };

/**
 * Merge every product in a group into a list of lines. A product already on
 * the list gets its qty bumped instead of a duplicate row; blank rows are
 * dropped so the bundle lands where the cursor is. `cap` limits qty (e.g. live
 * stock at POS) — items with a cap of 0 are skipped and reported back.
 */
export function mergeGroup<L extends Line>(
  lines: L[],
  group: ProductGroup,
  build: (item: ProductGroup["items"][number]) => L,
  opts: { isEmpty?: (l: L) => boolean; cap?: (productId: string) => number } = {},
): { lines: L[]; added: number; skipped: string[] } {
  const next = opts.isEmpty ? lines.filter((l) => !opts.isEmpty!(l)) : [...lines];
  const skipped: string[] = [];
  let added = 0;
  for (const it of group.items) {
    if (!it.productId) continue;
    const cap = opts.cap ? opts.cap(it.productId) : Infinity;
    if (cap <= 0) {
      skipped.push(it.name || "item");
      continue;
    }
    const idx = next.findIndex((l) => l.productId === it.productId);
    if (idx >= 0) {
      next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + it.qty, cap) };
    } else {
      next.push({ ...build(it), qty: Math.min(it.qty, cap) });
    }
    added += 1;
  }
  return { lines: next, added, skipped };
}

/**
 * "Add group" dropdown: search the saved product groups and drop a whole
 * bundle into a line-items editor. Renders nothing when no groups exist.
 */
export default function GroupPicker({
  onPick,
  price = "selling",
  align = "left",
  className,
}: {
  onPick: (group: ProductGroup) => void;
  /** Which price to preview in the list (purchases show cost). */
  price?: "selling" | "purchase";
  /** Which edge the dropdown lines up with. */
  align?: "left" | "right";
  className?: string;
}) {
  const { groups } = useProductGroups();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? groups.filter((g) => g.name.toLowerCase().includes(t)) : groups;
  }, [groups, q]);

  if (!groups.length) return null;

  const totalOf = (g: ProductGroup) =>
    g.items.reduce(
      (s, i) =>
        s + (price === "purchase" ? i.purchasePrice ?? 0 : i.sellingPrice ?? 0) * i.qty,
      0,
    );

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/25 bg-cyan/5 px-2.5 py-1 text-xs font-medium text-cyan transition-colors hover:border-cyan/50 hover:bg-cyan/10"
      >
        <Layers className="h-3.5 w-3.5" /> Add group
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn("absolute z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#12151f] p-1 shadow-xl shadow-black/40", align === "right" ? "right-0" : "left-0")}>
          {groups.length > 6 && (
            <div className="relative mb-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search groups…"
                className="h-8 w-full rounded-lg border border-white/10 bg-transparent pl-8 pr-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan/50"
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            {shown.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-white/40">No groups match</div>
            ) : (
              shown.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  title={g.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  onClick={() => {
                    onPick(g);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5"
                >
                  <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{g.name}</span>
                    <span className="block text-[0.65rem] text-white/40">
                      {g.items.length} item{g.items.length === 1 ? "" : "s"} · {pkr(totalOf(g))}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
