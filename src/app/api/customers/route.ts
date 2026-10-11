import { Customer } from "@/lib/db/models/Customer";
import {
  requireUser,
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { customerInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { logActivity } from "@/lib/db/logActivity";
import { syncCustomerBalances } from "@/lib/ledger/server";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "customers.view") && !can(user.role, "customers.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const filter: Record<string, unknown> = {};
    if (p.q) filter.$text = { $search: p.q };

    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds)) filter._id = { $in: ownIds };

    const result = await paginate(Customer, filter, { ...p, populate: undefined });
    // Balances shown are always the ledger's figures.
    const balances = await syncCustomerBalances(
      result.items.map((c) => String(c.id)),
    );
    return json({
      ...result,
      items: result.items.map((c) => ({
        ...c,
        balance: balances.get(String(c.id)) ?? (c as { balance?: number }).balance ?? 0,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("customers.manage");
    await connectMongo();
    const body = customerInput.parse(await req.json());
    const doc = await Customer.create(body);
    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "added customer",
      target: doc.name,
      kind: "customer",
    });
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
