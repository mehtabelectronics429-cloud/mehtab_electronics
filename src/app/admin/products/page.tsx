"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive, Search } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge, Input, Label } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { Product } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  category: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  sku: z.string().min(1),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  warranty: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  features: z.string().optional(),
  highlights: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function ProductsPage() {
  const qc = useQueryClient();
  const [cat, setCat] = useState("all");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, cat, q],
    queryFn: () =>
      api.products({
        page,
        limit: 20,
        category: cat === "all" ? undefined : cat,
        q: q || undefined,
      }),
  });

  // Managed categories (for the create/edit dropdown + filter)
  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories({ limit: 100 }),
  });
  const categoryOptions = useMemo(
    () => (categoryData?.items ?? []).map((c) => c.name),
    [categoryData],
  );

  const cats = useMemo(() => {
    const fromItems = Array.from(
      new Set((data?.items ?? []).map((p) => p.category)),
    );
    return ["all", ...fromItems];
  }, [data]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      category: "",
      brand: "",
      model: "",
      sku: "",
      purchasePrice: 0,
      sellingPrice: 0,
      warranty: "",
      stock: 0,
      description: "",
      image: "",
      features: "",
      highlights: "",
    });
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    reset(p);
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) =>
      editing ? api.updateProduct(editing.id, form) : api.createProduct(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      toast.success(editing ? "Product updated" : "Product created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product archived");
    },
  });

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "model",
      header: "Product",
      cell: (i) => (
        <div>
          <div className="font-medium text-white">
            {i.row.original.brand} {i.row.original.model}
          </div>
          <div className="text-xs text-white/40">{i.row.original.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (i) => <Badge>{i.getValue<string>()}</Badge>,
    },
    {
      accessorKey: "purchasePrice",
      header: "Cost",
      cell: (i) => pkr(i.getValue<number>()),
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: (i) => (
        <span className="text-white">{pkr(i.getValue<number>())}</span>
      ),
    },
    { accessorKey: "warranty", header: "Warranty" },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: (i) => (
        <span
          className={
            i.getValue<number>() <= 5 ? "text-red-300" : "text-white/70"
          }
        >
          {i.getValue<number>()}
        </span>
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
        title="Products"
        subtitle="Catalogue of solar, security and networking equipment."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Product
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
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
              cat === c
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white",
            )}
          >
            {c}
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
          title: "No products",
          body: q
            ? "Try a different keyword"
            : "Add your first product to start the catalogue.",
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Archive product"
        message={`Archive ${pendingDelete?.brand} ${pendingDelete?.model}? This will remove it from the active list.`}
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
        title={editing ? "Edit product" : "Add product"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label>Category</Label>
            <select
              {...register("category")}
              className="admin-select w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
            >
              <option value="">Select a category…</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {categoryOptions.length === 0 && (
              <p className="mt-1 text-xs text-amber-300">
                No categories yet add them under Categories first.
              </p>
            )}
            {errors.category && (
              <p className="mt-1 text-xs text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>
          <div>
            <Label>Brand</Label>
            <Input {...register("brand")} />
          </div>
          <div>
            <Label>Model</Label>
            <Input {...register("model")} />
          </div>
          <div>
            <Label>SKU</Label>
            <Input {...register("sku")} />
          </div>
          <div>
            <Label>Purchase price</Label>
            <Input type="number" {...register("purchasePrice")} />
          </div>
          <div>
            <Label>Selling price</Label>
            <Input type="number" {...register("sellingPrice")} />
          </div>
          <div>
            <Label>Warranty</Label>
            <Input {...register("warranty")} />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" {...register("stock")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Product image URL</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                {...register("image")}
                placeholder="https://res.cloudinary.com/..."
              />
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
                      const res = await fetch("/api/products/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data.error || "Upload failed");
                      reset({ ...getValues(), image: data.url });
                      toast.success("Image uploaded");
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Upload failed",
                      );
                    }
                  };
                }}
              >
                Upload
              </Button>
            </div>
            {errors.image && (
              <p className="mt-1 text-xs text-red-400">
                {errors.image.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Short description</Label>
            <Input
              {...register("description")}
              placeholder="Short marketing summary"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Features</Label>
            <Input
              {...register("features")}
              placeholder="Comma separated features"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Highlights</Label>
            <Input
              {...register("highlights")}
              placeholder="Additional bullets for detail page"
            />
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
    </div>
  );
}
