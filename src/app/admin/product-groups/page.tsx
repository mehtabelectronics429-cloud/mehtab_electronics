"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Archive, Trash2, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
} from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { ProductGroup } from "@/lib/admin/types";

type Line = { productId: string; qty: number };

export default function ProductGroupsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductGroup | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductGroup | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [lines, setLines] = useState<Line[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["product-groups"],
    queryFn: () => api.productGroups({ limit: 100 }),
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts-group"],
    queryFn: () => api.products({ limit: 100 }),
  });

  const productOptions = useMemo(
    () =>
      (products?.items ?? []).map((p) => ({
        value: p.id,
        label: `${p.brand} ${p.model}`.trim(),
        searchText: `${p.brand} ${p.model} ${p.sku}`,
      })),
    [products],
  );
  const priceOf = (id: string) =>
    (products?.items ?? []).find((p) => p.id === id)?.sellingPrice ?? 0;

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setActive(true);
    setLines([]);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };
  const openEdit = (g: ProductGroup) => {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? "");
    setActive(g.active);
    setLines(
      g.items
        .filter((i) => i.productId)
        .map((i) => ({ productId: i.productId as string, qty: i.qty })),
    );
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: () => {
      const items = lines.filter((l) => l.productId && l.qty > 0);
      const body = { name, description, active, items };
      return editing
        ? api.updateProductGroup(editing.id, body)
        : api.createProductGroup(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-groups"] });
      qc.invalidateQueries({ queryKey: ["pos-product-groups"] });
      toast.success(editing ? "Group updated" : "Group created");
      setOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.archiveProductGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-groups"] });
      qc.invalidateQueries({ queryKey: ["pos-product-groups"] });
      toast.success("Group archived");
      setPendingDelete(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = data?.items ?? [];
  const estTotal = lines.reduce((s, l) => s + priceOf(l.productId) * l.qty, 0);
  const canSave =
    name.trim().length > 0 && lines.some((l) => l.productId && l.qty > 0);

  return (
    <div>
      <PageHeader
        title="Product Groups"
        subtitle="Bundle products together for one-click adding at the POS counter."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New group
          </Button>
        }
      />

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-white/50">Loading…</Card>
      ) : groups.length === 0 ? (
        <Card className="p-10 text-center">
          <Layers className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-3 text-sm text-white/50">
            No product groups yet. Create your first bundle.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const total = g.items.reduce(
              (s, i) => s + (i.sellingPrice ?? 0) * i.qty,
              0,
            );
            return (
              <Card key={g.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{g.name}</span>
                      {!g.active && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-white/50">
                          Inactive
                        </span>
                      )}
                    </div>
                    {g.description && (
                      <p className="mt-0.5 text-xs text-white/45">
                        {g.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(g)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(g)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex-1 space-y-1.5 border-t border-white/10 pt-3">
                  {g.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/70">
                        {i.name || "Deleted product"}
                      </span>
                      <span className="text-white/45">×{i.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                  <span className="text-white/45">
                    {g.items.length} item{g.items.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold text-cyan">{pkr(total)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* create / edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit group" : "New product group"}
        wide
      >
        <div className="space-y-4">
          <div>
            <Label>Group name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 5kW Solar Starter Kit"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this bundle is for…"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Products in this group</Label>
              <button
                type="button"
                onClick={() =>
                  setLines((l) => [...l, { productId: "", qty: 1 }])
                }
                className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add product
              </button>
            </div>
            <div className="space-y-2">
              {lines.length === 0 && (
                <p className="rounded-lg border border-dashed border-white/10 py-4 text-center text-xs text-white/40">
                  No products yet — add at least one.
                </p>
              )}
              {lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <SearchableSelect
                      value={line.productId}
                      onChange={(v) =>
                        setLines((ls) =>
                          ls.map((l, i) =>
                            i === idx ? { ...l, productId: v } : l,
                          ),
                        )
                      }
                      placeholder="Select product…"
                      options={productOptions}
                      allowClear={false}
                    />
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) =>
                      setLines((ls) =>
                        ls.map((l, i) =>
                          i === idx
                            ? { ...l, qty: Number(e.target.value) || 0 }
                            : l,
                        ),
                      )
                    }
                    className="h-9 w-16 rounded-lg border border-slate-300 bg-transparent px-2 text-right text-sm text-slate-900 dark:border-white/10 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLines((ls) => ls.filter((_, i) => i !== idx))
                    }
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/70">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            Active (show in POS)
          </label>

          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-sm text-white/50">
              Est. bundle total{" "}
              <span className="font-semibold text-cyan">{pkr(estTotal)}</span>
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => save.mutate()}
                disabled={!canSave || save.isPending}
              >
                {save.isPending ? "Saving…" : editing ? "Save changes" : "Create group"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        title="Archive product group?"
        message={`"${pendingDelete?.name}" will be removed from the POS. This does not affect any products or past sales.`}
        confirmLabel="Archive"
      />
    </div>
  );
}
