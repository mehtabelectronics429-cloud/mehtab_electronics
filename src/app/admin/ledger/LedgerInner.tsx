"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Download,
  MessageCircle,
  BellRing,
  FileText,
  Plus,
  Share2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatCard } from "@/components/admin/ui/feedback";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
} from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { pkr } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { LedgerEntry } from "@/lib/admin/types";
import {
  openWhatsAppUrl,
  toastForWhatsAppResult,
} from "@/lib/admin/whatsapp-client";
import {
  downloadFile,
  generateLedgerStatementPdf,
  generateLedgerSummaryPdf,
} from "@/lib/admin/ledger-pdf";
import {
  drCr,
  ledgerTypeLabel,
  splitDebitCredit,
  type LedgerStatement,
} from "@/lib/ledger/statement";

type Tab = "statement" | "entries" | "balances";

const bal = (n: number) => drCr(n, pkr);
const amt = (n: number) => (n ? pkr(n) : "");

/** Entry kinds offered in the "New entry" form → stored ledger type. */
const ENTRY_KINDS = [
  { value: "payment", side: "credit", label: "Payment received", hint: "Cash / bank received from customer" },
  { value: "credit", side: "credit", label: "Credit note / discount", hint: "Reduces what the customer owes" },
  { value: "debit", side: "debit", label: "Debit note / charge", hint: "Adds to what the customer owes" },
] as const;

export default function LedgerPageInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canManage = !!user && can(user.role, "ledger.manage");
  const canApprove = !!user && can(user.role, "ledger.approve");
  const canWhatsapp =
    user &&
    (can(user.role, "whatsapp.send") || can(user.role, "whatsapp.view"));
  const params = useSearchParams();
  const qc = useQueryClient();

  const [customerId, setCustomerId] = useState(params.get("customerId") || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tab, setTab] = useState<Tab>(customerId ? "statement" : "entries");
  const [side, setSide] = useState<"all" | "debit" | "credit">("all");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [entryOpen, setEntryOpen] = useState(false);

  useEffect(() => setPage(1), [customerId, from, to, side]);

  const range = { from: from || undefined, to: to || undefined };

  const { data: customers } = useQuery({
    queryKey: ["customers-opts-ledger"],
    queryFn: () => api.customers({ limit: 300 }),
  });

  const entries = useQuery({
    queryKey: ["ledger", page, customerId, from, to, side],
    queryFn: () =>
      api.ledger({
        page,
        limit: 15,
        customerId: customerId || undefined,
        type: side === "all" ? undefined : side,
        ...range,
      }),
    enabled: tab === "entries",
  });

  const statement = useQuery({
    queryKey: ["ledger-statement", customerId, from, to],
    queryFn: () => api.ledgerReport({ customerId, ...range }),
    enabled: tab === "statement" && !!customerId,
  });

  const summary = useQuery({
    queryKey: ["ledger-summary", from, to],
    queryFn: () => api.ledgerSummary(range),
    enabled: tab === "balances" || tab === "entries",
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["ledger"] });
    qc.invalidateQueries({ queryKey: ["ledger-statement"] });
    qc.invalidateQueries({ queryKey: ["ledger-summary"] });
  };

  const approve = useMutation({
    mutationFn: (id: string) => api.updateLedger(id, { status: "approved" }),
    onSuccess: () => {
      refresh();
      toast.success("Ledger entry approved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendWa = useMutation({
    mutationFn: ({ id, channel }: { id: string; channel: "direct" | "business" }) =>
      api.sendLedgerWhatsapp(id, "ledger_statement", channel),
    onSuccess: (res) => {
      toast.success(toastForWhatsAppResult(res, () => void api.tickJobs()));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const run = async (key: string, fn: () => Promise<void> | void) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const loadStatement = async (): Promise<LedgerStatement> => {
    if (!customerId) throw new Error("Select a customer first");
    return statement.data ?? api.ledgerReport({ customerId, ...range });
  };

  const statementPdf = () =>
    run("st-pdf", async () => {
      downloadFile(await generateLedgerStatementPdf(await loadStatement()));
      toast.success("Statement PDF downloaded");
    });

  const summaryPdf = () =>
    run("sm-pdf", async () => {
      const sm = summary.data ?? (await api.ledgerSummary(range));
      downloadFile(await generateLedgerSummaryPdf(sm));
      toast.success("Ledger summary PDF downloaded");
    });

  const statementWhatsapp = () =>
    run("st-wa", async () => {
      const st = await loadStatement();
      const file = await generateLedgerStatementPdf(st);
      const period =
        st.from || st.to ? `${st.from || "…"} to ${st.to || "…"}` : "all dates";
      const text =
        `Assalam o Alaikum ${st.customer.name},\n\n` +
        `Your ledger statement from Mehtab Electronics (${period}).\n` +
        `Opening balance: ${bal(st.totals.opening)}\n` +
        `Total debit: ${pkr(st.totals.debit)}\n` +
        `Total credit: ${pkr(st.totals.credit)}\n` +
        `Closing balance: ${bal(st.totals.closing)}`;

      const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: file.name, text });
          toast.success("Share sheet opened");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }
      downloadFile(file);
      const phone = (st.customer.whatsapp || st.customer.phone || "").replace(/\D/g, "");
      if (!phone) {
        toast.error("No WhatsApp/phone on file — PDF was downloaded");
        return;
      }
      const intl = phone.startsWith("92") ? phone : phone.replace(/^0/, "92");
      openWhatsAppUrl(
        `https://wa.me/${intl}?text=${encodeURIComponent(
          text + "\n\nPlease find the PDF statement attached.",
        )}`,
      );
      toast.success("PDF downloaded — WhatsApp opened with statement summary");
    });

  const openStatement = (id: string) => {
    setCustomerId(id);
    setTab("statement");
  };

  /* ── all-entries table ─────────────────────────────────────────────── */
  const columns: ColumnDef<LedgerEntry>[] = [
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: (i) => (
        <button
          onClick={() => i.row.original.customerId && openStatement(i.row.original.customerId)}
          className="text-left hover:text-cyan hover:underline"
        >
          {i.getValue<string>()}
        </button>
      ),
    },
    {
      id: "ref",
      header: "Ref #",
      cell: (i) => (
        <span className="text-white/50">
          {i.row.original.invoiceNumber || i.row.original.installationRef || "—"}
        </span>
      ),
    },
    {
      id: "particulars",
      header: "Particulars",
      cell: (i) => (
        <div className="max-w-[18rem]">
          <div className="truncate">{i.row.original.note || ledgerTypeLabel(i.row.original.type)}</div>
          <div className="text-[0.65rem] text-white/40">{ledgerTypeLabel(i.row.original.type)}</div>
        </div>
      ),
    },
    {
      id: "debit",
      header: () => <div className="text-right">Debit</div>,
      cell: (i) => (
        <div className="text-right tabular-nums text-red-600 dark:text-red-300">
          {amt(splitDebitCredit(i.row.original.type, i.row.original.amount).debit)}
        </div>
      ),
    },
    {
      id: "credit",
      header: () => <div className="text-right">Credit</div>,
      cell: (i) => (
        <div className="text-right tabular-nums text-emerald-600 dark:text-emerald-300">
          {amt(splitDebitCredit(i.row.original.type, i.row.original.amount).credit)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (i) => <StatusPill status={i.getValue<string>()} />,
    },
    {
      id: "act",
      header: "",
      cell: (i) => (
        <RowActions
          entry={i.row.original}
          canWhatsapp={!!canWhatsapp}
          canApprove={isAdmin || canApprove}
          onWa={(channel) => sendWa.mutate({ id: i.row.original.id, channel })}
          onApprove={() => approve.mutate(i.row.original.id)}
        />
      ),
    },
  ];

  const customerOptions = (customers?.items ?? []).map((c) => ({
    value: c.id,
    label: c.name,
    searchText: `${c.name} ${c.phone || ""}`,
  }));

  const sm = summary.data;
  const st = statement.data;

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Ledger" : "My Ledger"}
        subtitle={
          isAdmin
            ? "Customer accounts with debit, credit and running balance. Export statements or the full ledger as PDF / CSV."
            : "Invoice entries from your installations appear here as pending until an admin approves them."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => api.downloadLedger(range)}
            >
              <Download className="h-4 w-4" /> Download CSV
            </Button>
            <Button
              variant="secondary"
              disabled={!!busy}
              onClick={summaryPdf}
            >
              <FileText className="h-4 w-4" />
              {busy === "sm-pdf" ? "Preparing…" : "Download PDF"}
            </Button>
            {canManage && (
              <Button onClick={() => setEntryOpen(true)}>
                <Plus className="h-4 w-4" /> New entry
              </Button>
            )}
          </div>
        }
      />

      {/* filters */}
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <div>
            <Label>Customer</Label>
            <SearchableSelect
              value={customerId}
              onChange={(v) => {
                setCustomerId(v);
                if (v) setTab("statement");
              }}
              placeholder="All customers"
              options={customerOptions}
            />
          </div>
          <div>
            <Label>From</Label>
            <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              disabled={!customerId && !from && !to}
              onClick={() => {
                setCustomerId("");
                setFrom("");
                setTo("");
                setTab("entries");
              }}
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["statement", "Customer statement"],
            ["entries", "All entries"],
            ["balances", "Customer balances"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-xl border px-3.5 py-1.5 text-sm transition",
              tab === k
                ? "border-cyan/40 bg-cyan/15 text-white"
                : "border-white/10 text-white/60 hover:bg-white/5",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── statement ── */}
      {tab === "statement" &&
        (!customerId ? (
          <Card className="p-10 text-center text-sm text-white/50">
            Select a customer above to see their ledger statement with debit, credit and running balance.
          </Card>
        ) : statement.isLoading || !st ? (
          <Card className="p-10 text-center text-sm text-white/50">Loading statement…</Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Opening balance" value={bal(st.totals.opening)} icon="History" />
              <StatCard label="Total debit" value={pkr(st.totals.debit)} icon="ArrowUpRight" accent="red" index={1} />
              <StatCard label="Total credit" value={pkr(st.totals.credit)} icon="ArrowDownLeft" accent="energy" index={2} />
              <StatCard
                label="Closing balance"
                value={bal(st.totals.closing)}
                delta={st.totals.closing > 0 ? "Receivable from customer" : st.totals.closing < 0 ? "Advance held for customer" : "Account settled"}
                icon="Scale"
                accent={st.totals.closing > 0 ? "red" : "energy"}
                index={3}
              />
            </div>

            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                <div>
                  <div className="font-display text-base text-white">{st.customer.name}</div>
                  <div className="text-xs text-white/50">
                    {[st.customer.phone, st.customer.address].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => api.downloadLedger({ customerId, ...range })}>
                    <Download className="h-3.5 w-3.5" /> CSV
                  </Button>
                  <Button variant="secondary" size="sm" disabled={!!busy} onClick={statementPdf}>
                    <FileText className="h-3.5 w-3.5" /> {busy === "st-pdf" ? "…" : "PDF"}
                  </Button>
                  <Button size="sm" disabled={!!busy} onClick={statementWhatsapp}>
                    <Share2 className="h-3.5 w-3.5" /> {busy === "st-wa" ? "…" : "WhatsApp"}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[0.65rem] uppercase tracking-wider text-white/40">
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Ref #</th>
                      <th className="px-4 py-3 font-semibold">Particulars</th>
                      <th className="px-4 py-3 text-right font-semibold">Debit</th>
                      <th className="px-4 py-3 text-right font-semibold">Credit</th>
                      <th className="px-4 py-3 text-right font-semibold">Balance</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 bg-white/[0.02] italic text-white/60">
                      <td className="px-4 py-2.5">{st.from || ""}</td>
                      <td className="px-4 py-2.5" />
                      <td className="px-4 py-2.5">Opening balance</td>
                      <td />
                      <td />
                      <td className="px-4 py-2.5 text-right font-medium not-italic tabular-nums text-white">
                        {bal(st.totals.opening)}
                      </td>
                      <td />
                    </tr>
                    {st.rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                          No transactions in this period
                        </td>
                      </tr>
                    )}
                    {st.rows.map((r) => {
                      const pending = r.status !== "approved";
                      return (
                        <tr key={r.id} className={cn("border-b border-white/5", pending && "text-white/45")}>
                          <td className="whitespace-nowrap px-4 py-2.5">{r.date}</td>
                          <td className="px-4 py-2.5 text-white/50">{r.ref || "—"}</td>
                          <td className="px-4 py-2.5">
                            {r.particulars}
                            <span className="ml-2 text-[0.65rem] text-white/35">{ledgerTypeLabel(r.type)}</span>
                            {pending && <StatusPill status="pending" className="ml-2" />}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-red-600 dark:text-red-300">{amt(r.debit)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-300">{amt(r.credit)}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium tabular-nums">
                            {pending ? "—" : bal(r.balance)}
                          </td>
                          <td className="px-2 py-2.5">
                            {pending && (isAdmin || canApprove) && (
                              <button
                                onClick={() => approve.mutate(r.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/20 font-semibold">
                      <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-white/60">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-red-600 dark:text-red-300">{pkr(st.totals.debit)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-300">{pkr(st.totals.credit)}</td>
                      <td />
                      <td />
                    </tr>
                    <tr className="bg-white/[0.04] font-bold">
                      <td colSpan={5} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-white/70">
                        Closing balance
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-base tabular-nums text-white">
                        {bal(st.totals.closing)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {st.totals.pendingCount > 0 && (
                <div className="border-t border-white/10 px-4 py-2.5 text-xs text-amber-300/80">
                  {st.totals.pendingCount} pending entr{st.totals.pendingCount === 1 ? "y" : "ies"} (Dr{" "}
                  {pkr(st.totals.pendingDebit)} / Cr {pkr(st.totals.pendingCredit)}) are listed but not posted to the balance until approved.
                </div>
              )}
            </Card>
          </div>
        ))}

      {/* ── all entries ── */}
      {tab === "entries" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {(["all", "debit", "credit"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSide(k)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs capitalize transition",
                    side === k ? "border-cyan/40 bg-cyan/15 text-white" : "border-white/10 text-white/60 hover:bg-white/5",
                  )}
                >
                  {k === "all" ? "All" : k === "debit" ? "Debits" : "Credits"}
                </button>
              ))}
            </div>
            {sm && !customerId && (
              <div className="flex flex-wrap gap-4 text-xs text-white/60">
                <span>
                  Total debit <b className="tabular-nums text-red-600 dark:text-red-300">{pkr(sm.totals.debit)}</b>
                </span>
                <span>
                  Total credit <b className="tabular-nums text-emerald-600 dark:text-emerald-300">{pkr(sm.totals.credit)}</b>
                </span>
                <span>
                  Net <b className="tabular-nums text-white">{bal(sm.totals.debit - sm.totals.credit)}</b>
                </span>
              </div>
            )}
          </div>
          <DataTable
            columns={columns}
            data={entries.data?.items ?? []}
            loading={entries.isLoading}
            page={entries.data?.page}
            totalPages={entries.data?.totalPages}
            total={entries.data?.total}
            onPageChange={setPage}
            empty={{ title: "No ledger entries" }}
          />
        </div>
      )}

      {/* ── balances ── */}
      {tab === "balances" && (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
            <div className="text-sm text-white/70">
              Opening, period debit / credit and closing balance per customer (approved entries).
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => api.downloadLedger({ view: "summary", ...range })}>
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button variant="secondary" size="sm" disabled={!!busy} onClick={summaryPdf}>
                <FileText className="h-3.5 w-3.5" /> {busy === "sm-pdf" ? "…" : "PDF"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[0.65rem] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 text-right font-semibold">Opening</th>
                  <th className="px-4 py-3 text-right font-semibold">Debit</th>
                  <th className="px-4 py-3 text-right font-semibold">Credit</th>
                  <th className="px-4 py-3 text-right font-semibold">Closing balance</th>
                </tr>
              </thead>
              <tbody>
                {summary.isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40">Loading…</td>
                  </tr>
                )}
                {sm && sm.rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40">No ledger activity</td>
                  </tr>
                )}
                {sm?.rows.map((r) => (
                  <tr
                    key={r.customerId}
                    onClick={() => openStatement(r.customerId)}
                    className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="text-white">{r.name}</div>
                      <div className="text-[0.65rem] text-white/40">
                        {r.phone || "—"} · {r.entries} entr{r.entries === 1 ? "y" : "ies"}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{bal(r.opening)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-red-600 dark:text-red-300">{amt(r.debit)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-300">{amt(r.credit)}</td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-semibold tabular-nums",
                        r.closing > 0
                          ? "text-red-600 dark:text-red-300"
                          : r.closing < 0
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-white",
                      )}
                    >
                      {bal(r.closing)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {sm && sm.rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-white/20 bg-white/[0.04] font-bold">
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-white/70">Grand total</td>
                    <td className="px-4 py-3 text-right tabular-nums">{bal(sm.totals.opening)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600 dark:text-red-300">{pkr(sm.totals.debit)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-300">{pkr(sm.totals.credit)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-white">{bal(sm.totals.closing)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      )}

      {canManage && (
        <NewEntryModal
          open={entryOpen}
          onClose={() => setEntryOpen(false)}
          customerOptions={customerOptions}
          defaultCustomerId={customerId}
          canApprove={isAdmin || canApprove}
          onSaved={(cid) => {
            refresh();
            if (cid) openStatement(cid);
          }}
        />
      )}
    </div>
  );
}

function StatusPill({ status, className }: { status: string; className?: string }) {
  return status === "approved" ? (
    <Badge className={cn("border-emerald-400/30 bg-emerald-400/10 text-emerald-300", className)}>Approved</Badge>
  ) : (
    <Badge className={cn("border-amber-400/30 bg-amber-400/10 text-amber-300", className)}>Pending</Badge>
  );
}

function RowActions({
  entry,
  canWhatsapp,
  canApprove,
  onWa,
  onApprove,
}: {
  entry: LedgerEntry;
  canWhatsapp: boolean;
  canApprove: boolean;
  onWa: (channel: "direct" | "business") => void;
  onApprove: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      {canWhatsapp && (
        <>
          <button
            title="Direct WhatsApp (template message)"
            onClick={() => onWa("direct")}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-emerald-300"
          >
            <BellRing className="h-4 w-4" />
          </button>
          <button
            title="WhatsApp Business API"
            onClick={() => onWa("business")}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-[#25D366]/15 hover:text-[#25D366]"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </>
      )}
      {canApprove && entry.status === "pending" && (
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
      )}
    </div>
  );
}

function NewEntryModal({
  open,
  onClose,
  customerOptions,
  defaultCustomerId,
  canApprove,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  customerOptions: { value: string; label: string; searchText?: string }[];
  defaultCustomerId: string;
  canApprove: boolean;
  onSaved: (customerId: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [cid, setCid] = useState(defaultCustomerId);
  const [kind, setKind] = useState<(typeof ENTRY_KINDS)[number]["value"]>("payment");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [post, setPost] = useState(true);

  useEffect(() => {
    if (open) {
      setCid(defaultCustomerId);
      setKind("payment");
      setAmount("");
      setDate(today);
      setNote("");
      setPost(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const meta = ENTRY_KINDS.find((k) => k.value === kind)!;
  const value = Number(amount) || 0;

  const save = useMutation({
    mutationFn: () =>
      api.createLedger({
        customerId: cid,
        type: kind,
        amount: value,
        date,
        note: note.trim() || meta.label,
        status: canApprove && post ? "approved" : "pending",
      }),
    onSuccess: () => {
      toast.success(`${meta.side === "debit" ? "Debit" : "Credit"} entry saved`);
      onSaved(cid);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="New ledger entry">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!cid) return toast.error("Select a customer");
          if (value <= 0) return toast.error("Enter an amount greater than 0");
          save.mutate();
        }}
        className="space-y-4"
      >
        <div>
          <Label>Customer</Label>
          <SearchableSelect value={cid} onChange={setCid} placeholder="Select customer…" options={customerOptions} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["debit", "credit"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setKind(s === "debit" ? "debit" : "payment")}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                meta.side === s
                  ? s === "debit"
                    ? "border-red-400/50 bg-red-400/10"
                    : "border-emerald-400/50 bg-emerald-400/10"
                  : "border-white/10 hover:bg-white/5",
              )}
            >
              <div className={cn("text-sm font-semibold", s === "debit" ? "text-red-300" : "text-emerald-300")}>
                {s === "debit" ? "Debit (Dr)" : "Credit (Cr)"}
              </div>
              <div className="text-[0.7rem] text-white/50">
                {s === "debit" ? "Customer owes more" : "Customer owes less"}
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Entry type</Label>
            <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              {ENTRY_KINDS.filter((k) => k.side === meta.side).map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[0.65rem] text-white/40">{meta.hint}</p>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>{meta.side === "debit" ? "Debit amount (Rs)" : "Credit amount (Rs)"}</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Particulars</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={meta.label} />
          </div>
        </div>

        {canApprove ? (
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={post} onChange={(e) => setPost(e.target.checked)} />
            Post to balance now (approved)
          </label>
        ) : (
          <p className="text-xs text-white/50">The entry will be pending until an admin approves it.</p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
