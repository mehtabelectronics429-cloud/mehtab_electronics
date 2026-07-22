"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import {
  Button,
  Input,
  Label,
  Badge,
  Select,
} from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { pkr } from "@/lib/admin/format";
import type { Installation, InstallationStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const FILTERS: (InstallationStatus | "all")[] = [
  "all",
  "pending",
  "assigned",
  "in_progress",
  "submitted",
  "approved",
  "completed",
  "rejected",
];

const schema = z.object({
  customerId: z.string().min(1, "Required"),
  type: z.string().min(2),
  date: z.string().min(1),
  amount: z.coerce.number().min(0).optional(),
  status: z
    .enum([
      "pending",
      "assigned",
      "in_progress",
      "submitted",
      "approved",
      "rejected",
      "completed",
    ])
    .optional(),
});
type Form = z.infer<typeof schema>;

type ItemRow = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};
const money = (n: number) =>
  n.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const customerQuickSchema = z.object({
  name: z.string().min(2, "Required"),
  phone: z.string().min(7, "Required"),
  whatsapp: z.string().min(7, "Required"),
  address: z.string().min(3, "Required"),
});
type CustomerQuickForm = z.infer<typeof customerQuickSchema>;

type MatRow = { materialId: string; qty: number };

function InstallationsInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canCreate = user && can(user.role, "installations.manage");
  const canAddCustomer = user && can(user.role, "customers.manage");
  const qc = useQueryClient();
  const [status, setStatus] = useState<InstallationStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [matRows, setMatRows] = useState<MatRow[]>([
    { materialId: "", qty: 1 },
  ]);
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { productId: "", name: "", unitPrice: 0, qty: 1 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["installations", page, status],
    queryFn: () => api.installations({ page, limit: 10, status }),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-opts"],
    queryFn: () => api.customers({ limit: 100 }),
    enabled: !!canCreate && open,
  });
  const { data: employees } = useQuery({
    queryKey: ["employees-opts"],
    queryFn: () => api.employees({ limit: 100 }),
    enabled: isAdmin && open,
  });
  const { data: materials } = useQuery({
    queryKey: ["materials-opts"],
    queryFn: () => api.materials({ limit: 100 }),
    enabled: !!canCreate && open,
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts"],
    queryFn: () => api.products({ limit: 200 }),
    enabled: !!canCreate && open,
  });

  const subtotal = itemRows.reduce((s, r) => s + (r.qty * r.unitPrice || 0), 0);
  const computedAmount = Math.max(0, subtotal - discount) + shipping;

  const setItem = (idx: number, patch: Partial<ItemRow>) =>
    setItemRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );

  const pickProduct = (idx: number, productId: string) => {
    if (!productId)
      return setItem(idx, { productId: "", name: "", unitPrice: 0 });
    const p = (products?.items ?? []).find((x) => x.id === productId);
    setItem(idx, {
      productId,
      name: p ? `${p.brand} ${p.model}`.trim() : "",
      unitPrice: p ? p.sellingPrice : 0,
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    reset: resetCustomer,
    formState: { isSubmitting: customerSubmitting },
  } = useForm<CustomerQuickForm>({
    resolver: zodResolver(customerQuickSchema),
  });

  const toggleEmployee = (id: string) => {
    setEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const createCustomer = useMutation({
    mutationFn: (form: CustomerQuickForm) =>
      api.createCustomer({
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
      }),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["customers-opts"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      setValue("customerId", created.id, { shouldValidate: true });
      setAddingCustomer(false);
      resetCustomer();
      toast.success("Customer added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: (form: Form) => {
      const materialsPayload = matRows
        .filter((r) => r.materialId && r.qty > 0)
        .map((r) => ({ materialId: r.materialId, qty: r.qty, used: r.qty }));
      const itemsPayload = itemRows
        .filter((r) => r.name.trim() && r.qty > 0)
        .map((r) => ({
          productId: r.productId || null,
          name: r.name.trim(),
          unitPrice: r.unitPrice,
          qty: r.qty,
        }));
      return api.createInstallation({
        customerId: form.customerId,
        employeeIds: isAdmin
          ? employeeIds
          : user?.employeeId
            ? [user.employeeId]
            : [],
        type: form.type,
        date: form.date,
        items: itemsPayload,
        discount,
        shipping,
        amount: computedAmount,
        status: form.status || "pending",
        materials: materialsPayload,
        createInvoice: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installations"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      setOpen(false);
      toast.success(
        "Installation created with team, materials, invoice & ledger",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateInstallation(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installations"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: ColumnDef<Installation>[] = [
    {
      accessorKey: "ref",
      header: "Ref",
      cell: (i) => (
        <span className="font-medium text-white">{i.getValue<string>()}</span>
      ),
    },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "type", header: "Type" },
    {
      accessorKey: "employee",
      header: "Team",
      cell: (i) => (
        <span className="text-xs text-white/70">
          {i.getValue<string>() || ""}
        </span>
      ),
    },
    {
      id: "materials",
      header: "Materials",
      cell: (i) => {
        const mats = i.row.original.materials || [];
        if (!mats.length) return <span className="text-white/30"></span>;
        return (
          <span className="text-xs text-white/60">
            {mats.map((m) => `${m.name || "Item"}×${m.qty}`).join(", ")}
          </span>
        );
      },
    },
    {
      id: "invoice",
      header: "Billing",
      cell: (i) =>
        i.row.original.invoiceNumber ? (
          <Badge className="border-cyan/30 bg-cyan/10 text-cyan">
            {i.row.original.invoiceNumber}
          </Badge>
        ) : (
          <span className="text-white/30"></span>
        ),
    },
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (i) => pkr(i.getValue<number>()),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (i) => <StatusBadge status={i.getValue<string>()} />,
    },
    {
      id: "act",
      header: "",
      cell: (i) => {
        const s = i.row.original.status;
        if (isAdmin && s === "submitted") {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateStatus.mutate({
                  id: i.row.original.id,
                  status: "approved",
                });
              }}
              className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
            >
              Approve
            </button>
          );
        }
        if (!isAdmin && (s === "assigned" || s === "in_progress")) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateStatus.mutate({
                  id: i.row.original.id,
                  status: s === "assigned" ? "in_progress" : "submitted",
                });
              }}
              className="rounded-lg border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-xs text-cyan"
            >
              {s === "assigned" ? "Start" : "Submit"}
            </button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Installations" : "My Installations"}
        subtitle="Jobs with multiple technicians and materials, linked to invoices and ledger."
        actions={
          canCreate ? (
            <Button
              onClick={() => {
                reset({
                  customerId: "",
                  type: "",
                  date: new Date().toISOString().slice(0, 10),
                  status: "pending",
                });
                setEmployeeIds([]);
                setMatRows([{ materialId: "", qty: 1 }]);
                setItemRows([
                  { productId: "", name: "", unitPrice: 0, qty: 1 },
                ]);
                setDiscount(0);
                setShipping(0);
                setAddingCustomer(false);
                resetCustomer();
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New Installation
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
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
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{ title: "No installations" }}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New installation"
        wide
      >
        <form
          onSubmit={handleSubmit((d) => create.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Label className="mb-0">Customer</Label>
              {canAddCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setAddingCustomer((v) => !v);
                    if (!addingCustomer) {
                      resetCustomer({
                        name: "",
                        phone: "",
                        whatsapp: "",
                        address: "",
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {addingCustomer ? "Cancel new customer" : "Add customer"}
                </button>
              )}
            </div>
            {addingCustomer ? (
              <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    {...registerCustomer("name")}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input {...registerCustomer("phone")} placeholder="03xx…" />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    {...registerCustomer("whatsapp")}
                    placeholder="03xx…"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    {...registerCustomer("address")}
                    placeholder="Site address"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={customerSubmitting || createCustomer.isPending}
                    onClick={handleCustomerSubmit((d) =>
                      createCustomer.mutate(d),
                    )}
                  >
                    Save customer
                  </Button>
                </div>
              </div>
            ) : (
              <Select {...register("customerId")}>
                <option value="">Select…</option>
                {(customers?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div>
            <Label>Type</Label>
            <Input {...register("type")} placeholder="Hybrid Solar 10kW" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>
          {/* products / items used in the installation */}
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Products / items</Label>
              <button
                type="button"
                onClick={() =>
                  setItemRows((r) => [
                    ...r,
                    { productId: "", name: "", unitPrice: 0, qty: 1 },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </button>
            </div>
            <p className="mb-2 text-xs text-white/40">
              Pick a product from the catalogue or type a custom name &amp;
              price it doesn&apos;t have to be in the list.
            </p>
            <div className="space-y-2">
              {itemRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 sm:grid-cols-[1.3fr_1.7fr_0.9fr_0.6fr_auto]"
                >
                  <Select
                    value={row.productId}
                    onChange={(e) => pickProduct(idx, e.target.value)}
                  >
                    <option value="">Custom / type below…</option>
                    {(products?.items ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} {p.model}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={row.name}
                    onChange={(e) => setItem(idx, { name: e.target.value })}
                    placeholder="Description"
                  />
                  <Input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) =>
                      setItem(idx, { unitPrice: Number(e.target.value) || 0 })
                    }
                    placeholder="Unit price"
                  />
                  <Input
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      setItem(idx, { qty: Number(e.target.value) || 0 })
                    }
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    disabled={itemRows.length <= 1}
                    onClick={() =>
                      setItemRows((rows) => rows.filter((_, i) => i !== idx))
                    }
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* discount / shipping / computed total */}
          <div>
            <Label>Discount</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Shipping / Handling</Label>
            <Input
              type="number"
              value={shipping}
              onChange={(e) => setShipping(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
            <span className="text-sm text-white/60">Invoice total (auto)</span>
            <span className="text-lg font-semibold text-white">
              Rs {money(computedAmount)}
            </span>
          </div>

          {isAdmin && (
            <div className="sm:col-span-2">
              <Label>Technicians (select multiple)</Label>
              <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
                {(employees?.items ?? []).map((e) => {
                  const on = employeeIds.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => toggleEmployee(e.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        on
                          ? "border-cyan/40 bg-cyan/15 text-cyan"
                          : "border-white/10 bg-white/5 text-white/55 hover:text-white",
                      )}
                    >
                      {e.name}
                    </button>
                  );
                })}
                {!employees?.items?.length && (
                  <span className="text-xs text-white/40">
                    No employees found
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label>Materials</Label>
              <button
                type="button"
                onClick={() =>
                  setMatRows((r) => [...r, { materialId: "", qty: 1 }])
                }
                className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add material
              </button>
            </div>
            <div className="space-y-2">
              {matRows.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select
                    value={row.materialId}
                    onChange={(e) =>
                      setMatRows((rows) =>
                        rows.map((r, i) =>
                          i === idx ? { ...r, materialId: e.target.value } : r,
                        ),
                      )
                    }
                    className="flex-1"
                  >
                    <option value="">Select material…</option>
                    {(materials?.items ?? []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    className="w-24"
                    value={row.qty}
                    onChange={(e) =>
                      setMatRows((rows) =>
                        rows.map((r, i) =>
                          i === idx
                            ? { ...r, qty: Number(e.target.value) || 0 }
                            : r,
                        ),
                      )
                    }
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    disabled={matRows.length <= 1}
                    onClick={() =>
                      setMatRows((rows) => rows.filter((_, i) => i !== idx))
                    }
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 text-xs text-white/40">
            Creates a pending invoice and ledger entry for the amount. Stock is
            issued for selected materials.
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || create.isPending || addingCustomer}
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function InstallationsPage() {
  return (
    <Suspense
      fallback={<div className="py-20 text-center text-white/40">Loading…</div>}
    >
      <InstallationsInner />
    </Suspense>
  );
}
