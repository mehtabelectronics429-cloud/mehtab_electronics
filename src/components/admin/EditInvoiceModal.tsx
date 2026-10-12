"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/admin/ui/Modal";
import { Button, Input, Label } from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import ProductLineItems, {
  type ProductLine,
  emptyLine,
} from "@/components/admin/ui/ProductLineItems";
import { productOption } from "@/lib/admin/product-search";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import type { Invoice } from "@/lib/admin/types";

type Draft = {
  customerId: string;
  date: string;
  discount: string;
  taxRate: string;
  shipping: string;
  cost: string;
  notes: string;
};

const draftFrom = (inv: Invoice): Draft => ({
  customerId: inv.customerId || "",
  date: String(inv.date || "").slice(0, 10),
  discount: String(inv.discount ?? 0),
  taxRate: String(inv.taxRate ?? 0),
  shipping: String(inv.shipping ?? 0),
  cost: String(inv.cost ?? 0),
  notes: inv.notes || "",
});

const linesFrom = (inv: Invoice): ProductLine[] =>
  inv.items && inv.items.length
    ? inv.items.map((i) => ({
        productId: i.productId || null,
        description: i.description,
        qty: i.qty,
        unitPrice: i.unitPrice,
      }))
    : [emptyLine()];

/** "Edit" button + full-page form for changing an existing invoice. */
export function EditInvoiceButton({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> Edit
      </Button>
      {open && (
        <EditInvoiceModal invoice={invoice} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function EditInvoiceModal({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(invoice));
  const [lines, setLines] = useState<ProductLine[]>(() => linesFrom(invoice));
  const [costTouched, setCostTouched] = useState(false);
  const locked = (invoice.returns ?? []).length > 0;

  useEffect(() => {
    setDraft(draftFrom(invoice));
    setLines(linesFrom(invoice));
    setCostTouched(false);
  }, [invoice]);

  const { data: customers } = useQuery({
    queryKey: ["customers-opts"],
    queryFn: () => api.customers({ limit: 100 }),
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts-billing"],
    queryFn: () => api.products({ limit: 300 }),
  });
  const productOptions = useMemo(
    () => (products?.items ?? []).map(productOption),
    [products],
  );
  const customerOptions = useMemo(() => {
    const opts = (customers?.items ?? []).map((c) => ({
      value: c.id,
      label: c.name,
      searchText: `${c.name} ${c.phone || ""}`,
    }));
    // Keep the current customer selectable even if outside the first page.
    if (invoice.customerId && !opts.some((o) => o.value === invoice.customerId)) {
      opts.unshift({
        value: invoice.customerId,
        label: invoice.customer,
        searchText: invoice.customer,
      });
    }
    return opts;
  }, [customers, invoice.customerId, invoice.customer]);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  const validLines = lines.filter((l) => l.description.trim() && l.qty > 0);
  const totals = invoiceTotals({
    items: validLines,
    discount: Number(draft.discount) || 0,
    taxRate: Number(draft.taxRate) || 0,
    shipping: Number(draft.shipping) || 0,
  });
  const settled = (invoice.paid ?? 0) + (invoice.returnedAmount ?? 0);
  const belowPaid = totals.total + 0.005 < settled;

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.editInvoice(invoice.id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice", invoice.id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Invoice updated");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.customerId) return toast.error("Select a customer");
    if (!locked && !validLines.length) return toast.error("Add at least one line item");
    if (belowPaid) return toast.error("Total can't be less than what was already paid");
    const body: Record<string, unknown> = {
      date: draft.date,
      discount: Number(draft.discount) || 0,
      taxRate: Number(draft.taxRate) || 0,
      shipping: Number(draft.shipping) || 0,
      notes: draft.notes,
    };
    if (!locked) {
      body.customerId = draft.customerId;
      body.items = validLines.map((l) => ({
        description: l.description.trim(),
        qty: l.qty,
        unitPrice: l.unitPrice,
        productId: l.productId || null,
      }));
    }
    // Leave cost to the server (adjusted from product prices) unless typed.
    if (costTouched) body.cost = Number(draft.cost) || 0;
    save.mutate(body);
  };

  return (
    <Modal open onClose={onClose} title={`Edit invoice ${invoice.number}`} wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {locked && (
          <div className="sm:col-span-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            This invoice has returns recorded, so its customer and line items
            are locked. You can still change the date, charges and notes.
          </div>
        )}
        <div>
          <Label>Customer</Label>
          <SearchableSelect
            value={draft.customerId}
            onChange={(v) => setDraft((d) => ({ ...d, customerId: v }))}
            placeholder="Select customer…"
            options={customerOptions}
            disabled={locked}
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={draft.date} onChange={set("date")} />
        </div>
        <div className="sm:col-span-2">
          <Label>Products / line items</Label>
          {locked ? (
            <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/70">
              {lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <span>
                    {l.qty} × {l.description}
                  </span>
                  <span>{pkr(l.qty * l.unitPrice)}</span>
                </div>
              ))}
            </div>
          ) : (
            <ProductLineItems
              value={lines}
              onChange={setLines}
              productOptions={productOptions}
            />
          )}
        </div>
        <div>
          <Label>Discount (Rs)</Label>
          <Input type="number" min={0} value={draft.discount} onChange={set("discount")} />
        </div>
        <div>
          <Label>Tax (%)</Label>
          <Input type="number" min={0} value={draft.taxRate} onChange={set("taxRate")} />
        </div>
        <div>
          <Label>Shipping / handling (Rs)</Label>
          <Input type="number" min={0} value={draft.shipping} onChange={set("shipping")} />
        </div>
        <div>
          <Label>Cost (goods + materials)</Label>
          <Input
            type="number"
            min={0}
            value={draft.cost}
            onChange={(e) => {
              setCostTouched(true);
              set("cost")(e);
            }}
          />
          {!costTouched && (
            <p className="mt-1 text-[0.65rem] text-white/40">
              Adjusted automatically from product purchase prices when items change.
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Input value={draft.notes} onChange={set("notes")} placeholder="Optional" />
        </div>
        <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>{pkr(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-white/60">
              <span>Discount</span>
              <span>−{pkr(totals.discount)}</span>
            </div>
          )}
          {totals.tax > 0 && (
            <div className="flex justify-between text-white/60">
              <span>Tax ({totals.taxRate}%)</span>
              <span>{pkr(totals.tax)}</span>
            </div>
          )}
          {totals.shipping > 0 && (
            <div className="flex justify-between text-white/60">
              <span>Shipping</span>
              <span>{pkr(totals.shipping)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between font-semibold text-white">
            <span>New total</span>
            <span>{pkr(totals.total)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Was</span>
            <span>{pkr(invoice.amount)}</span>
          </div>
          {belowPaid && (
            <p className="mt-2 text-xs text-rose-300">
              Total can&apos;t go below the {pkr(settled)} already paid / refunded.
            </p>
          )}
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending || belowPaid}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
