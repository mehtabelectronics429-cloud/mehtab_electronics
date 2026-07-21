"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  Pencil,
  Archive,
  MapPin,
  BookOpen,
  BellRing,
  Download,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import {
  Button,
  Input,
  Label,
  Textarea,
  Badge,
} from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { pkr } from "@/lib/admin/format";
import type { Customer } from "@/lib/admin/types";
import { toastForWhatsAppResult } from "@/lib/admin/whatsapp-client";

const schema = z.object({
  name: z.string().min(2, "Required"),
  phone: z.string().min(7, "Required"),
  whatsapp: z.string().min(7, "Required"),
  address: z.string().min(3, "Required"),
  mapUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function CustomersPage() {
  const { user } = useAuth();
  const canManage = user && can(user.role, "customers.manage");
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [ledgerId, setLedgerId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, q],
    queryFn: () => api.customers({ page, limit: 20, q: q || undefined }),
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ["customer-ledger", ledgerId],
    queryFn: () => api.customerLedger(ledgerId!),
    enabled: !!ledgerId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      phone: "",
      whatsapp: "",
      address: "",
      mapUrl: "",
      notes: "",
    });
    setOpen(true);
  };
  const openEdit = (c: Customer) => {
    if (!canManage) return;
    setEditing(c);
    reset({
      name: c.name,
      phone: c.phone,
      whatsapp: c.whatsapp,
      address: c.address,
      mapUrl: c.mapUrl ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async (form: Form) => {
      if (editing) return api.updateCustomer(editing.id, form);
      return api.createCustomer(form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      toast.success(editing ? "Customer updated" : "Customer created");
    },
    onError: (e: Error) => toast.error(e.message || "Something went wrong"),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer archived");
    },
  });

  const remind = useMutation({
    mutationFn: ({
      id,
      channel,
    }: {
      id: string;
      channel: "direct" | "business";
    }) => api.remindCustomer(id, "payment_reminder", channel),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["whatsapp"] });
      toast.success(toastForWhatsAppResult(res, () => void api.tickJobs()));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.items ?? [];

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: (i) => (
          <div>
            <div className="font-medium text-white">{i.row.original.name}</div>
            <div className="text-xs text-white/40">
              {i.row.original.address}
            </div>
          </div>
        ),
      },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "installations",
        header: "Jobs",
        cell: (i) => (
          <span className="text-white/60">{i.getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: (i) => (
          <span
            className={
              i.getValue<number>() > 0 ? "text-amber-300" : "text-white/60"
            }
          >
            {pkr(i.getValue<number>())}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: (i) => (
          <div className="flex justify-end gap-1">
            <button
              title="View ledger"
              onClick={(e) => {
                e.stopPropagation();
                setLedgerId(i.row.original.id);
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-cyan"
            >
              <BookOpen className="h-4 w-4" />
            </button>
            <button
              title="Remind via WhatsApp (direct message)"
              onClick={(e) => {
                e.stopPropagation();
                remind.mutate({ id: i.row.original.id, channel: "direct" });
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-emerald-300"
            >
              <BellRing className="h-4 w-4" />
            </button>
            <button
              title="Remind via WhatsApp Business API"
              onClick={(e) => {
                e.stopPropagation();
                remind.mutate({ id: i.row.original.id, channel: "business" });
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-[#25D366]"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            {i.row.original.mapUrl && (
              <a
                href={i.row.original.mapUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
              >
                <MapPin className="h-4 w-4" />
              </a>
            )}
            {canManage && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(i.row.original);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(i.row.original);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [archive, canManage, remind],
  );

  return (
    <div>
      <PageHeader
        title={canManage ? "Customers" : "My Customers"}
        subtitle="Records, ledgers, payment reminders and installation history."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Customer
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search customers…"
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        onRowClick={(c) => setLedgerId(c.id)}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{
          title: "No customers yet",
          body: q
            ? "Try a different keyword"
            : "Add your first customer to get started.",
          action: canManage ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Customer
            </Button>
          ) : undefined,
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Archive customer"
        message={`Archive ${pendingDelete?.name}? Their ledger and activity will remain available for history.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          archive.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit customer" : "New customer"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input {...register("whatsapp")} />
          </div>
          <div>
            <Label>Google Maps URL</Label>
            <Input {...register("mapUrl")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...register("notes")} />
          </div>
          <div className="sm:col-span-2 mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || save.isPending}>
              {save.isPending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Create customer"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!ledgerId}
        onClose={() => setLedgerId(null)}
        title={
          ledgerData?.customer?.name
            ? `Ledger · ${ledgerData.customer.name}`
            : "Customer ledger"
        }
        wide
      >
        {ledgerLoading || !ledgerData ? (
          <div className="py-8 text-center text-sm text-white/40">
            Loading ledger…
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-white/50">
                  {ledgerData.customer.address}
                </div>
                <div className="mt-1 text-lg font-medium text-amber-300">
                  Balance {pkr(ledgerData.customer.balance)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => api.downloadLedger(ledgerData.customer.id)}
                >
                  <Download className="h-4 w-4" /> Download CSV
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    remind.mutate({
                      id: ledgerData.customer.id,
                      channel: "direct",
                    })
                  }
                >
                  <BellRing className="h-4 w-4" /> Direct WhatsApp
                </Button>
                <Button
                  onClick={() =>
                    remind.mutate({
                      id: ledgerData.customer.id,
                      channel: "business",
                    })
                  }
                >
                  <MessageCircle className="h-4 w-4" /> Business API
                </Button>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs uppercase tracking-wider text-white/40">
                Ledger entries
              </h4>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {ledgerData.ledger.length === 0 ? (
                  <p className="text-sm text-white/40">No ledger entries.</p>
                ) : (
                  ledgerData.ledger.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="capitalize text-white">{l.type}</span>
                        <span className="ml-2 text-xs text-white/40">
                          {String(l.date).slice(0, 10)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            l.amount < 0 ? "text-emerald-300" : "text-white"
                          }
                        >
                          {pkr(l.amount)}
                        </span>
                        <Badge className="capitalize">{l.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs uppercase tracking-wider text-white/40">
                  Installations
                </h4>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {ledgerData.installations.map((i) => (
                    <div
                      key={i.id}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-white">{i.ref}</span>
                        <StatusBadge status={i.status} />
                      </div>
                      <div className="text-xs text-white/40">
                        {i.type} · {i.employee} · {pkr(i.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs uppercase tracking-wider text-white/40">
                  Invoices
                </h4>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {ledgerData.invoices.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-white">{v.number}</span>
                        <StatusBadge status={v.status} />
                      </div>
                      <div className="text-xs text-white/40">
                        {pkr(v.amount)} · paid {pkr(v.paid)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
