import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Model } from "mongoose";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { Profile } from "@/lib/db/models/Profile";
import { authOptions } from "@/lib/auth/options";
import type { Role, User } from "@/lib/admin/types";
import type { Capability } from "@/lib/admin/permissions";
import { can } from "@/lib/admin/permissions";

export type SessionUser = User & {
  employeeId: string | null;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(err: unknown) {
  if (err instanceof ApiError) return json({ error: err.message }, err.status);
  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ZodError") {
    const z = err as { errors?: { message: string }[]; message?: string };
    const msg = z.errors?.[0]?.message || z.message || "Validation failed";
    return json({ error: msg }, 400);
  }
  console.error(err);
  return json({ error: "Internal server error" }, 500);
}

/** Resolve authenticated user from NextAuth session → Mongo Profile. */
export async function requireUser(): Promise<SessionUser> {
  await connectMongo();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError(401, "Unauthorized");

  const profile = await Profile.findOne({ _id: session.user.id, ...notDeleted });
  if (!profile) throw new ApiError(401, "Unauthorized");

  // Keep employee link fresh.
  if (profile.role === "employee" && !profile.employeeId) {
    const { Employee } = await import("@/lib/db/models/Employee");
    const emp = await Employee.findOne({ email: profile.email, ...notDeleted });
    if (emp) {
      profile.employeeId = emp._id;
      await profile.save();
    }
  }

  return {
    id: String(profile._id),
    name: profile.name,
    email: profile.email,
    role: profile.role as Role,
    title: profile.title || undefined,
    avatar: profile.avatar || undefined,
    employeeId: profile.employeeId ? String(profile.employeeId) : null,
  };
}

export async function requireCap(cap: Capability): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, cap)) throw new ApiError(403, "Forbidden");
  return user;
}

export function parsePagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const q = (url.searchParams.get("q") || "").trim();
  const sort = url.searchParams.get("sort") || "-createdAt";
  return { page, limit, skip: (page - 1) * limit, q, sort };
}

export function serializeDoc<T extends { _id: unknown; toObject?: () => Record<string, unknown> }>(
  doc: T
): Record<string, unknown> {
  const o = typeof doc.toObject === "function" ? doc.toObject() : { ...(doc as object) };
  const { _id, __v, deletedAt, passwordHash, ...rest } = o as Record<string, unknown> & {
    _id: unknown;
    __v?: unknown;
    deletedAt?: unknown;
    passwordHash?: unknown;
  };
  return { id: String(_id), ...rest };
}

export async function softDeleteById(Model: Model<any>, id: string) {
  const doc = await Model.findOneAndUpdate(
    { _id: id, ...notDeleted },
    { deletedAt: new Date() },
    { returnDocument: 'after' }
  );
  if (!doc) throw new ApiError(404, "Not found");
  return doc;
}

export async function paginate(
  Model: Model<any>,
  filter: Record<string, unknown>,
  opts: { page: number; limit: number; skip: number; sort: string; populate?: string | string[] }
) {
  const query = Model.find({ ...filter, ...notDeleted })
    .sort(opts.sort)
    .skip(opts.skip)
    .limit(opts.limit);
  if (opts.populate) {
    const pops = Array.isArray(opts.populate) ? opts.populate : [opts.populate];
    pops.forEach((p) =>
      query.populate(typeof p === "string" ? { path: p, strictPopulate: false } : p)
    );
  }
  const [items, total] = await Promise.all([
    query.lean(),
    Model.countDocuments({ ...filter, ...notDeleted }),
  ]);
  return {
    items: (items as Record<string, unknown>[]).map((d) => {
      const { _id, __v, deletedAt, passwordHash, ...rest } = d;
      return { id: String(_id), ...rest };
    }),
    page: opts.page,
    limit: opts.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / opts.limit)),
  };
}
