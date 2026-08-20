export type InvoiceItem = {
  description: string;
  qty: number;
  unitPrice: number;
};

export type InvoiceTotalsInput = {
  items?: { qty: number; unitPrice: number }[];
  discount?: number;
  taxRate?: number; // percent
  shipping?: number;
};

/** The one place invoice money is computed  used by the API and the template. */
export function invoiceTotals(inv: InvoiceTotalsInput) {
  const subtotal = (inv.items ?? []).reduce(
    (s, i) => s + (i.qty || 0) * (i.unitPrice || 0),
    0,
  );
  const discount = inv.discount ?? 0;
  const lessDiscount = Math.max(0, subtotal - discount);
  const tax = lessDiscount * ((inv.taxRate ?? 0) / 100);
  const shipping = inv.shipping ?? 0;
  const total = lessDiscount + tax + shipping;
  return {
    subtotal,
    discount,
    lessDiscount,
    taxRate: inv.taxRate ?? 0,
    tax,
    shipping,
    total,
  };
}

/**
 * Cash refund owed for a set of returned lines. The invoice-level discount and
 * tax are prorated onto the returned goods so the customer gets back exactly
 * what they paid for them — shipping / handling is never refunded (standard
 * retail rule). Returns the raw goods value and the rounded cash refund.
 */
export function returnRefund(
  invoice: InvoiceTotalsInput,
  returnedLines: { qty: number; unitPrice: number }[],
) {
  const t = invoiceTotals(invoice);
  const returnedGross = returnedLines.reduce(
    (s, l) => s + (l.qty || 0) * (l.unitPrice || 0),
    0,
  );
  // Share of the subtotal the customer actually pays after the discount.
  const discountRatio = t.subtotal > 0 ? t.lessDiscount / t.subtotal : 1;
  const taxMultiplier = 1 + (t.taxRate || 0) / 100;
  const refund = Math.round(returnedGross * discountRatio * taxMultiplier * 100) / 100;
  return { returnedGross, refund };
}
