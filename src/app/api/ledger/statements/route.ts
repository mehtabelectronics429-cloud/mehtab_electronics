import { Customer } from "@/lib/db/models/Customer";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { requireUser, json, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { loadCustomerStatement } from "@/lib/ledger/server";
import type { LedgerStatement } from "@/lib/ledger/statement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Full statements (entries + goods lines) for every customer with ledger
 * activity — feeds the detailed all-customer ledger PDF. Optional
 * `customerIds` (comma-separated) narrows it down.
 */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "ledger.view.all") && !can(user.role, "ledger.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const from = url.searchParams.get("from") || null;
    const to = url.searchParams.get("to") || null;
    const wanted = (url.searchParams.get("customerIds") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let ids = (await LedgerEntry.distinct("customerId", notDeleted)).map(String);
    if (wanted.length) ids = ids.filter((id) => wanted.includes(id));
    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds)) ids = ids.filter((id) => ownIds.includes(id));

    const customers = await Customer.find({ _id: { $in: ids }, ...notDeleted })
      .sort({ name: 1 })
      .lean();

    const statements: LedgerStatement[] = [];
    for (const c of customers) {
      const st = await loadCustomerStatement(c, from, to);
      if (st.rows.length || Math.abs(st.totals.opening) >= 0.005) statements.push(st);
    }
    return json({ from, to, statements });
  } catch (err) {
    return errorResponse(err);
  }
}
