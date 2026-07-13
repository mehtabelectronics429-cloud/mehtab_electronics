"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge, Input, Label } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import type { Material } from "@/lib/admin/types";

const avail = (m: Material) => m.opening - m.used - m.damaged;

const schema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  opening: z.coerce.number().min(0),
  issued: z.coerce.number().min(0),
  used: z.coerce.number().min(0),
  returned: z.coerce.number().min(0),
  damaged: z.coerce.number().min(0),
  reorder: z.coerce.number().min(0),
});
type Form = z.infer<typeof schema>;

export default function MaterialsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["materials", page],
    queryFn: () => api.materials({ page, limit: 20 }),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", unit: "pcs", opening: 0, issued: 0, used: 0, returned: 0, damaged: 0, reorder: 0 });
    setOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditing(m);
    reset(m);
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) => (editing ? api.updateMaterial(editing.id, form) : api.createMaterial(form)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      setOpen(false);
      toast.success(editing ? "Material updated" : "Material created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveMaterial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material archived");
    },
  });

  const columns: ColumnDef<Material>[] = [
    {
      accessorKey: "name",
      header: "Material",
      cell: (i) => (
        <span className="font-medium text-white">
          {i.row.original.name} <span className="text-white/40">({i.row.original.unit})</span>
        </span>
      ),
    },
    { accessorKey: "opening", header: "Opening" },
    { accessorKey: "issued", header: "Issued" },
    { accessorKey: "used", header: "Used" },
    { accessorKey: "returned", header: "Returned" },
    { accessorKey: "damaged", header: "Damaged" },
    {
      id: "available",
      header: "Available",
      cell: (i) => <span className="font-medium text-white">{avail(i.row.original)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (i) =>
        avail(i.row.original) <= i.row.original.reorder ? (
          <Badge className="border-red-400/30 bg-red-400/10 text-red-300">Low stock</Badge>
        ) : (
          <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">OK</Badge>
        ),
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
              archive.mutate(i.row.original.id);
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
        title="Materials"
        subtitle="Track installation materials — issued, used, returned and damaged."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Material
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        onRowClick={openEdit}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{ title: "No materials tracked" }}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit material" : "Add material"} wide>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
          </div>
          <div>
            <Label>Unit</Label>
            <Input {...register("unit")} />
          </div>
          {(["opening", "issued", "used", "returned", "damaged", "reorder"] as const).map((f) => (
            <div key={f}>
              <Label className="capitalize">{f}</Label>
              <Input type="number" {...register(f)} />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
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
