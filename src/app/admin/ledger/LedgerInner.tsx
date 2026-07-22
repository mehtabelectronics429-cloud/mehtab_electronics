"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Download,
  MessageCircle,
  BellRing,
  FileText,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Badge, Button, Card, Input, Label } from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import DataTable from "@/components/admin/ui/DataTable";
import LedgerDocument from "@/components/admin/LedgerDocument";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { pkr } from "@/lib/admin/format";
import type { LedgerEntry } from "@/lib/admin/types";
import {
  openWhatsAppUrl,
  toastForWhatsAppResult,
} from "@/lib/admin/whatsapp-client";
import {
  downloadFile,
  generateLedgerReportPdf,
  type LedgerReportData,
} from "@/lib/admin/ledger-pdf";

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export default function LedgerPageInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canWhatsapp =
    user &&
    (can(user.role, "whatsapp.send") || can(user.role, "whatsapp.view"));
  const params = useSearchParams();
  const urlCustomerId = params.get("customerId") || undefined;
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const [reportCustomerId, setReportCustomerId] = useState(urlCustomerId || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportBusy, setReportBusy] = useState<"csv" | "pdf" | "wa" | null>(
    null,
  );
  const [sheetData, setSheetData] = useState<LedgerReportData | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ledger", page, urlCustomerId],
    queryFn: () => api.ledger({ page, limit: 10, customerId: urlCustomerId }),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-opts-ledger"],
    queryFn: () => api.customers({ limit: 300 }),
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.updateLedger(id, { status: "approved" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      toast.success("Ledger entry approved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendWa = useMutation({
    mutationFn: ({
      id,
      channel,
    }: {
      id: string;
      channel: "direct" | "business";
    }) => api.sendLedgerWhatsapp(id, "ledger_statement", channel),
    onSuccess: (res) => {
      toast.success(toastForWhatsAppResult(res, () => void api.tickJobs()));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runReport = async (mode: "csv" | "pdf" | "wa") => {
    if (!reportCustomerId) {
      toast.error("Select a customer for the report");
      return;
    }
    setReportBusy(mode);
    try {
      if (mode === "csv") {
        api.downloadLedger({
          customerId: reportCustomerId,
          from: from || undefined,
          to: to || undefined,
        });
        toast.success("CSV download started");
        return;
      }

      const report = await api.ledgerReport({
        customerId: reportCustomerId,
        from: from || undefined,
        to: to || undefined,
      });
      setSheetData(report);
      await waitForPaint();
      // Allow Next/Image + fonts a beat before html2canvas capture.
      await new Promise((r) => setTimeout(r, 120));
      const file = await generateLedgerReportPdf(report);
      downloadFile(file);

      if (mode === "pdf") {
        toast.success("PDF downloaded");
        return;
      }

      // Prefer native share sheet with the PDF attached when available.
      const nav = navigator as Navigator & {
        canShare?: (d?: ShareData) => boolean;
      };
      const range =
        report.from || report.to
          ? `${report.from || "…"} to ${report.to || "…"}`
          : "all dates";
      const text =
        `Assalam o Alaikum ${report.customer.name},\n\n` +
        `Your ledger statement from Mehtab Electronics (${range}).\n` +
        `Entries: ${report.totals.count}\n` +
        `Debits: ${pkr(report.totals.debits)}\n` +
        `Credits: ${pkr(report.totals.credits)}\n` +
        `Current balance: ${pkr(report.customer.balance)}`;

      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: file.name,
            text,
          });
          toast.success("Share sheet opened");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }

      const phone = (report.customer.whatsapp || report.customer.phone || "")
        .replace(/\D/g, "");
      if (!phone) {
        toast.error("No WhatsApp/phone on file — PDF was downloaded");
        return;
      }
      const intl = phone.startsWith("92") ? phone : phone.replace(/^0/, "92");
      const waUrl = `https://wa.me/${intl}?text=${encodeURIComponent(
        text +
          "\n\nPlease find the PDF statement attached (downloaded — attach the file when sending).",
      )}`;
      openWhatsAppUrl(waUrl);
      toast.success("PDF downloaded — WhatsApp opened with statement summary");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Report failed");
    } finally {
      setReportBusy(null);
    }
  };

  const columns: ColumnDef<LedgerEntry>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "customer", header: "Customer" },
    {
      accessorKey: "installationRef",
      header: "Install",
      cell: (i) => (
        <span className="text-white/50">{i.getValue<string>() || ""}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: (i) => <Badge className="capitalize">{i.getValue<string>()}</Badge>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (i) => (
        <span
          className={
            i.getValue<number>() < 0 ? "text-emerald-300" : "text-white"
          }
        >
          {pkr(i.getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (i) =>
        i.getValue<string>() === "approved" ? (
          <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            Approved
          </Badge>
        ) : (
          <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-300">
            Pending
          </Badge>
        ),
    },
    {
      id: "act",
      header: "",
      cell: (i) => (
        <div className="flex justify-end gap-1">
          {canWhatsapp && (
            <>
              <button
                title="Direct WhatsApp (template message)"
                onClick={() =>
                  sendWa.mutate({ id: i.row.original.id, channel: "direct" })
                }
                className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-emerald-300"
              >
                <BellRing className="h-4 w-4" />
              </button>
              <button
                title="WhatsApp Business API"
                onClick={() =>
                  sendWa.mutate({ id: i.row.original.id, channel: "business" })
                }
                className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-[#25D366]/15 hover:text-[#25D366]"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {isAdmin && i.row.original.status === "pending" && (
            <button
              onClick={() => approve.mutate(i.row.original.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Ledger" : "My Ledger"}
        subtitle={
          isAdmin
            ? "All customer balances. Approve entries and send statements on WhatsApp."
            : "Invoice entries from your installations appear here as pending until an admin approves them."
        }
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              api.downloadLedger({
                customerId: urlCustomerId || reportCustomerId || undefined,
                from: from || undefined,
                to: to || undefined,
              })
            }
          >
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
          <FileText className="h-4 w-4" /> Customer ledger report
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Label>Customer</Label>
            <SearchableSelect
              value={reportCustomerId}
              onChange={setReportCustomerId}
              placeholder="Select customer…"
              options={(customers?.items ?? []).map((c) => ({
                value: c.id,
                label: c.name,
                searchText: `${c.name} ${c.phone || ""}`,
              }))}
            />
          </div>
          <div>
            <Label>From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <Label>To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={!!reportBusy}
              onClick={() => void runReport("csv")}
            >
              <Download className="h-3.5 w-3.5" />
              {reportBusy === "csv" ? "…" : "CSV"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!!reportBusy}
              onClick={() => void runReport("pdf")}
            >
              <FileText className="h-3.5 w-3.5" />
              {reportBusy === "pdf" ? "…" : "PDF"}
            </Button>
            <Button
              size="sm"
              disabled={!!reportBusy}
              onClick={() => void runReport("wa")}
            >
              <Share2 className="h-3.5 w-3.5" />
              {reportBusy === "wa" ? "…" : "WhatsApp"}
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{ title: "No ledger entries" }}
      />

      {/* Off-screen branded sheet for PDF capture (mirrors invoice letterhead). */}
      {sheetData && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-10000px] top-0 z-[-1] w-[794px]"
        >
          <LedgerDocument data={sheetData} />
        </div>
      )}
    </div>
  );
}
