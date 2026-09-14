"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Printer, MessageCircle, FileInput } from "lucide-react";
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
  const [customerId, setCustomerId] = useState("");
  const [converting, setConverting] = useState(false);
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
  const [lines, setLines] = useState<ProductLine[]>([
    {
      productId: null,
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
        subtitle="Build an installation quote with products, labour and materials — then download, share or print."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={converting}
              onClick={() => void convertToInvoice()}
            >
              <FileInput className="h-4 w-4" />
              {converting ? "Converting…" : "Convert to invoice"}
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
    </div>
  );
}
