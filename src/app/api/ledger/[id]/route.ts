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
import { logActivity } from "@/lib/db/logActivity";
import { Product } from "@/lib/db/models/Product";
import { balanceEffect } from "@/lib/ledger/statement";
import { ledgerEntryItems, syncCustomerBalance, syncCustomerBalances } from "@/lib/ledger/server";

type Ctx = { params: { id: string } };

function mapLedger(item: Record<string, unknown>) {
  const customer = item.customerId as { _id?: unknown; name?: string; whatsapp?: string } | string | null;
  return {
    ...item,
    customerId:
      typeof customer === "object" && customer?._id ? String(customer._id) : customer ? String(customer) : null,
    customer: typeof customer === "object" && customer?.name ? customer.name : "",
    customerWhatsapp: typeof customer === "object" && customer?.whatsapp ? customer.whatsapp : "",
    items: ledgerEntryItems(item as Parameters<typeof ledgerEntryItems>[0]),
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
    // Goods lines (and their stock movement) are fixed once recorded.
    const { items: _items, ...body } = ledgerInput.partial().parse(await req.json());
    void _items;
    const user =
      body.status === "approved"
        ? await requireCap("ledger.approve")
        : await requireCap("ledger.manage");

    const wasApproved = existing.status === "approved";
    const previousCustomerId = existing.customerId;
    if (body.date) body.date = new Date(body.date as string) as unknown as string;
    Object.assign(existing, body);
    if (body.type !== undefined || body.amount !== undefined) {
      existing.amount = balanceEffect(existing.type, existing.amount);
    }
    await existing.save();

    await syncCustomerBalances([previousCustomerId, existing.customerId]);
    if (!wasApproved && existing.status === "approved") {
      await logActivity({
        actor: user.name,
        actorId: user.id,
        action: "approved ledger entry",
        target: existing.note || `${existing.type} · ${existing.amount}`,
        kind: "approval",
      });
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
    const existing = await LedgerEntry.findOne({ _id: params.id, ...notDeleted });
    if (!existing) throw new ApiError(404, "Ledger entry not found");
    await softDeleteById(LedgerEntry, params.id);
    // Goods that left stock with this entry go back on the shelf.
    if (existing.stockDeducted) {
      for (const it of existing.items ?? []) {
        if (it.productId) await Product.updateOne({ _id: it.productId }, { $inc: { stock: it.qty } });
      }
    }
    await syncCustomerBalance(existing.customerId);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
