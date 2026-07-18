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
import { Button, Input, Label } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import type { Category } from "@/lib/admin/types";

const schema = z.object({
  name: z.string().min(1),
  image: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  order: z.coerce.number().int().optional(),
});
type Form = z.infer<typeof schema>;

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", page],
    queryFn: () => api.categories({ page, limit: 50 }),
  });

  const { register, handleSubmit, reset, getValues } = useForm<Form>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", image: "", description: "", order: 0 });
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    reset({ name: c.name, image: c.image ?? "", description: c.description ?? "", order: c.order ?? 0 });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) => (editing ? api.updateCategory(editing.id, form) : api.createCategory(form)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
      toast.success(editing ? "Category updated" : "Category created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category archived");
    },
  });

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: (i) => (
        <div className="flex items-center gap-3">
          {i.row.original.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={i.row.original.image} alt="" className="h-9 w-9 rounded-md object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-md bg-white/10" />
          )}
          <div>
            <div className="font-medium text-white">{i.row.original.name}</div>
            <div className="text-xs text-white/40">/{i.row.original.slug}</div>
          </div>
        </div>
      ),
    },
    { accessorKey: "description", header: "Description", cell: (i) => <span className="text-white/60">{i.getValue<string>() || "—"}</span> },
    { accessorKey: "order", header: "Order", cell: (i) => <span className="text-white/70">{i.getValue<number>() ?? 0}</span> },
    {
      id: "actions",
      header: "",
      cell: (i) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(i.row.original); }}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); archive.mutate(i.row.original.id); }}
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
        title="Categories"
        subtitle="Product categories shown on the public site (solar panels, inverters, batteries, cameras…)."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Category
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
        empty={{ title: "No categories yet", subtitle: "Add your first category to organise products." }}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "Add category"}>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="grid gap-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} placeholder="e.g. Solar Panels" />
          </div>
          <div>
            <Label>Description</Label>
            <Input {...register("description")} placeholder="Short line shown under the category" />
          </div>
          <div>
            <Label>Display order</Label>
            <Input type="number" {...register("order")} />
          </div>
          <div>
            <Label>Category image</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input {...register("image")} placeholder="https://… or /images/…" />
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.click();
                  fileInput.onchange = async () => {
                    const file = fileInput.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.set("file", file);
                    try {
                      const res = await fetch("/api/products/upload", { method: "POST", body: formData });
                      const d = await res.json();
                      if (!res.ok) throw new Error(d.error || "Upload failed");
                      reset({ ...getValues(), image: d.url });
                      toast.success("Image uploaded");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Upload failed");
                    }
                  };
                }}
              >
                Upload
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
