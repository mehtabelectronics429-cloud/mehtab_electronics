"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive, Search, Video } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import {
  Button,
  Badge,
  Input,
  Label,
  Textarea,
} from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import type { InstallationVideo } from "@/lib/admin/types";

const schema = z.object({
  title: z.string().min(2),
  videoUrl: z.string().url("Enter a valid video URL"),
  thumbnail: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  location: z.string().optional(),
  spec: z.string().optional(),
  summary: z.string().optional(),
  order: z.coerce.number().optional(),
  active: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

export default function InstallationVideosPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InstallationVideo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InstallationVideo | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["installation-videos", page, q],
    queryFn: () => api.installationVideos({ page, limit: 20, q: q || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const active = watch("active");

  const openCreate = () => {
    setEditing(null);
    reset({
      title: "",
      videoUrl: "",
      thumbnail: "",
      category: "Solar",
      location: "",
      spec: "",
      summary: "",
      order: 0,
      active: true,
    });
    setOpen(true);
  };
  const openEdit = (v: InstallationVideo) => {
    setEditing(v);
    reset({
      title: v.title,
      videoUrl: v.videoUrl,
      thumbnail: v.thumbnail || "",
      category: v.category || "Solar",
      location: v.location || "",
      spec: v.spec || "",
      summary: v.summary || "",
      order: v.order || 0,
      active: v.active,
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) =>
      editing
        ? api.updateInstallationVideo(editing.id, form)
        : api.createInstallationVideo(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installation-videos"] });
      setOpen(false);
      toast.success(editing ? "Video updated" : "Video added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveInstallationVideo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installation-videos"] });
      toast.success("Video removed");
    },
  });

  const columns: ColumnDef<InstallationVideo>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: (i) => (
        <div>
          <div className="font-medium text-white">{i.getValue<string>()}</div>
          <div className="max-w-[240px] truncate text-xs text-white/40">
            {i.row.original.videoUrl}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (i) => <Badge>{i.getValue<string>()}</Badge>,
    },
    { accessorKey: "location", header: "Location" },
    {
      accessorKey: "active",
      header: "Status",
      cell: (i) =>
        i.getValue<boolean>() ? (
          <span className="text-emerald-300">Live</span>
        ) : (
          <span className="text-white/40">Hidden</span>
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
        title="Installation Videos"
        subtitle="Manage the videos shown on the public Installations page."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Video
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search videos…"
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
          title: "No videos",
          body: "Add installation videos to showcase on the public site.",
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove video"
        message={`Remove "${pendingDelete?.title}" from the site?`}
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
        title={editing ? "Edit video" : "Add video"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <Input {...register("title")} placeholder="10kW Hybrid Solar — Lahore" />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Video URL (YouTube / Vimeo / MP4)</Label>
            <Input
              {...register("videoUrl")}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            {errors.videoUrl && (
              <p className="mt-1 text-xs text-red-400">
                {errors.videoUrl.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Thumbnail image URL</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                {...register("thumbnail")}
                placeholder="Optional — auto-derived for YouTube if blank"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
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
                      const d = await res.json();
                      if (!res.ok) throw new Error(d.error || "Upload failed");
                      reset({ ...getValues(), thumbnail: d.url });
                      toast.success("Thumbnail uploaded");
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
          </div>
          <div>
            <Label>Category</Label>
            <Input {...register("category")} placeholder="Solar / CCTV" />
          </div>
          <div>
            <Label>Location</Label>
            <Input {...register("location")} placeholder="City / area" />
          </div>
          <div>
            <Label>Spec</Label>
            <Input {...register("spec")} placeholder="e.g. 10kW · 16 panels" />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input type="number" {...register("order")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Summary</Label>
            <Textarea {...register("summary")} rows={3} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="video-active"
              type="checkbox"
              checked={!!active}
              onChange={(e) => setValue("active", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent"
            />
            <Label className="mb-0" htmlFor="video-active">
              Show on public site
            </Label>
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
