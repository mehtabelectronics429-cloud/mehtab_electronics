/**
 * Double-column (debit / credit) view of customer ledger entries.
 *
 * Entries are stored with a single signed `amount`, but historic writers were
 * not consistent about the sign (POS/complaint payments are stored positive,
 * refunds negative). So the column is decided by the entry *type* first and
 * only `adjustment` falls back to the sign:
 *
 *   invoice, debit   → Debit  (customer owes more)
 *   payment, credit  → Credit (customer owes less)
 *   adjustment       → +amount Debit, −amount Credit
 *
 * Balance = Σ debit − Σ credit (positive = receivable from the customer).
 * Only approved entries are posted; pending ones are listed separately.
 */

export type LedgerType = "invoice" | "payment" | "credit" | "debit" | "adjustment";

/** A goods line attached to a ledger entry (product, qty, unit price). */
export type LedgerItem = {
  productId?: string | null;
  description: string;
  qty: number;
  unitPrice: number;
};

export const ledgerItemsTotal = (items: LedgerItem[] = []) =>
  Math.round(items.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0) * 100) / 100;

/** One-line text for an item: "Inverter 5kW × 2 @ 85,000 = 170,000". */
export const ledgerItemText = (i: LedgerItem, fmt: (n: number) => string = (n) => n.toLocaleString("en-PK")) =>
  `${i.description} × ${i.qty} @ ${fmt(i.unitPrice)} = ${fmt(i.qty * i.unitPrice)}`;

export type RawLedgerEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  type: LedgerType | string;
  amount: number;
  status: "pending" | "approved" | string;
  note: string;
  ref?: string;
  items?: LedgerItem[];
};

export type StatementRow = {
  id: string;
  date: string;
  type: string;
  ref: string;
  particulars: string;
  status: string;
  debit: number;
  credit: number;
  /** Goods on this entry (sale / debit note lines). */
  items: LedgerItem[];
  /** Running balance after this row (approved rows only; pending rows repeat the prior balance). */
  balance: number;
};

export type StatementTotals = {
  opening: number;
  debit: number;
  credit: number;
  closing: number;
  count: number;
  pendingCount: number;
  pendingDebit: number;
  pendingCredit: number;
};

export type LedgerStatement = {
  customer: {
    id: string;
    name: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  from: string | null;
  to: string | null;
  rows: StatementRow[];
  totals: StatementTotals;
};

export type LedgerSummaryRow = {
  customerId: string;
  name: string;
  phone: string;
  opening: number;
  debit: number;
  credit: number;
  closing: number;
  entries: number;
};

export type LedgerSummary = {
  from: string | null;
  to: string | null;
  rows: LedgerSummaryRow[];
  totals: { opening: number; debit: number; credit: number; closing: number; entries: number };
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function splitDebitCredit(type: string, amount: number) {
  const abs = Math.abs(Number(amount) || 0);
  switch (type) {
    case "invoice":
    case "debit":
      return { debit: abs, credit: 0 };
    case "payment":
    case "credit":
      return { debit: 0, credit: abs };
    default:
      return amount >= 0 ? { debit: abs, credit: 0 } : { debit: 0, credit: abs };
  }
}

/** Signed effect of an entry on the customer balance (+ receivable). */
export const balanceEffect = (type: string, amount: number) => {
  const { debit, credit } = splitDebitCredit(type, amount);
  return debit - credit;
};

const TYPE_LABEL: Record<string, string> = {
  invoice: "Sale / Invoice",
  payment: "Payment received",
  credit: "Credit",
  debit: "Debit",
  adjustment: "Adjustment",
};

export const ledgerTypeLabel = (t: string) => TYPE_LABEL[t] || t;

/**
 * Build a statement. `before` are approved+pending entries dated before `from`
 * (used only for the opening balance); `entries` are the period entries.
 */
export function buildStatement(
  customer: LedgerStatement["customer"],
  entries: RawLedgerEntry[],
  before: RawLedgerEntry[],
  from: string | null,
  to: string | null,
): LedgerStatement {
  const opening = round2(
    before
      .filter((e) => e.status === "approved")
      .reduce((s, e) => s + balanceEffect(e.type, e.amount), 0),
  );

  let running = opening;
  const totals: StatementTotals = {
    opening,
    debit: 0,
    credit: 0,
    closing: opening,
    count: 0,
    pendingCount: 0,
    pendingDebit: 0,
    pendingCredit: 0,
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const rows: StatementRow[] = sorted.map((e) => {
    const { debit, credit } = splitDebitCredit(e.type, e.amount);
    if (e.status === "approved") {
      running = round2(running + debit - credit);
      totals.debit += debit;
      totals.credit += credit;
      totals.count += 1;
    } else {
      totals.pendingCount += 1;
      totals.pendingDebit += debit;
      totals.pendingCredit += credit;
    }
    return {
      id: e.id,
      date: e.date,
      type: e.type,
      ref: e.ref || "",
      particulars: e.note || ledgerTypeLabel(e.type),
      status: e.status,
      debit,
      credit,
      items: e.items ?? [],
      balance: running,
    };
  });

  totals.debit = round2(totals.debit);
  totals.credit = round2(totals.credit);
  totals.pendingDebit = round2(totals.pendingDebit);
  totals.pendingCredit = round2(totals.pendingCredit);
  totals.closing = round2(opening + totals.debit - totals.credit);

  return { customer, from, to, rows, totals };
}

/** Human label for a balance: "Rs 1,200 Dr" (receivable) / "Rs 300 Cr" (advance). */
export function drCr(n: number, fmt: (n: number) => string) {
  if (Math.abs(n) < 0.005) return fmt(0);
  return `${fmt(Math.abs(n))} ${n > 0 ? "Dr" : "Cr"}`;
}

/** Parse YYYY-MM-DD range params into Mongo date bounds (local day edges). */
export function dateBounds(from: string | null, to: string | null) {
  const start = from ? new Date(from) : null;
  if (start) start.setHours(0, 0, 0, 0);
  const end = to ? new Date(to) : null;
  if (end) end.setHours(23, 59, 59, 999);
  return { start, end };
}

export type ProductSummaryRow = {
  key: string;
  description: string;
  soldQty: number;
  soldAmount: number;
  returnedQty: number;
  returnedAmount: number;
  netQty: number;
  netAmount: number;
  /** Number of ledger entries this product appears on. */
  entries: number;
};

/**
 * Per-product totals across a customer's statement: goods on debit entries
 * (sales / goods on account) count as sold, goods on credit entries (returns)
 * as returned. Approved entries only, so it agrees with the balance.
 */
export function ledgerProductSummary(
  rows: Pick<StatementRow, "status" | "debit" | "credit" | "items">[],
): { rows: ProductSummaryRow[]; totals: Omit<ProductSummaryRow, "key" | "description" | "entries"> } {
  const map = new Map<string, ProductSummaryRow>();
  for (const r of rows) {
    if (r.status !== "approved" || !r.items?.length) continue;
    const returned = r.credit > 0 && !r.debit;
    for (const it of r.items) {
      const key = it.productId || `txt:${it.description.trim().toLowerCase()}`;
      const row =
        map.get(key) ??
        ({
          key,
          description: it.description,
          soldQty: 0,
          soldAmount: 0,
          returnedQty: 0,
          returnedAmount: 0,
          netQty: 0,
          netAmount: 0,
          entries: 0,
        } satisfies ProductSummaryRow);
      const amount = (it.qty || 0) * (it.unitPrice || 0);
      if (returned) {
        row.returnedQty += it.qty;
        row.returnedAmount += amount;
      } else {
        row.soldQty += it.qty;
        row.soldAmount += amount;
      }
      row.netQty = row.soldQty - row.returnedQty;
      row.netAmount = round2(row.soldAmount - row.returnedAmount);
      row.entries += 1;
      map.set(key, row);
    }
  }
  const list = Array.from(map.values()).sort((a, b) => b.netAmount - a.netAmount);
  const totals = list.reduce(
    (t, r) => ({
      soldQty: t.soldQty + r.soldQty,
      soldAmount: round2(t.soldAmount + r.soldAmount),
      returnedQty: t.returnedQty + r.returnedQty,
      returnedAmount: round2(t.returnedAmount + r.returnedAmount),
      netQty: t.netQty + r.netQty,
      netAmount: round2(t.netAmount + r.netAmount),
    }),
    { soldQty: 0, soldAmount: 0, returnedQty: 0, returnedAmount: 0, netQty: 0, netAmount: 0 },
  );
  return { rows: list, totals };
}
