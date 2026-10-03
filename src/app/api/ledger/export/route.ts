import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
import { requireUser, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { loadCustomerStatement, loadLedgerSummary } from "@/lib/ledger/server";
import {
  dateBounds,
  ledgerTypeLabel,
  splitDebitCredit,
} from "@/lib/ledger/statement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const line = (cols: unknown[]) => cols.map(cell).join(",");
const n2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const slug = (s: string) => s.replace(/\s+/g, "-").toLowerCase();

/**
 * Ledger CSV.
 *  - `customerId`        → that customer's statement (opening, running balance, totals)
 *  - `view=summary`      → one row per customer (opening / debit / credit / closing)
 *  - otherwise           → every entry with debit & credit columns and a totals row
 */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (
      !can(user.role, "ledger.view.all") &&
      !can(user.role, "ledger.view.own")
    ) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");
    const from = url.searchParams.get("from") || null;
    const to = url.searchParams.get("to") || null;
    const view = url.searchParams.get("view");
    const range = from || to ? `-${from || "start"}-to-${to || "end"}` : "";

    const ownIds = await ownCustomerIdList(user);
    if (customerId && isOwnScope(ownIds) && !ownIds.includes(customerId)) {
      throw new ApiError(403, "Forbidden");
    }

    let rows: string[];
    let filename: string;

    if (customerId) {
      const customer = await Customer.findOne({ _id: customerId, ...notDeleted }).lean();
      if (!customer) throw new ApiError(404, "Customer not found");
      const st = await loadCustomerStatement(customer, from, to);
      rows = [
        line(["Ledger statement", st.customer.name]),
        line(["Period", from || "Beginning", to || "Today"]),
        "",
        line(["Date", "Ref", "Particulars", "Type", "Status", "Debit", "Credit", "Balance"]),
        line([from || "", "", "Opening balance", "", "", "", "", n2(st.totals.opening)]),
        ...st.rows.map((r) =>
          line([
            r.date,
            r.ref,
            r.particulars,
            ledgerTypeLabel(r.type),
            r.status,
            r.debit ? n2(r.debit) : "",
            r.credit ? n2(r.credit) : "",
            r.status === "approved" ? n2(r.balance) : "",
          ]),
        ),
        line(["", "", "Total (approved)", "", "", n2(st.totals.debit), n2(st.totals.credit), ""]),
        line(["", "", "Closing balance", "", "", "", "", n2(st.totals.closing)]),
      ];
      if (st.totals.pendingCount) {
        rows.push(
          line(["", "", `Pending, not posted (${st.totals.pendingCount})`, "", "", n2(st.totals.pendingDebit), n2(st.totals.pendingCredit), ""]),
        );
      }
      filename = `ledger-${slug(st.customer.name)}${range}.csv`;
    } else if (view === "summary") {
      const sm = await loadLedgerSummary(from, to, isOwnScope(ownIds) ? ownIds : null);
      rows = [
        line(["Customer", "Phone", "Opening", "Debit", "Credit", "Closing", "Entries"]),
        ...sm.rows.map((r) =>
          line([r.name, r.phone, n2(r.opening), n2(r.debit), n2(r.credit), n2(r.closing), r.entries]),
        ),
        line(["Total", "", n2(sm.totals.opening), n2(sm.totals.debit), n2(sm.totals.credit), n2(sm.totals.closing), sm.totals.entries]),
      ];
      filename = `ledger-summary${range}.csv`;
    } else {
      const filter: Record<string, unknown> = { ...notDeleted };
      const { start, end } = dateBounds(from, to);
      if (start || end) {
        filter.date = { ...(start && { $gte: start }), ...(end && { $lte: end }) };
      }
      if (isOwnScope(ownIds)) filter.customerId = { $in: ownIds };
      const entries = await LedgerEntry.find(filter)
        .populate([
          { path: "customerId", select: "name" },
          { path: "invoiceId", select: "number", strictPopulate: false },
          { path: "installationId", select: "ref", strictPopulate: false },
        ])
        .sort({ date: 1, createdAt: 1 })
        .lean();
      let td = 0;
      let tc = 0;
      rows = [
        line(["Date", "Customer", "Ref", "Particulars", "Type", "Status", "Debit", "Credit"]),
        ...entries.map((e) => {
          const { debit, credit } = splitDebitCredit(e.type, e.amount);
          if (e.status === "approved") {
            td += debit;
            tc += credit;
          }
          const c = e.customerId as unknown as { name?: string } | null;
          const inv = e.invoiceId as unknown as { number?: string } | null;
          const ins = e.installationId as unknown as { ref?: string } | null;
          return line([
            new Date(e.date).toISOString().slice(0, 10),
            c?.name || "",
            inv?.number || ins?.ref || "",
            e.note || ledgerTypeLabel(e.type),
            ledgerTypeLabel(e.type),
            e.status,
            debit ? n2(debit) : "",
            credit ? n2(credit) : "",
          ]);
        }),
        line(["", "", "", "Total (approved)", "", "", n2(td), n2(tc)]),
        line(["", "", "", "Net balance (Dr − Cr)", "", "", n2(td - tc), ""]),
      ];
      filename = `ledger-export${range}.csv`;
    }

    // BOM so Excel opens UTF-8 correctly.
    return new Response("﻿" + rows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
