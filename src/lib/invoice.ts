export type InvoiceItem = { description: string; qty: number; unitPrice: number };

export type InvoiceTotalsInput = {
  items?: { qty: number; unitPrice: number }[];
  discount?: number;
  taxRate?: number; // percent
  shipping?: number;
};

/** The one place invoice money is computed — used by the API and the template. */
export function invoiceTotals(inv: InvoiceTotalsInput) {
  const subtotal = (inv.items ?? []).reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0);
  const discount = inv.discount ?? 0;
  const lessDiscount = Math.max(0, subtotal - discount);
  const tax = lessDiscount * ((inv.taxRate ?? 0) / 100);
  const shipping = inv.shipping ?? 0;
  const total = lessDiscount + tax + shipping;
  return { subtotal, discount, lessDiscount, taxRate: inv.taxRate ?? 0, tax, shipping, total };
}
