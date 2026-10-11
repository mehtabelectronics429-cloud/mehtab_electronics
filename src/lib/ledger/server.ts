import { Types } from "mongoose";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
// Registered here because statements populate `invoiceId` / `installationId`;
// without these imports a route that never touched them fails with
// MissingSchemaError ("Schema hasn't been registered for model Invoice").
import "@/lib/db/models/Invoice";
import "@/lib/db/models/Installation";
import { notDeleted } from "@/lib/db/soft-delete";
import {
  buildStatement,
  dateBounds,
  type LedgerStatement,
  type LedgerSummary,
  type LedgerSummaryRow,
  type LedgerItem,
  type RawLedgerEntry,
} from "@/lib/ledger/statement";

type CustomerDoc = {
  _id: unknown;
  name: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
};

type PopulatedEntry = {
  _id: unknown;
  date: Date;
  type: string;
  amount: number;
  status: string;
  note?: string;
  invoiceId?: { number?: string; items?: RawItem[] } | null;
  installationId?: { ref?: string } | null;
  items?: RawItem[];
};

type RawItem = {
  productId?: unknown;
  description?: string;
  qty?: number;
  unitPrice?: number;
};

const cleanItems = (items?: RawItem[]): LedgerItem[] =>
  (items ?? [])
    .filter((i) => i && (i.description || "").trim())
    .map((i) => ({
      productId: i.productId ? String(i.productId) : null,
      description: String(i.description),
      qty: Number(i.qty) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    }));

/**
 * Goods lines for a ledger entry: its own snapshot, or — for sale entries
 * recorded before snapshots existed — the linked invoice's lines.
 */
export function ledgerEntryItems(e: {
  type: string;
  items?: RawItem[];
  invoiceId?: unknown;
}): LedgerItem[] {
  const own = cleanItems(e.items);
  if (own.length) return own;
  if (e.type !== "invoice") return [];
  const inv = e.invoiceId as { items?: RawItem[] } | null;
  return inv && typeof inv === "object" ? cleanItems(inv.items) : [];
}

const toRaw = (e: PopulatedEntry): RawLedgerEntry => ({
  id: String(e._id),
  date: new Date(e.date).toISOString().slice(0, 10),
  type: e.type,
  amount: e.amount,
  status: e.status,
  note: e.note || "",
  ref: e.invoiceId?.number || e.installationId?.ref || "",
  items: ledgerEntryItems(e),
});

export async function loadCustomerStatement(
  customer: CustomerDoc,
  from: string | null,
  to: string | null,
): Promise<LedgerStatement> {
  const { start, end } = dateBounds(from, to);
  const base = { ...notDeleted, customerId: customer._id };
  const period: Record<string, unknown> = { ...base };
  if (start || end) {
    period.date = { ...(start && { $gte: start }), ...(end && { $lte: end }) };
  }

  const [entries, before] = await Promise.all([
    LedgerEntry.find(period)
      .populate([
        { path: "invoiceId", select: "number items", strictPopulate: false },
        { path: "installationId", select: "ref", strictPopulate: false },
      ])
      .sort({ date: 1, createdAt: 1 })
      .lean<PopulatedEntry[]>(),
    start
      ? LedgerEntry.find({ ...base, date: { $lt: start } })
          .select("type amount status date")
          .lean<PopulatedEntry[]>()
      : Promise.resolve([] as PopulatedEntry[]),
  ]);

  return buildStatement(
    {
      id: String(customer._id),
      name: customer.name,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      address: customer.address,
    },
    entries.map(toRaw),
    before.map(toRaw),
    from,
    to,
  );
}

/** Per-type debit / credit expressions matching `splitDebitCredit`. */
const debitExpr = {
  $cond: [
    {
      $or: [
        { $in: ["$type", ["invoice", "debit"]] },
        { $and: [{ $eq: ["$type", "adjustment"] }, { $gte: ["$amount", 0] }] },
      ],
    },
    { $abs: "$amount" },
    0,
  ],
};
const creditExpr = {
  $cond: [
    {
      $or: [
        { $in: ["$type", ["payment", "credit"]] },
        { $and: [{ $eq: ["$type", "adjustment"] }, { $lt: ["$amount", 0] }] },
      ],
    },
    { $abs: "$amount" },
    0,
  ],
};

/**
 * All-customer ledger summary (approved entries): opening balance before
 * `from`, period debit / credit, and closing balance — one row per customer.
 */
export async function loadLedgerSummary(
  from: string | null,
  to: string | null,
  customerIds?: string[] | null,
): Promise<LedgerSummary> {
  const { start, end } = dateBounds(from, to);
  const match: Record<string, unknown> = { ...notDeleted, status: "approved" };
  if (end) match.date = { $lte: end };
  if (customerIds) {
    match.customerId = { $in: customerIds.map((id) => new Types.ObjectId(id)) };
  }
  const inPeriod = start ? { $gte: ["$date", start] } : true;
  const beforePeriod = start ? { $lt: ["$date", start] } : false;

  const grouped = await LedgerEntry.aggregate<{
    _id: Types.ObjectId;
    openDebit: number;
    openCredit: number;
    debit: number;
    credit: number;
    entries: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: "$customerId",
        openDebit: { $sum: { $cond: [beforePeriod, debitExpr, 0] } },
        openCredit: { $sum: { $cond: [beforePeriod, creditExpr, 0] } },
        debit: { $sum: { $cond: [inPeriod, debitExpr, 0] } },
        credit: { $sum: { $cond: [inPeriod, creditExpr, 0] } },
        entries: { $sum: { $cond: [inPeriod, 1, 0] } },
      },
    },
  ]);

  const customers = await Customer.find({
    _id: { $in: grouped.map((g) => g._id) },
    ...notDeleted,
  })
    .select("name phone")
    .lean<{ _id: Types.ObjectId; name: string; phone?: string }[]>();
  const byId = new Map(customers.map((c) => [String(c._id), c]));

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const rows: LedgerSummaryRow[] = grouped
    .filter((g) => byId.has(String(g._id)))
    .map((g) => {
      const c = byId.get(String(g._id))!;
      const opening = r2(g.openDebit - g.openCredit);
      return {
        customerId: String(g._id),
        name: c.name,
        phone: c.phone || "",
        opening,
        debit: r2(g.debit),
        credit: r2(g.credit),
        closing: r2(opening + g.debit - g.credit),
        entries: g.entries,
      };
    })
    .filter((r) => r.entries > 0 || Math.abs(r.opening) >= 0.005)
    .sort((a, b) => a.name.localeCompare(b.name));

  const totals = rows.reduce(
    (t, r) => ({
      opening: r2(t.opening + r.opening),
      debit: r2(t.debit + r.debit),
      credit: r2(t.credit + r.credit),
      closing: r2(t.closing + r.closing),
      entries: t.entries + r.entries,
    }),
    { opening: 0, debit: 0, credit: 0, closing: 0, entries: 0 },
  );

  return { from, to, rows, totals };
}

/**
 * Recompute `Customer.balance` from the ledger (Σ approved debit − credit,
 * soft-deleted entries excluded) so it can never drift from the statement.
 * Call after any write that creates, edits, approves or deletes entries.
 * Returns the fresh balance per customer id.
 */
export async function syncCustomerBalances(
  customerIds: (string | Types.ObjectId | null | undefined)[],
): Promise<Map<string, number>> {
  const ids = Array.from(
    new Set(customerIds.filter(Boolean).map((id) => String(id))),
  ).filter((id) => Types.ObjectId.isValid(id));
  const out = new Map<string, number>();
  if (!ids.length) return out;

  const grouped = await LedgerEntry.aggregate<{ _id: Types.ObjectId; debit: number; credit: number }>([
    {
      $match: {
        ...notDeleted,
        status: "approved",
        customerId: { $in: ids.map((id) => new Types.ObjectId(id)) },
      },
    },
    { $group: { _id: "$customerId", debit: { $sum: debitExpr }, credit: { $sum: creditExpr } } },
  ]);
  for (const id of ids) out.set(id, 0);
  for (const g of grouped) {
    out.set(String(g._id), Math.round((g.debit - g.credit) * 100) / 100);
  }

  await Customer.bulkWrite(
    Array.from(out, ([id, balance]) => ({
      // Only touch documents whose stored balance is actually stale.
      updateOne: {
        filter: { _id: new Types.ObjectId(id), balance: { $ne: balance } },
        update: { $set: { balance } },
        timestamps: false,
      },
    })),
  );
  return out;
}

export async function syncCustomerBalance(customerId: string | Types.ObjectId | null | undefined) {
  const map = await syncCustomerBalances([customerId]);
  return map.get(String(customerId)) ?? 0;
}
