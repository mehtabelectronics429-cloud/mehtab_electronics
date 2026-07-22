"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  ExternalLink,
  Wallet,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Button, Card, Input, Label } from "@/components/admin/ui/primitives";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmt, setPayAmt] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: purchase, isLoading } = useQuery({
    queryKey: ["purchase", id],
    queryFn: () => api.getPurchase(id),
  });

  const pay = useMutation({
    mutationFn: (amount: number) => api.payPurchase(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase", id] });
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setPayOpen(false);
      setPayAmt("");
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setInvoice = useMutation({
    mutationFn: (invoiceUrl: string) =>
      api.updatePurchaseInvoice(id, invoiceUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase", id] });
      qc.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Invoice uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadFile(
        file,
        "mehtab_electronics/purchase-invoices",
      );
      await setInvoice.mutateAsync(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (isLoading || !purchase) {
    return (
      <div>
        <PageHeader title="Purchase" subtitle="Loading…" />
      </div>
    );
  }

  const balance = purchase.amount - purchase.paid;
  const items = purchase.items ?? [];
  const invoiceUrl = purchase.invoiceUrl || "";
  const isPdf =
    invoiceUrl.toLowerCase().includes(".pdf") ||
    invoiceUrl.toLowerCase().includes("/raw/");

  return (
    <div>
      <PageHeader
        title={purchase.ref}
        subtitle={`${purchase.supplier || "Supplier"} · ${purchase.date}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push("/admin/purchases")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {balance > 0 && (
              <Button
                onClick={() => {
                  setPayAmt(String(balance));
                  setPayOpen(true);
                }}
              >
                <Wallet className="h-4 w-4" /> Pay balance
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={purchase.status} />
            {purchase.supplierInvoiceNo ? (
              <span className="text-xs text-white/40">
                Their inv# {purchase.supplierInvoiceNo}
              </span>
            ) : null}
          </div>

          <h3 className="mb-3 text-sm font-medium text-white/80">Line items</h3>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[0.7rem] uppercase tracking-wider text-white/40">
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Unit cost</th>
                  <th className="px-3 py-2 text-right">Line</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-3 py-2.5 text-white">{it.name}</td>
                    <td className="px-3 py-2.5 text-right text-white/70">
                      {it.qty}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/70">
                      {pkr(it.unitCost)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white">
                      {pkr(it.qty * it.unitCost)}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-white/40"
                    >
                      No line items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            {(purchase.discount ?? 0) > 0 && (
              <div className="flex justify-between text-white/60">
                <span>Discount</span>
                <span>-{pkr(purchase.discount!)}</span>
              </div>
            )}
            {(purchase.shipping ?? 0) > 0 && (
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span>{pkr(purchase.shipping!)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-white">
              <span>Total</span>
              <span>{pkr(purchase.amount)}</span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>Paid</span>
              <span>{pkr(purchase.paid)}</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Balance</span>
              <span>{pkr(balance)}</span>
            </div>
          </div>

          {purchase.notes ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/60">
              {purchase.notes}
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
            <FileText className="h-4 w-4" /> Supplier invoice
          </h3>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />

          {invoiceUrl ? (
            <div className="space-y-3">
              {isPdf ? (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-cyan hover:bg-white/5"
                >
                  <ExternalLink className="h-4 w-4" /> Open PDF invoice
                </a>
              ) : (
                <a href={invoiceUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoiceUrl}
                    alt="Supplier invoice"
                    className="max-h-72 w-full rounded-xl border border-white/10 object-contain"
                  />
                </a>
              )}
              <Button
                variant="secondary"
                className="w-full"
                disabled={uploading || setInvoice.isPending}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Replace invoice"}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading || setInvoice.isPending}
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-sm text-white/50 transition hover:border-cyan/40 hover:text-white/70"
            >
              <Upload className="h-6 w-6" />
              {uploading ? "Uploading…" : "Upload supplier invoice"}
              <span className="text-xs text-white/30">PDF or image</span>
            </button>
          )}
        </Card>
      </div>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={`Pay supplier · ${purchase.ref}`}
      >
        <div className="space-y-4">
          <div className="text-sm text-white/60">
            Balance owed:{" "}
            <span className="text-amber-300">{pkr(balance)}</span>
          </div>
          <div>
            <Label>Payment amount</Label>
            <Input
              type="number"
              value={payAmt}
              onChange={(e) => setPayAmt(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={pay.isPending}
              onClick={() => pay.mutate(Number(payAmt) || 0)}
            >
              Record payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
