"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Pencil, Archive, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Input, Label, Textarea } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { Customer } from "@/lib/admin/types";

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
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["customers"], queryFn: api.customers });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const openCreate = () => { setEditing(null); reset({ name: "", phone: "", whatsapp: "", address: "", mapUrl: "", notes: "" }); setOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); reset({ name: c.name, phone: c.phone, whatsapp: c.whatsapp, address: c.address, mapUrl: c.mapUrl ?? "", notes: c.notes ?? "" }); setOpen(true); };

  const save = useMutation({
    mutationFn: async (form: Form) => {
      if (editing) return api.updateCustomer(editing.id, form);
      return api.createCustomer(form);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setOpen(false); toast.success(editing ? "Customer updated" : "Customer created"); },
    onError: () => toast.error("Something went wrong"),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveCustomer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customer archived"); },
  });

  const rows = useMemo(() => (data ?? []).filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase())), [data, q]);

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: "name", header: "Customer", cell: (i) => <div><div className="font-medium text-white">{i.row.original.name}</div><div className="text-xs text-white/40">{i.row.original.address}</div></div> },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "installations", header: "Jobs", cell: (i) => <span className="text-white/60">{i.getValue<number>()}</span> },
    { accessorKey: "balance", header: "Balance", cell: (i) => <span className={i.getValue<number>() > 0 ? "text-amber-300" : "text-white/60"}>{pkr(i.getValue<number>())}</span> },
    {
      id: "actions", header: "", cell: (i) => (
        <div className="flex justify-end gap-1">
          {i.row.original.mapUrl && <a href={i.row.original.mapUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><MapPin className="h-4 w-4" /></a>}
          <button onClick={(e) => { e.stopPropagation(); openEdit(i.row.original); }} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); archive.mutate(i.row.original.id); }} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"><Archive className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage customer records, ledgers and installation history."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> New Customer</Button>} />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-9" />
        </div>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} onRowClick={openEdit}
        empty={{ title: "No customers yet", body: "Add your first customer to get started.", action: <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Customer</Button> }} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit customer" : "New customer"} wide>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name</Label><Input {...register("name")} placeholder="Full name" />{errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}</div>
          <div><Label>Phone</Label><Input {...register("phone")} placeholder="+92 …" />{errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}</div>
          <div><Label>WhatsApp</Label><Input {...register("whatsapp")} placeholder="+92 …" />{errors.whatsapp && <p className="mt-1 text-xs text-red-400">{errors.whatsapp.message}</p>}</div>
          <div><Label>Google Maps URL</Label><Input {...register("mapUrl")} placeholder="https://maps.google.com/…" />{errors.mapUrl && <p className="mt-1 text-xs text-red-400">{errors.mapUrl.message}</p>}</div>
          <div className="sm:col-span-2"><Label>Address</Label><Input {...register("address")} placeholder="Street, area, city" />{errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}</div>
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={3} {...register("notes")} placeholder="Internal notes…" /></div>
          <div className="sm:col-span-2 mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || save.isPending}>{save.isPending ? "Saving…" : editing ? "Save changes" : "Create customer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
