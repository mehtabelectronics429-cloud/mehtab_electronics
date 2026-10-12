"use client";

import { useMemo, useState } from "react";
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
import type { Purchase } from "@/lib/admin/types";

/** "Edit" button + full-page form for changing an existing purchase. */
export function EditPurchaseButton({ purchase }: { purchase: Purchase }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> Edit
      </Button>
      {open && (
        <EditPurchaseModal purchase={purchase} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function EditPurchaseModal({
  purchase,
  onClose,
}: {
  purchase: Purchase;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState(purchase.supplierId || "");
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState(
    purchase.supplierInvoiceNo || "",
  );
  const [date, setDate] = useState(String(purchase.date || "").slice(0, 10));
  const [discount, setDiscount] = useState(String(purchase.discount ?? 0));
  const [taxRate, setTaxRate] = useState(String(purchase.taxRate ?? 0));
  const [shipping, setShipping] = useState(String(purchase.shipping ?? 0));
  const [notes, setNotes] = useState(purchase.notes || "");
  const [lines, setLines] = useState<ProductLine[]>(() =>
    purchase.items && purchase.items.length
      ? purchase.items.map((i) => ({
          productId: i.productId || null,
          description: i.name,
          qty: i.qty,
          unitPrice: i.unitCost,
        }))
      : [emptyLine()],
  );

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-opts"],
    queryFn: () => api.suppliers({ limit: 200 }),
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts"],
    queryFn: () => api.products({ limit: 300 }),
  });
  const productOptions = useMemo(
    () => (products?.items ?? []).map(productOption),
    [products],
  );
  const supplierOptions = useMemo(() => {
    const opts = (suppliers?.items ?? []).map((s) => ({
      value: s.id,
      label: s.name,
      searchText: `${s.name} ${s.company || ""} ${s.phone || ""}`,
    }));
    if (purchase.supplierId && !opts.some((o) => o.value === purchase.supplierId)) {
      opts.unshift({
        value: purchase.supplierId,
        label: purchase.supplier || "Current supplier",
        searchText: purchase.supplier || "",
      });
    }
    return opts;
  }, [suppliers, purchase.supplierId, purchase.supplier]);

  const validLines = lines.filter((l) => l.description.trim() && l.qty > 0);
  const totals = invoiceTotals({
    items: validLines,
    discount: Number(discount) || 0,
    taxRate: Number(taxRate) || 0,
    shipping: Number(shipping) || 0,
  });
  const belowPaid = totals.total + 0.005 < purchase.paid;

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.editPurchase(purchase.id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase", purchase.id] });
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Purchase updated");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error("Select a supplier");
    if (!validLines.length) return toast.error("Add at least one line item");
    if (belowPaid) return toast.error("Total can't be less than what was already paid");
    save.mutate({
      supplierId,
      supplierInvoiceNo,
      date,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      shipping: Number(shipping) || 0,
      notes,
      items: validLines.map((l) => ({
        productId: l.productId || null,
        name: l.description.trim(),
        qty: l.qty,
        unitCost: l.unitPrice,
      })),
    });
  };

  return (
    <Modal open onClose={onClose} title={`Edit purchase ${purchase.ref}`} wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Supplier</Label>
          <SearchableSelect
            value={supplierId}
            onChange={setSupplierId}
            placeholder="Select supplier…"
            options={supplierOptions}
          />
        </div>
        <div>
          <Label>Supplier invoice #</Label>
          <Input
            value={supplierInvoiceNo}
            onChange={(e) => setSupplierInvoiceNo(e.target.value)}
            placeholder="Their bill number"
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Products / line items (unit cost)</Label>
          <ProductLineItems
            value={lines}
            onChange={setLines}
            productOptions={productOptions}
            priceField="purchasePrice"
          />
        </div>
        <div>
          <Label>Discount (Rs)</Label>
          <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div>
          <Label>Tax (%)</Label>
          <Input type="number" min={0} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
        <div>
          <Label>Shipping / freight (Rs)</Label>
          <Input type="number" min={0} value={shipping} onChange={(e) => setShipping(e.target.value)} />
        </div>
        <div>
          <Label>Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </div>
        <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>{pkr(totals.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between font-semibold text-white">
            <span>New total</span>
            <span>{pkr(totals.total)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Was</span>
            <span>{pkr(purchase.amount)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Paid</span>
            <span>{pkr(purchase.paid)}</span>
          </div>
          {belowPaid && (
            <p className="mt-2 text-xs text-rose-300">
              Total can&apos;t go below the {pkr(purchase.paid)} already paid.
            </p>
          )}
          <p className="mt-2 text-[0.65rem] text-white/40">
            Stock is adjusted by the change in quantities received.
          </p>
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
