import { Types } from "mongoose";
import { Installation } from "@/lib/db/models/Installation";
import { notDeleted } from "@/lib/db/soft-delete";
import type { SessionUser } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";

function asObjectId(id: string) {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
}

/** Customer IDs an employee has worked for (via installations). */
export async function customerIdsForEmployee(
  employeeId: string,
): Promise<Types.ObjectId[]> {
  const oid = asObjectId(employeeId);
  const ids = await Installation.distinct("customerId", {
    ...notDeleted,
    $or: [{ employeeId: oid }, { employeeIds: oid }],
  });
  return ids as Types.ObjectId[];
}

/**
 * Own-customer scope for list APIs.
 * `null` = unrestricted (admin / full customer view).
 * Always use `ownIds !== null`  never `if (ownIds)` (empty array is truthy and matches nothing).
 */
export async function ownCustomerIdList(
  user: SessionUser,
): Promise<string[] | null> {
  if (
    can(user.role, "ledger.view.all") ||
    can(user.role, "customers.view") ||
    can(user.role, "billing.view.all")
  ) {
    return null;
  }
  if (!user.employeeId) return [];
  const ids = await customerIdsForEmployee(user.employeeId);
  return ids.map(String);
}

export function isOwnScope(ownIds: string[] | null): ownIds is string[] {
  return ownIds !== null;
}

/** Mongo filter for ledger lists (employee sees own entries + customers they installed for). */
export async function ledgerScopeFilter(
  user: SessionUser,
): Promise<Record<string, unknown> | null> {
  if (can(user.role, "ledger.view.all") || can(user.role, "customers.view")) {
    return null;
  }
  if (!user.employeeId) return { _id: { $in: [] } };

  const customerIds = await customerIdsForEmployee(user.employeeId);
  return {
    $or: [
      { employeeId: asObjectId(user.employeeId) },
      { customerId: { $in: customerIds } },
    ],
  };
}

/** Mongo filter: installations assigned to this employee (lead or team). */
export function installationAssignedFilter(employeeId: string) {
  const oid = asObjectId(employeeId);
  return {
    $or: [{ employeeId: oid }, { employeeIds: oid }],
  };
}

export function isEmployeeOnInstallation(
  employeeId: string,
  doc: { employeeId?: unknown; employeeIds?: unknown[] },
) {
  const lead = String(
    (doc.employeeId as { _id?: unknown })?._id || doc.employeeId || "",
  );
  if (lead === employeeId) return true;
  const team = (doc.employeeIds || []).map((e) =>
    String((e as { _id?: unknown })?._id || e),
  );
  return team.includes(employeeId);
}
