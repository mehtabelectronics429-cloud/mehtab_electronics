"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Star, Pencil, Archive, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge, Input, Label } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import type { Employee } from "@/lib/admin/types";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  title: z.string().min(2),
  active: z.boolean().optional(),
  password: z.string().optional(),
}).superRefine((v, ctx) => {
  // password required on create is handled by checking editing in submit
  if (v.password && v.password.length > 0 && v.password.length < 6) {
    ctx.addIssue({ code: "custom", message: "Min 6 characters", path: ["password"] });
  }
});
type Form = z.infer<typeof schema>;

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", page],
    queryFn: () => api.employees({ page, limit: 20 }),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", email: "", phone: "", title: "", active: true, password: "" });
    setOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    reset({ name: e.name, email: e.email, phone: e.phone, title: e.title, active: e.active, password: "" });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) => {
      if (!editing && (!form.password || form.password.length < 6)) {
        throw new Error("Password is required (min 6 characters)");
      }
      const payload = { ...form, password: form.password || undefined };
      return editing ? api.updateEmployee(editing.id, payload) : api.createEmployee(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      toast.success(editing ? "Employee updated" : "Employee created with login");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee archived (login disabled)");
    },
  });

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: (i) => (
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-electric to-cyan text-xs font-bold text-white">
            {i.row.original.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </span>
          <div>
            <div className="font-medium text-white">{i.row.original.name}</div>
            <div className="text-xs text-white/40">{i.row.original.title}</div>
          </div>
        </div>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "assigned", header: "Assigned" },
    { accessorKey: "completed", header: "Completed" },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: (i) => (
        <span className="inline-flex items-center gap-1 text-white/80">
          <Star className="h-3.5 w-3.5 fill-solar text-solar" />
          {i.getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: (i) =>
        i.getValue<boolean>() ? (
          <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">Active</Badge>
        ) : (
          <Badge className="text-white/50">Inactive</Badge>
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
            title="Edit / set password"
          >
            <KeyRound className="h-4 w-4" />
          </button>
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
        title="Employees"
        subtitle="Create team members and dashboard login credentials."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Employee
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
        empty={{ title: "No employees" }}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit employee" : "Add employee"} wide>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
          </div>
          <div>
            <Label>Email (login)</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div>
            <Label>Title</Label>
            <Input {...register("title")} />
          </div>
          <div className="sm:col-span-2">
            <Label>{editing ? "New password (leave blank to keep)" : "Dashboard password"}</Label>
            <Input type="password" {...register("password")} placeholder="Min 6 characters" />
            <p className="mt-1 text-xs text-white/35">
              {editing
                ? "Set a password to create or reset their dashboard login."
                : "Required for first-time dashboard access."}
            </p>
          </div>
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
