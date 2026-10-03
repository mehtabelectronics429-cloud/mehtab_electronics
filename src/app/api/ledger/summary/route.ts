import { requireUser, json, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { loadLedgerSummary } from "@/lib/ledger/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** All-customer ledger summary: opening, period debit / credit and closing balance. */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (
      !can(user.role, "ledger.view.all") &&
      !can(user.role, "ledger.view.own")
    ) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const from = url.searchParams.get("from") || null;
    const to = url.searchParams.get("to") || null;
    const ownIds = await ownCustomerIdList(user);
    return json(
      await loadLedgerSummary(from, to, isOwnScope(ownIds) ? ownIds : null),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
