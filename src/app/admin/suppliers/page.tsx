"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive, Search } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Input, Label } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { Supplier } from "@/lib/admin/types";

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  balance: z.coerce.number().optional(),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Supplier | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, q],
    queryFn: () => api.suppliers({ page, limit: 20, q: q || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
      balance: 0,
      notes: "",
    });
    setOpen(true);
  };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    reset({
      name: s.name,
      company: s.company,
      phone: s.phone,
      email: s.email,
      address: s.address,
      balance: s.balance,
      notes: s.notes,
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) =>
      editing ? api.updateSupplier(editing.id, form) : api.createSupplier(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setOpen(false);
      toast.success(editing ? "Supplier updated" : "Supplier added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveSupplier(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier archived");
    },
  });

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Supplier",
      cell: (i) => (
        <div>
          <div className="font-medium text-white">{i.row.original.name}</div>
          {i.row.original.company && (
            <div className="text-xs text-white/40">
              {i.row.original.company}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (i) => i.getValue<string>() || "—",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (i) => i.getValue<string>() || "—",
    },
    {
      accessorKey: "balance",
      header: "Payable",
      cell: (i) => {
        const b = i.getValue<number>() || 0;
        return (
          <span className={b > 0 ? "text-amber-300" : "text-white/60"}>
            {pkr(b)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (i) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(i.row.original);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10"
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Vendors you buy stock from, and what you owe them."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        }
      />
      <div className="mb-4 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search suppliers…"
            className="pl-9"
          />
        </div>
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
          title: "No suppliers yet",
          body: q
            ? "Try a different keyword"
            : "Add a supplier to start managing purchases.",
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Archive supplier"
        message={`Archive ${pendingDelete?.name}? Their payable balance will remain in history.`}
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
        title={editing ? "Edit supplier" : "Add supplier"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
          </div>
          <div>
            <Label>Company</Label>
            <Input {...register("company")} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>
          <div>
            <Label>Opening payable (Rs)</Label>
            <Input type="number" {...register("balance")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Input {...register("notes")} />
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
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
