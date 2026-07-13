import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
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
import { ledgerInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope, ledgerScopeFilter } from "@/lib/api/scope";

function mapLedger(item: Record<string, unknown>) {
  const customer = item.customerId as { _id?: unknown; name?: string; whatsapp?: string } | string | null;
  const installation = item.installationId as { _id?: unknown; ref?: string } | string | null;
  return {
    ...item,
    customerId:
      typeof customer === "object" && customer?._id ? String(customer._id) : customer ? String(customer) : null,
    customer: typeof customer === "object" && customer?.name ? customer.name : "",
    customerWhatsapp: typeof customer === "object" && customer?.whatsapp ? customer.whatsapp : "",
    installationId:
      typeof installation === "object" && installation?._id
        ? String(installation._id)
        : installation
          ? String(installation)
          : null,
    installationRef: typeof installation === "object" && installation?.ref ? installation.ref : "",
    date: item.date instanceof Date ? (item.date as Date).toISOString().slice(0, 10) : item.date,
  };
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "ledger.view.all") && !can(user.role, "ledger.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const status = url.searchParams.get("status");
    const customerId = url.searchParams.get("customerId");

    const parts: Record<string, unknown>[] = [];
    if (status && status !== "all") parts.push({ status });
    if (customerId) {
      const ownIds = await ownCustomerIdList(user);
      if (isOwnScope(ownIds) && !ownIds.includes(customerId)) {
        return json({ items: [], page: 1, limit: p.limit, total: 0, totalPages: 1 });
      }
      parts.push({ customerId });
    }
    const scope = await ledgerScopeFilter(user);
    if (scope) parts.push(scope);

    const filter: Record<string, unknown> =
      parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : { $and: parts };

    const result = await paginate(LedgerEntry, filter, {
      ...p,
      populate: ["customerId", "installationId"],
    });
    return json({ ...result, items: result.items.map(mapLedger) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("ledger.manage");
    await connectMongo();
    const body = ledgerInput.parse(await req.json());

    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds) && !ownIds.includes(body.customerId)) throw new ApiError(403, "Forbidden");

    const customer = await Customer.findOne({ _id: body.customerId, ...notDeleted });
    if (!customer) throw new ApiError(400, "Invalid customer");

    const doc = await LedgerEntry.create({
      ...body,
      date: new Date(body.date),
      employeeId: body.employeeId || user.employeeId || null,
      installationId: body.installationId || null,
      status: body.status || "pending",
    });
    if (doc.status === "approved") {
      await Customer.findByIdAndUpdate(customer._id, { $inc: { balance: doc.amount } });
    }
    const populated = await LedgerEntry.findById(doc._id).populate([
      { path: "customerId", strictPopulate: false },
      { path: "installationId", strictPopulate: false },
    ]);
    return json(mapLedger(serializeDoc(populated!)), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
