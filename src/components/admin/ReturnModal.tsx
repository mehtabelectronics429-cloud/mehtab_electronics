"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/admin/ui/Modal";
import { Button, Label, Textarea } from "@/components/admin/ui/primitives";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { returnRefund } from "@/lib/invoice";
import type { Invoice } from "@/lib/admin/types";

const REASONS = [
  "Defective / faulty",
  "Wrong item",
  "Not as described",
  "Changed mind",
  "Damaged in transit",
  "Other",
];

/**
 * Process a customer return against a sale invoice. Enforces "can't return more
 * than sold" (net of prior returns) in the UI and previews the cash refund
 * (discount + tax prorated, shipping never refunded) before submitting.
 */
export default function ReturnModal({
  invoice,
  open,
  onClose,
}: {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const items = invoice.items ?? [];

  // Units already returned per original line index.
  const returnedByIndex = useMemo(() => {
    const m = new Map<number, number>();
    for (const ret of invoice.returns ?? []) {
      for (const it of ret.items ?? []) {
        m.set(it.index, (m.get(it.index) ?? 0) + it.qty);
      }
    }
    return m;
  }, [invoice.returns]);

  const remainingOf = (idx: number) =>
    (items[idx]?.qty ?? 0) - (returnedByIndex.get(idx) ?? 0);

  // Per-line return state: qty to return + whether it's resalable (restock).
  const [lines, setLines] = useState<Record<number, { qty: number; restock: boolean }>>(
    {},
  );
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");

  const setQty = (idx: number, qty: number) => {
    const max = remainingOf(idx);
    const clamped = Math.max(0, Math.min(qty, max));
    setLines((l) => ({
      ...l,
      [idx]: { qty: clamped, restock: l[idx]?.restock ?? true },
    }));
  };
  const setRestock = (idx: number, restock: boolean) =>
    setLines((l) => ({ ...l, [idx]: { qty: l[idx]?.qty ?? 0, restock } }));

  const selected = useMemo(
    () =>
      Object.entries(lines)
        .map(([idx, v]) => ({
          index: Number(idx),
          qty: v.qty,
          restock: v.restock,
          unitPrice: items[Number(idx)]?.unitPrice ?? 0,
        }))
        .filter((l) => l.qty > 0),
    [lines, items],
  );

  const { refund } = returnRefund(invoice, selected);

  const submit = useMutation({
    mutationFn: () =>
      api.returnSale(invoice.id, {
        reason: reason === "Other" ? note.trim() || "Other" : reason,
        note,
        items: selected.map((l) => ({
          index: l.index,
          qty: l.qty,
          restock: l.restock,
        })),
      }),
    onSuccess: (res) => {
      // Refresh every view the refund touches. Query-key roots differ
      // (e.g. "products" won't match "pos-products" / "inventory"), so each
      // stock and financial root is invalidated explicitly to force a refetch.
      const roots = [
        // stock — restocked resalable units
        "products",
        "products-opts",
        "products-opts-quote",
        "pos-products",
        "pos-products-search",
        "inventory",
        // financials — revenue / COGS / cash / balances reverse
        "invoice",
        "invoices",
        "analytics",
        "dashboard",
        "ledger",
        "customer-ledger",
      ];
      for (const root of roots) qc.invalidateQueries({ queryKey: [root] });
      toast.success(`Return ${res.returnNumber} · refunded ${pkr(res.refund)}`);
      setLines({});
      setNote("");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const anySelected = selected.length > 0;
  const nothingReturnable = items.every((_, i) => remainingOf(i) <= 0);

  return (
    <Modal open={open} onClose={onClose} title="Process return / refund" wide>
      {nothingReturnable ? (
        <p className="text-sm text-neutral-500 dark:text-white/60">
          Every line on this invoice has already been fully returned.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-white/10">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:border-white/10">
              <span>Item</span>
              <span className="text-right">Return qty</span>
              <span className="text-right">Resalable</span>
            </div>
            {items.map((it, idx) => {
              const remaining = remainingOf(idx);
              const state = lines[idx];
              const canRestock = !!it.productId;
              return (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900 dark:text-white">
                      {it.description}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-white/50">
                      {pkr(it.unitPrice)} · sold {it.qty} ·{" "}
                      {remaining > 0 ? `${remaining} returnable` : "fully returned"}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    disabled={remaining <= 0}
                    value={state?.qty ?? 0}
                    onChange={(e) => setQty(idx, Number(e.target.value) || 0)}
                    className="h-8 w-16 rounded-lg border border-slate-300 bg-transparent px-2 text-right text-sm text-slate-900 disabled:opacity-40 dark:border-white/10 dark:text-white"
                  />
                  <div className="flex w-14 justify-end">
                    {canRestock ? (
                      <input
                        type="checkbox"
                        checked={state?.restock ?? true}
                        disabled={!state?.qty}
                        onChange={(e) => setRestock(idx, e.target.checked)}
                        className="h-4 w-4 accent-emerald-500 disabled:opacity-40"
                        title="Add resalable units back to stock"
                      />
                    ) : (
                      <span
                        className="text-[10px] text-neutral-400"
                        title="Custom line — not linked to a product, cannot restock"
                      >
                        n/a
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <Label>Reason for return</Label>
            <div className="flex flex-wrap gap-1.5">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    reason === r
                      ? "border-cyan/50 bg-cyan/10 text-cyan"
                      : "border-slate-300 text-neutral-600 hover:border-cyan/40 dark:border-white/10 dark:text-white/60"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Note {reason === "Other" ? "(required)" : "(optional)"}</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Condition, serial number, remarks…"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 dark:bg-white/5">
            <span className="text-sm text-neutral-600 dark:text-white/70">
              Cash refund to customer
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              {pkr(refund)}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => submit.mutate()}
              disabled={
                !anySelected ||
                submit.isPending ||
                (reason === "Other" && !note.trim())
              }
            >
              <Undo2 className="h-4 w-4" />
              {submit.isPending
                ? "Processing…"
                : `Refund ${pkr(refund)}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Trigger button + modal, ready to drop into the invoice detail page. */
export function ReturnButton({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <RotateCcw className="h-4 w-4" /> Return
      </Button>
      <ReturnModal invoice={invoice} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
