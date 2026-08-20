"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Printer, MessageCircle, ArrowLeft, Wallet, Check } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Button, Card, Input, Label } from "@/components/admin/ui/primitives";
import InvoiceDocument from "@/components/admin/InvoiceDocument";
import ShareInvoiceButton from "@/components/admin/ShareInvoiceButton";
import { ReturnButton } from "@/components/admin/ReturnModal";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import { openWhatsAppUrl } from "@/lib/admin/whatsapp-client";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [payment, setPayment] = useState("");

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api.getInvoice(id),
  });

  const patch = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.updateInvoice(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !invoice) {
    return (
      <div>
        <PageHeader title="Invoice" subtitle="Loading…" />
      </div>
    );
  }

  const totals = invoiceTotals(invoice);
  const paid = invoice.paid ?? 0;
  const returned = invoice.returnedAmount ?? 0;
  const netTotal = totals.total - returned;
  const balance = Math.max(0, netTotal - paid);
  const canReturn =
    !!user &&
    can(user.role, "billing.approve") &&
    (invoice.status === "approved" || invoice.status === "pending");

  const recordPayment = () => {
    const amt = Number(payment);
    if (!amt || amt <= 0) return toast.error("Enter a payment amount");
    const newPaid = Math.min(totals.total, paid + amt);
    const fullyPaid = newPaid >= totals.total;
    patch.mutate(
      { paid: newPaid, ...(fullyPaid ? { status: "approved" } : {}) },
      {
        onSuccess: () => {
          setPayment("");
          toast.success(fullyPaid ? "Marked fully paid" : "Payment recorded");
        },
      },
    );
  };

  const sendWhatsApp = () => {
    const phone = (
      invoice.customerWhatsapp ||
      invoice.customerPhone ||
      ""
    ).replace(/\D/g, "");
    if (!phone) return toast.error("No customer WhatsApp number on file");
    const intl = phone.startsWith("92") ? phone : phone.replace(/^0/, "92");
    const link = `${window.location.origin}/invoice/${id}`;
    const msg =
      `Assalam o Alaikum ${invoice.customer || ""},\n\n` +
      `Your invoice ${invoice.number} from Mehtab Electronics.\n` +
      `Total: Rs ${netTotal.toLocaleString("en-PK")}\n` +
      (returned > 0 ? `Refunded: Rs ${returned.toLocaleString("en-PK")}\n` : "") +
      (paid > 0 ? `Paid: Rs ${paid.toLocaleString("en-PK")}\n` : "") +
      `Balance Due: Rs ${balance.toLocaleString("en-PK")}\n\n` +
      `View / download your invoice (PDF): ${link}\n\nJazakAllah  Mehtab Electronics`;
    openWhatsAppUrl(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`);
    toast.success("Opening WhatsApp with the invoice link…");
  };

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.number}`}
        subtitle={
          <span className="inline-flex items-center gap-2">
            {invoice.customer} <StatusBadge status={invoice.status} />
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/billing")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <Button variant="secondary" onClick={sendWhatsApp}>
              <MessageCircle className="h-4 w-4" /> WhatsApp link
            </Button>
            {canReturn && <ReturnButton invoice={invoice} />}
            <ShareInvoiceButton
              filename={`Invoice-${invoice.number}.pdf`}
              shareText={`Invoice ${invoice.number}  Mehtab Electronics. Total Rs ${totals.total.toLocaleString("en-PK")}, Balance Due Rs ${balance.toLocaleString("en-PK")}.`}
            />
          </div>
        }
      />

      {/* payment controls */}
      <div
        className={`mb-5 grid gap-4 ${returned > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Total
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            {pkr(totals.total)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Paid
          </div>
          <div className="mt-1 text-lg font-semibold text-emerald-300">
            {pkr(paid)}
          </div>
        </Card>
        {returned > 0 && (
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wider text-white/40">
              Refunded
            </div>
            <div className="mt-1 text-lg font-semibold text-rose-300">
              −{pkr(returned)}
            </div>
          </Card>
        )}
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Balance due
          </div>
          <div className="mt-1 text-lg font-semibold text-amber-300">
            {pkr(balance)}
          </div>
        </Card>
      </div>

      {/* returns history */}
      {invoice.returns && invoice.returns.length > 0 && (
        <Card className="mb-5 p-4">
          <div className="mb-3 text-sm font-medium text-white/80">
            Returns &amp; refunds
          </div>
          <div className="space-y-2">
            {invoice.returns.map((r) => (
              <div
                key={r.number}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-white">
                    {r.number}
                    <span className="ml-2 text-xs font-normal text-white/40">
                      {String(r.date).slice(0, 10)} · {r.reason}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-rose-300">
                    −{pkr(r.refund)}
                  </div>
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {r.items
                    .map(
                      (it) =>
                        `${it.qty} × ${it.description}${it.restock ? "" : " (not restocked)"}`,
                    )
                    .join(" · ")}
                  {r.note ? ` — ${r.note}` : ""}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isAdmin && balance > 0 && (
        <Card className="mb-5 flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[180px]">
            <Label>Record a payment (partial or full)</Label>
            <Input
              type="number"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              placeholder={`Up to ${balance}`}
            />
          </div>
          <Button onClick={recordPayment} disabled={patch.isPending}>
            <Wallet className="h-4 w-4" /> Record payment
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              patch.mutate(
                { paid: totals.total, status: "approved" },
                { onSuccess: () => toast.success("Marked fully paid") },
              )
            }
          >
            <Check className="h-4 w-4" /> Mark fully paid
          </Button>
        </Card>
      )}

      {/* the printable invoice */}
      <div className="overflow-x-auto rounded-xl bg-neutral-200/60 p-4">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
