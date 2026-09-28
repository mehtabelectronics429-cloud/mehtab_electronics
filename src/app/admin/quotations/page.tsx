"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Printer,
  MessageCircle,
  FileInput,
  Save,
  FolderOpen,
  FilePlus,
  Search,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/admin/ui/primitives";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import ProductLineItems, {
  type ProductLine,
} from "@/components/admin/ui/ProductLineItems";
import { productOption } from "@/lib/admin/product-search";
import QuotationDocument, {
  type QuotationData,
} from "@/components/admin/QuotationDocument";
import ShareInvoiceButton from "@/components/admin/ShareInvoiceButton";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import { openWhatsAppUrl } from "@/lib/admin/whatsapp-client";
import type { Quotation, QuotationStatus } from "@/lib/admin/types";

const DEFAULT_TITLE = "Solar / CCTV Installation";
const DEFAULT_NOTES =
  "Prices subject to site survey. Installation schedule to be confirmed after deposit.";

const STATUSES: { value: QuotationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "converted", label: "Converted" },
];

const defaultLines = (): ProductLine[] => [
  {
    productId: null,
    description: "Installation labour",
    qty: 1,
    unitPrice: 0,
    kind: "labour",
  },
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
  const router = useRouter();
  const qc = useQueryClient();
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [status, setStatus] = useState<QuotationStatus>("draft");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserQ, setBrowserQ] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Quotation | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [converting, setConverting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [quoteNo, setQuoteNo] = useState(nextQuoteNo);
  const [date, setDate] = useState(today);
  const [validUntil, setValidUntil] = useState(() => plusDays(15));
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [lines, setLines] = useState<ProductLine[]>(defaultLines);

  const { data: customers } = useQuery({
    queryKey: ["customers-opts-quote"],
    queryFn: () => api.customers({ limit: 300 }),
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts-quote"],
    queryFn: () => api.products({ limit: 300 }),
  });
  const { data: saved, isLoading: savedLoading } = useQuery({
    queryKey: ["quotations", browserQ],
    queryFn: () => api.quotations({ limit: 50, q: browserQ || undefined }),
    enabled: browserOpen,
  });

  /** Keep `?id=` in the URL so a saved quote can be bookmarked / reopened. */
  const syncUrl = useCallback(
    (id: string | null) => {
      router.replace(id ? `/admin/quotations?id=${id}` : "/admin/quotations", {
        scroll: false,
      });
    },
    [router],
  );

  const resetForm = () => {
    setQuoteId(null);
    setStatus("draft");
    setInvoiceId(null);
    setCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setTitle(DEFAULT_TITLE);
    setQuoteNo(nextQuoteNo());
    setDate(today());
    setValidUntil(plusDays(15));
    setNotes(DEFAULT_NOTES);
    setDiscount(0);
    setShipping(0);
    setTaxRate(0);
    setLines(defaultLines());
    syncUrl(null);
  };

  const applyQuote = (q: Quotation) => {
    setQuoteId(q.id);
    setStatus(q.status || "draft");
    setInvoiceId(q.invoiceId || null);
    setCustomerId(q.customerId || "");
    setCustomerName(q.customerName || "");
    setCustomerPhone(q.customerPhone || "");
    setCustomerAddress(q.customerAddress || "");
    setTitle(q.title || "");
    setQuoteNo(q.number);
    setDate((q.date || today()).slice(0, 10));
    setValidUntil(q.validUntil ? q.validUntil.slice(0, 10) : "");
    setNotes(q.notes || "");
    setDiscount(q.discount || 0);
    setShipping(q.shipping || 0);
    setTaxRate(q.taxRate || 0);
    setLines(
      (q.items ?? []).map((i) => ({
        productId: i.productId || null,
        description: i.description,
        qty: i.qty,
        unitPrice: i.unitPrice,
        kind: i.kind || "product",
      })),
    );
  };

  const openQuote = useCallback(
    async (id: string) => {
      setLoadingQuote(true);
      try {
        const q = await api.getQuotation(id);
        applyQuote(q);
        syncUrl(q.id);
        setBrowserOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load quotation");
      } finally {
        setLoadingQuote(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncUrl],
  );

  // Open the quotation referenced by `?id=` on first load.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) void openQuote(id);
  }, [openQuote]);

  const pickCustomer = (id: string) => {
    setCustomerId(id);
    if (!id) return;
    const c = (customers?.items ?? []).find((x) => x.id === id);
    if (!c) return;
    setCustomerName(c.name);
    setCustomerPhone(c.phone || c.whatsapp || "");
    setCustomerAddress(c.address || "");
  };

  const productOptions = useMemo(
    () => (products?.items ?? []).map((p) => productOption(p)),
    [products],
  );

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

  const payload = (overrides?: Partial<Quotation>): Partial<Quotation> => ({
    number: quoteNo.trim(),
    customerId: customerId || null,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: customerAddress.trim(),
    title: title.trim(),
    date,
    validUntil: validUntil || null,
    notes,
    discount,
    shipping,
    taxRate,
    status,
    invoiceId,
    items: lines
      .filter((l) => l.description.trim() && l.qty > 0)
      .map((l) => ({
        productId: l.productId,
        description: l.description.trim(),
        qty: l.qty,
        unitPrice: l.unitPrice,
        kind: l.kind || "product",
      })),
    ...overrides,
  });

  /** Create or update the quotation; returns the saved record. */
  const persist = async (overrides?: Partial<Quotation>) => {
    const body = payload(overrides);
    const q = quoteId
      ? await api.updateQuotation(quoteId, body)
      : await api.createQuotation(body);
    if (!quoteId) {
      setQuoteId(q.id);
      syncUrl(q.id);
    }
    qc.invalidateQueries({ queryKey: ["quotations"] });
    return q;
  };

  const save = useMutation({
    mutationFn: () => {
      if (!quoteNo.trim()) throw new Error("Quote # is required");
      return persist();
    },
    onSuccess: () =>
      toast.success(quoteId ? "Quotation updated" : "Quotation saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveQuotation(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation deleted");
      if (id === quoteId) resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

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

  const convertToInvoice = async () => {
    const items = quoteData.items;
    if (!items.length) return toast.error("Add at least one line item");
    if (invoiceId) {
      router.push(`/admin/billing/${invoiceId}`);
      return;
    }
    if (!customerId && !customerName.trim()) {
      return toast.error("Select or enter a customer first");
    }
    if (!customerId && (customerPhone || "").replace(/\D/g, "").length < 7) {
      return toast.error("Enter a valid customer phone to create the invoice");
    }
    setConverting(true);
    try {
      let cid = customerId;
      if (!cid) {
        const phone = customerPhone.trim();
        const created = await api.createCustomer({
          name: customerName.trim(),
          phone,
          whatsapp: phone,
          address: customerAddress.trim() || "Address on file",
        });
        cid = created.id;
        setCustomerId(cid);
      }
      const inv = await api.createInvoice({
        customerId: cid,
        date,
        status: "pending",
        discount,
        taxRate,
        shipping,
        notes: [title, notes, `Converted from quotation ${quoteNo}`]
          .filter(Boolean)
          .join("\n"),
        items: items.map((i) => ({
          description: i.description,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      });
      // Keep the saved quotation linked to the invoice it produced.
      await persist({
        customerId: cid,
        status: "converted",
        invoiceId: inv.id,
      }).catch(() => undefined);
      toast.success("Invoice created from quotation");
      router.push(`/admin/billing/${inv.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create invoice");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quotation Generator"
        subtitle={
          quoteId
            ? `Editing saved quotation ${quoteNo} — changes apply when you click Update.`
            : "Build an installation quote with products, labour and materials — then save, download, share or print."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={save.isPending || loadingQuote}
              onClick={() => save.mutate()}
            >
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving…" : quoteId ? "Update" : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => setBrowserOpen(true)}>
              <FolderOpen className="h-4 w-4" /> Saved quotations
            </Button>
            {quoteId && (
              <Button variant="secondary" onClick={resetForm}>
                <FilePlus className="h-4 w-4" /> New
              </Button>
            )}
            <Button
              variant="secondary"
              disabled={converting}
              onClick={() => void convertToInvoice()}
            >
              <FileInput className="h-4 w-4" />
              {converting
                ? "Converting…"
                : invoiceId
                  ? "View invoice"
                  : "Convert to invoice"}
            </Button>
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

      <div className="space-y-4">
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
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
            <div className="sm:col-span-2 lg:col-span-2">
              <Label>Address</Label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Site / billing address"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <Label>Job / quote title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10kW Hybrid Solar Installation"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
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
            <Label>Line items</Label>
            <ProductLineItems
              value={lines}
              onChange={setLines}
              showKind
              productOptions={productOptions}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="flex items-end">
              <div className="w-full rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-2">
                <div className="text-[0.65rem] uppercase tracking-wider text-white/40">
                  Quote total
                </div>
                <div className="text-lg font-semibold text-white">
                  {pkr(totals.total)}
                </div>
              </div>
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
        </Card>

        <div className="w-full overflow-x-auto rounded-xl bg-neutral-200/60 p-4 print:bg-transparent print:p-0">
          <QuotationDocument data={quoteData} />
        </div>
      </div>

      <Modal
        open={browserOpen}
        onClose={() => setBrowserOpen(false)}
        title="Saved quotations"
        wide
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={browserQ}
              onChange={(e) => setBrowserQ(e.target.value)}
              placeholder="Search quote #, customer, phone or title…"
              className="pl-9"
            />
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {savedLoading && (
              <p className="py-6 text-center text-sm text-white/50">Loading…</p>
            )}
            {!savedLoading && !(saved?.items ?? []).length && (
              <p className="py-6 text-center text-sm text-white/50">
                No saved quotations yet. Fill in a quote and click Save.
              </p>
            )}
            {(saved?.items ?? []).map((q) => (
              <div
                key={q.id}
                role="button"
                tabIndex={0}
                onClick={() => void openQuote(q.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void openQuote(q.id);
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition hover:bg-white/5 ${
                  q.id === quoteId
                    ? "border-cyan/40 bg-cyan/5"
                    : "border-white/10"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{q.number}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="truncate text-xs text-white/50">
                    {[q.customerName || "No customer", q.title]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div className="text-[0.7rem] text-white/35">
                    {q.date?.slice(0, 10)} · {q.itemCount ?? 0} items
                    {q.updatedAt
                      ? ` · updated ${new Date(q.updatedAt).toLocaleDateString("en-PK")}`
                      : ""}
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-white">
                  {pkr(q.total || 0)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(q);
                  }}
                  aria-label={`Delete quotation ${q.number}`}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete quotation"
        message={`Delete quotation ${pendingDelete?.number ?? ""}${pendingDelete?.customerName ? ` for ${pendingDelete.customerName}` : ""}?`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          archive.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}
