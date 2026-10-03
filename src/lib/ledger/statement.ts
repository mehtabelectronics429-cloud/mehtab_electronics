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

export type RawLedgerEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  type: LedgerType | string;
  amount: number;
  status: "pending" | "approved" | string;
  note: string;
  ref?: string;
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
