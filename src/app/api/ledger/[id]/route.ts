import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
import {
  requireUser,
  requireCap,
  json,
  errorResponse,
  softDeleteById,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { ledgerInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { queueWhatsAppEvent } from "@/lib/whatsapp/queue";

type Ctx = { params: { id: string } };

function mapLedger(item: Record<string, unknown>) {
  const customer = item.customerId as { _id?: unknown; name?: string; whatsapp?: string } | string | null;
  return {
    ...item,
    customerId:
      typeof customer === "object" && customer?._id ? String(customer._id) : customer ? String(customer) : null,
    customer: typeof customer === "object" && customer?.name ? customer.name : "",
    customerWhatsapp: typeof customer === "object" && customer?.whatsapp ? customer.whatsapp : "",
    date: item.date instanceof Date ? (item.date as Date).toISOString().slice(0, 10) : item.date,
  };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    await connectMongo();
    const doc = await LedgerEntry.findOne({ _id: params.id, ...notDeleted }).populate("customerId");
    if (!doc) throw new ApiError(404, "Ledger entry not found");
    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds) && !ownIds.includes(String(doc.customerId._id || doc.customerId))) {
      throw new ApiError(403, "Forbidden");
    }
    return json(mapLedger(serializeDoc(doc)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await connectMongo();
    const existing = await LedgerEntry.findOne({ _id: params.id, ...notDeleted });
    if (!existing) throw new ApiError(404, "Ledger entry not found");
    const body = ledgerInput.partial().parse(await req.json());
    if (body.status === "approved") await requireCap("ledger.approve");
    else await requireCap("ledger.manage");

    const wasApproved = existing.status === "approved";
    if (body.date) body.date = new Date(body.date as string) as unknown as string;
    Object.assign(existing, body);
    await existing.save();

    if (!wasApproved && existing.status === "approved") {
      await Customer.findByIdAndUpdate(existing.customerId, { $inc: { balance: existing.amount } });
    }

    const populated = await LedgerEntry.findById(existing._id).populate("customerId");
    return json(mapLedger(serializeDoc(populated!)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("ledger.manage");
    await connectMongo();
    await softDeleteById(LedgerEntry, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
