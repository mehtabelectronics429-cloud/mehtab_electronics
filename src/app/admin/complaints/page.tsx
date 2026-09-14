"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive, Search, Wrench, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import {
  Button,
  Input,
  Label,
  Textarea,
} from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import ProductLineItems, {
  type ProductLine,
} from "@/components/admin/ui/ProductLineItems";
import { productOption } from "@/lib/admin/product-search";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { Complaint } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Customer name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  complaint: z.string().min(2, "Describe the complaint"),
  status: z.enum(["open", "assigned", "resolved", "cancelled"]),
  date: z.string().min(1),
});
type Form = z.infer<typeof schema>;

const STATUSES = ["all", "open", "assigned", "resolved", "cancelled"];

export default function ComplaintsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Complaint | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Complaint | null>(null);

  // Resolve modal state
  const [resolveFor, setResolveFor] = useState<Complaint | null>(null);
  const [resolvedById, setResolvedById] = useState("");
  const [serviceCharge, setServiceCharge] = useState(0);
  const [usedItems, setUsedItems] = useState<ProductLine[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", page, q, status],
    queryFn: () =>
      api.complaints({
        page,
        limit: 20,
        q: q || undefined,
        status: status === "all" ? undefined : status,
      }),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-opts-complaint"],
    queryFn: () => api.customers({ limit: 300 }),
    enabled: open,
  });
  const { data: employees } = useQuery({
    queryKey: ["employees-opts-complaint"],
    queryFn: () => api.employees({ limit: 300 }),
    enabled: !!resolveFor,
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts-complaint"],
    queryFn: () => api.products({ limit: 300 }),
    enabled: !!resolveFor,
  });
  const productOptions = useMemo(
    () => (products?.items ?? []).map(productOption),
    [products],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const customerId = watch("customerId") || "";
  const statusVal = watch("status") || "open";

  const openCreate = () => {
    setEditing(null);
    reset({
      customerId: "",
      customerName: "",
      phone: "",
      address: "",
      complaint: "",
      status: "open",
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };
  const openEdit = (c: Complaint) => {
    setEditing(c);
    reset({
      customerId: c.customerId || "",
      customerName: c.customerName,
      phone: c.phone || "",
      address: c.address || "",
      complaint: c.complaint,
      status: c.status,
      date: c.date?.slice(0, 10),
    });
    setOpen(true);
  };

  const pickCustomer = (id: string) => {
    setValue("customerId", id);
    const c = (customers?.items ?? []).find((x) => x.id === id);
    if (c) {
      setValue("customerName", c.name, { shouldValidate: true });
      setValue("phone", c.phone || c.whatsapp || "");
      setValue("address", c.address || "");
    }
  };

  const save = useMutation({
    mutationFn: (form: Form) =>
      editing
        ? api.updateComplaint(editing.id, form)
        : api.createComplaint(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      setOpen(false);
      toast.success(editing ? "Complaint updated" : "Complaint logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveComplaint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint removed");
    },
  });

  const openResolve = (c: Complaint) => {
    setResolveFor(c);
    setResolvedById(c.resolvedById || "");
    setServiceCharge(c.serviceCharge || 0);
    setUsedItems(
      (c.items ?? []).length
        ? c.items.map((i) => ({
            productId: i.productId || null,
            description: i.description,
            qty: i.qty,
            unitPrice: i.unitPrice,
          }))
        : [],
    );
  };

  const resolve = useMutation({
    mutationFn: () => {
      if (!resolveFor) throw new Error("No complaint");
      const items = usedItems
        .filter((l) => l.description.trim() && l.qty > 0)
        .map((l) => ({
          productId: l.productId || null,
          description: l.description.trim(),
          qty: l.qty,
          unitPrice: l.unitPrice,
        }));
      return api.updateComplaint(resolveFor.id, {
        status: "resolved",
        resolvedById: resolvedById || null,
        serviceCharge,
        items,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      setResolveFor(null);
      toast.success("Complaint resolved — invoice & stock updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: "number",
      header: "Ref",
      cell: (i) => (
        <span className="font-medium text-white">{i.getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: (i) => (
        <div>
          <div className="text-white">{i.getValue<string>()}</div>
          <div className="text-xs text-white/40">
            {i.row.original.phone || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "complaint",
      header: "Complaint",
      cell: (i) => (
        <span className="line-clamp-1 max-w-[240px] text-white/70">
          {i.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "resolvedByName",
      header: "Resolved by",
      cell: (i) => (
        <span className="text-white/70">{i.getValue<string>() || "—"}</span>
      ),
    },
    {
      accessorKey: "serviceCharge",
      header: "Charge",
      cell: (i) =>
        i.getValue<number>() ? (
          <span className="text-emerald-300">{pkr(i.getValue<number>())}</span>
        ) : (
          <span className="text-white/30">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (i) => <StatusBadge status={i.getValue<string>()} />,
    },
    {
      id: "actions",
      header: "",
      cell: (i) => {
        const c = i.row.original;
        return (
          <div className="flex justify-end gap-1">
            {c.status !== "resolved" && c.status !== "cancelled" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openResolve(c);
                }}
                title="Resolve"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(c);
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPendingDelete(c);
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const resolveTotal =
    serviceCharge +
    usedItems.reduce((s, l) => s + (l.qty || 0) * (l.unitPrice || 0), 0);

  return (
    <div>
      <PageHeader
        title="Complaints"
        subtitle="Log client complaints, dispatch a technician, and record the service charge and any parts used."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Complaint
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative mr-2 min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search ref, customer, phone or complaint…"
            className="pl-9"
          />
        </div>
        {STATUSES.map((f) => (
          <button
            key={f}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
              status === f
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        onRowClick={openEdit}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{
          title: "No complaints",
          body: "Log a client complaint to get started.",
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove complaint"
        message={`Remove complaint ${pendingDelete?.number}?`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          archive.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />

      {/* create / edit */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit complaint" : "New complaint"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>Existing customer (optional)</Label>
            <SearchableSelect
              value={customerId}
              onChange={pickCustomer}
              placeholder="Link a customer…"
              options={(customers?.items ?? []).map((c) => ({
                value: c.id,
                label: c.name,
                searchText: `${c.name} ${c.phone || ""}`,
              }))}
            />
          </div>
          <div>
            <Label>Customer name</Label>
            <Input {...register("customerName")} />
            {errors.customerName && (
              <p className="mt-1 text-xs text-red-400">
                {errors.customerName.message}
              </p>
            )}
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} placeholder="03xx…" />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input {...register("address")} placeholder="Site address" />
          </div>
          <div className="sm:col-span-2">
            <Label>Complaint</Label>
            <Textarea {...register("complaint")} rows={3} />
            {errors.complaint && (
              <p className="mt-1 text-xs text-red-400">
                {errors.complaint.message}
              </p>
            )}
          </div>
          <div>
            <Label>Status</Label>
            <SearchableSelect
              value={statusVal}
              onChange={(v) =>
                setValue("status", (v as Form["status"]) || "open")
              }
              options={STATUSES.filter((s) => s !== "all").map((s) => ({
                value: s,
                label: s,
              }))}
              allowClear={false}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* resolve */}
      <Modal
        open={!!resolveFor}
        onClose={() => setResolveFor(null)}
        title={`Resolve ${resolveFor?.number || ""}`}
        wide
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <Wrench className="h-4 w-4 text-cyan" />
              {resolveFor?.customerName}
            </div>
            <p className="mt-1 text-white/50">{resolveFor?.complaint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Resolved by (technician)</Label>
              <SearchableSelect
                value={resolvedById}
                onChange={setResolvedById}
                placeholder="Select employee…"
                options={(employees?.items ?? []).map((e) => ({
                  value: e.id,
                  label: e.name,
                  searchText: `${e.name} ${e.title || ""}`,
                }))}
              />
            </div>
            <div>
              <Label>Service charge received</Label>
              <Input
                type="number"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label>Products replaced / used</Label>
            <ProductLineItems
              value={usedItems}
              onChange={setUsedItems}
              productOptions={productOptions}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-2">
            <span className="text-sm text-white/60">
              Total billed to customer
            </span>
            <span className="text-lg font-semibold text-white">
              {pkr(resolveTotal)}
            </span>
          </div>
          <p className="text-[0.7rem] text-white/40">
            Resolving generates an approved invoice for the charge and parts,
            decrements stock for catalogue products, and posts to the ledger.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResolveFor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => resolve.mutate()}
              disabled={resolve.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              {resolve.isPending ? "Resolving…" : "Resolve & bill"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
