import { Types } from "mongoose";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
import { notDeleted } from "@/lib/db/soft-delete";
import {
  buildStatement,
  dateBounds,
  type LedgerStatement,
  type LedgerSummary,
  type LedgerSummaryRow,
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
  invoiceId?: { number?: string } | null;
  installationId?: { ref?: string } | null;
};

const toRaw = (e: PopulatedEntry): RawLedgerEntry => ({
  id: String(e._id),
  date: new Date(e.date).toISOString().slice(0, 10),
  type: e.type,
  amount: e.amount,
  status: e.status,
  note: e.note || "",
  ref: e.invoiceId?.number || e.installationId?.ref || "",
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
        { path: "invoiceId", select: "number", strictPopulate: false },
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
