import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
import { requireUser, json, errorResponse, ApiError, serializeDoc } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { dispatchWhatsAppEvent } from "@/lib/whatsapp/queue";

type Ctx = { params: { id: string } };

/** Send this ledger entry / customer statement via WhatsApp (direct or Business API). */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (!can(user.role, "whatsapp.send") && !can(user.role, "whatsapp.view")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const entry = await LedgerEntry.findOne({ _id: params.id, ...notDeleted });
    if (!entry) throw new ApiError(404, "Ledger entry not found");

    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds) && !ownIds.includes(String(entry.customerId))) throw new ApiError(403, "Forbidden");

    const customer = await Customer.findOne({ _id: entry.customerId, ...notDeleted });
    if (!customer) throw new ApiError(404, "Customer not found");

    const body = (await req.json().catch(() => ({}))) as {
      event?: "ledger_statement" | "payment_reminder" | "receipt";
      channel?: "direct" | "business";
    };
    const event = body.event || (entry.type === "payment" ? "receipt" : "ledger_statement");

    const result = await dispatchWhatsAppEvent({
      event,
      channel: body.channel,
      customerId: String(customer._id),
      toName: customer.name,
      toPhone: customer.whatsapp || customer.phone,
      ctx: {
        customerName: customer.name,
        balance: customer.balance,
        amount: Math.abs(entry.amount),
        extra: `Latest entry: ${entry.type} PKR ${entry.amount.toLocaleString("en-PK")} (${entry.status}) on ${new Date(entry.date).toISOString().slice(0, 10)}.`,
      },
    });

    return json(
      {
        ok: true,
        channel: result.channel,
        requestedChannel: result.requestedChannel,
        businessApiReady: result.businessApiReady,
        jobId: result.jobId,
        waUrl: result.waUrl,
        template: result.message.template,
        message: serializeDoc(result.message),
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
}
