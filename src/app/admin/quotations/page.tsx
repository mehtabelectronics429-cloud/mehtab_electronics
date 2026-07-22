"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Printer, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
} from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import QuotationDocument, {
  type QuotationData,
  type QuotationLine,
} from "@/components/admin/QuotationDocument";
import ShareInvoiceButton from "@/components/admin/ShareInvoiceButton";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import { openWhatsAppUrl } from "@/lib/admin/whatsapp-client";

type LineKind = NonNullable<QuotationLine["kind"]>;

type EditorLine = {
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  kind: LineKind;
};

const KIND_OPTIONS: { value: LineKind; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "labour", label: "Labour" },
  { value: "material", label: "Material" },
  { value: "other", label: "Other" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextQuoteNo() {
  const n = Date.now().toString().slice(-6);
  return `QT-${n}`;
}

export default function QuotationsPage() {
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [title, setTitle] = useState("Solar / CCTV Installation");
  const [quoteNo, setQuoteNo] = useState(nextQuoteNo);
  const [date, setDate] = useState(today);
  const [validUntil, setValidUntil] = useState(() => plusDays(15));
  const [notes, setNotes] = useState(
    "Prices subject to site survey. Installation schedule to be confirmed after deposit.",
  );
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [lines, setLines] = useState<EditorLine[]>([
    {
      productId: "",
      description: "Installation labour",
      qty: 1,
      unitPrice: 0,
      kind: "labour",
    },
  ]);

  const { data: customers } = useQuery({
    queryKey: ["customers-opts-quote"],
    queryFn: () => api.customers({ limit: 300 }),
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts-quote"],
    queryFn: () => api.products({ limit: 300 }),
  });

  const pickCustomer = (id: string) => {
    setCustomerId(id);
    if (!id) return;
    const c = (customers?.items ?? []).find((x) => x.id === id);
    if (!c) return;
    setCustomerName(c.name);
    setCustomerPhone(c.phone || c.whatsapp || "");
    setCustomerAddress(c.address || "");
  };

  const setLine = (idx: number, patch: Partial<EditorLine>) =>
    setLines((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const pickProduct = (idx: number, id: string) => {
    if (!id) {
      setLine(idx, { productId: "", kind: "other" });
      return;
    }
    const p = (products?.items ?? []).find((x) => x.id === id);
    setLine(idx, {
      productId: id,
      description: p ? `${p.brand} ${p.model}`.trim() : "",
      unitPrice: p?.sellingPrice ?? 0,
      kind: "product",
    });
  };

  const quoteData: QuotationData = useMemo(
    () => ({
      number: quoteNo,
      date,
      validUntil,
      customerName,
      customerPhone,
      customerAddress,
      title,
      notes,
      discount,
      taxRate,
      shipping,
      items: lines
        .filter((l) => l.description.trim() && l.qty > 0)
        .map((l) => ({
          description: l.description.trim(),
          qty: l.qty,
          unitPrice: l.unitPrice,
          kind: l.kind,
        })),
    }),
    [
      quoteNo,
      date,
      validUntil,
      customerName,
      customerPhone,
      customerAddress,
      title,
      notes,
      discount,
      taxRate,
      shipping,
      lines,
    ],
  );

  const totals = invoiceTotals(quoteData);

  const shareWhatsApp = () => {
    const phone = (customerPhone || "").replace(/\D/g, "");
    if (!phone) return toast.error("Add a customer phone / WhatsApp number");
    const intl = phone.startsWith("92") ? phone : phone.replace(/^0/, "92");
    const msg =
      `Assalam o Alaikum ${customerName || ""},\n\n` +
      `Your quotation ${quoteNo} from Mehtab Electronics.\n` +
      (title ? `${title}\n` : "") +
      `Total: Rs ${totals.total.toLocaleString("en-PK")}\n` +
      (validUntil ? `Valid until: ${validUntil}\n` : "") +
      `\nPlease find the PDF quotation attached / shared separately.\n\nJazakAllah — Mehtab Electronics`;
    openWhatsAppUrl(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`);
    toast.success("Opening WhatsApp…");
  };

  return (
    <div>
      <PageHeader
        title="Quotation Generator"
        subtitle="Build an installation quote with products, labour and materials — then download, share or print."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <Button variant="secondary" onClick={shareWhatsApp}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <ShareInvoiceButton
              targetId="quotation-sheet"
              filename={`Quotation-${quoteNo}.pdf`}
              shareText={`Quotation ${quoteNo} — Mehtab Electronics. Total Rs ${totals.total.toLocaleString("en-PK")}.`}
              label="Download & Share"
            />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Customer (optional pick)</Label>
              <SearchableSelect
                value={customerId}
                onChange={pickCustomer}
                placeholder="Select existing customer…"
                options={(customers?.items ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                  searchText: `${c.name} ${c.phone || ""}`,
                }))}
              />
            </div>
            <div>
              <Label>Customer name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label>Phone / WhatsApp</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="03xx…"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Site / billing address"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Job / quote title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10kW Hybrid Solar Installation"
              />
            </div>
            <div>
              <Label>Quote #</Label>
              <Input value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Valid until</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Line items</Label>
              <button
                type="button"
                onClick={() =>
                  setLines((r) => [
                    ...r,
                    {
                      productId: "",
                      description: "",
                      qty: 1,
                      unitPrice: 0,
                      kind: "product",
                    },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((row, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 sm:grid-cols-[1fr_1.2fr_0.7fr_0.55fr_0.7fr_auto]"
                >
                  <SearchableSelect
                    value={row.productId}
                    onChange={(v) => pickProduct(idx, v)}
                    placeholder="Catalogue / custom…"
                    options={[
                      { value: "", label: "Custom / labour…" },
                      ...(products?.items ?? []).map((p) => ({
                        value: p.id,
                        label: `${p.brand} ${p.model}`.trim(),
                        searchText: `${p.brand} ${p.model} ${p.sku} ${p.category}`,
                      })),
                    ]}
                    allowClear={false}
                  />
                  <Input
                    value={row.description}
                    onChange={(e) =>
                      setLine(idx, { description: e.target.value })
                    }
                    placeholder="Description"
                  />
                  <SearchableSelect
                    value={row.kind}
                    onChange={(v) =>
                      setLine(idx, { kind: (v as LineKind) || "other" })
                    }
                    options={KIND_OPTIONS.map((k) => ({
                      value: k.value,
                      label: k.label,
                    }))}
                    allowClear={false}
                  />
                  <Input
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      setLine(idx, { qty: Number(e.target.value) || 0 })
                    }
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) =>
                      setLine(idx, {
                        unitPrice: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="Unit"
                  />
                  <button
                    type="button"
                    disabled={lines.length <= 1}
                    onClick={() =>
                      setLines((rs) => rs.filter((_, i) => i !== idx))
                    }
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Shipping</Label>
              <Input
                type="number"
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Tax %</Label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
            <div className="text-[0.65rem] uppercase tracking-wider text-white/40">
              Quote total
            </div>
            <div className="text-lg font-semibold text-white">
              {pkr(totals.total)}
            </div>
          </div>
        </Card>

        <div className="overflow-x-auto rounded-xl bg-neutral-200/60 p-3 print:bg-transparent print:p-0">
          <QuotationDocument data={quoteData} />
        </div>
      </div>
    </div>
  );
}
