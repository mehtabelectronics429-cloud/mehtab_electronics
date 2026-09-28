import { z } from "zod";
import { quotationInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";

type QuotationBody = Partial<z.infer<typeof quotationInput>>;

/** Map validated input onto Mongo fields (dates, nullable refs, cached total). */
export function toQuotationUpdate(body: QuotationBody) {
  const update: Record<string, unknown> = { ...body };
  if (body.date) update.date = new Date(body.date);
  if (body.validUntil !== undefined) {
    update.validUntil = body.validUntil ? new Date(body.validUntil) : null;
  }
  if (body.customerId !== undefined) update.customerId = body.customerId || null;
  if (body.invoiceId !== undefined) update.invoiceId = body.invoiceId || null;
  if (body.items) {
    update.items = body.items.map((i) => ({
      ...i,
      productId: i.productId || null,
      kind: i.kind || "product",
    }));
  }
  return update;
}

export function quotationTotal(q: {
  items: { qty: number; unitPrice: number }[];
  discount?: number;
  taxRate?: number;
  shipping?: number;
}) {
  return Math.round(invoiceTotals(q).total * 100) / 100;
}
