"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, Download, MessageCircle, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Badge, Button } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { pkr } from "@/lib/admin/format";
import type { LedgerEntry } from "@/lib/admin/types";
import { toastForWhatsAppResult } from "@/lib/admin/whatsapp-client";

export default function LedgerPageInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canWhatsapp =
    user &&
    (can(user.role, "whatsapp.send") || can(user.role, "whatsapp.view"));
  const params = useSearchParams();
  const customerId = params.get("customerId") || undefined;
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["ledger", page, customerId],
    queryFn: () => api.ledger({ page, limit: 10, customerId }),
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
            onClick={() => api.downloadLedger(customerId)}
          >
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        }
      />
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
    </div>
  );
}
