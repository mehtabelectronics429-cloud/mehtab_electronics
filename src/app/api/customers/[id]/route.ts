import { Customer } from "@/lib/db/models/Customer";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
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
import { customerInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { queueWhatsAppEvent } from "@/lib/whatsapp/queue";

type Ctx = { params: { id: string } };

async function assertCustomerAccess(user: Awaited<ReturnType<typeof requireUser>>, id: string) {
  const ownIds = await ownCustomerIdList(user);
  if (isOwnScope(ownIds) && !ownIds.includes(id)) throw new ApiError(403, "Forbidden");
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (!can(user.role, "customers.view") && !can(user.role, "customers.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    await assertCustomerAccess(user, params.id);
    const doc = await Customer.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Customer not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("customers.manage");
    await connectMongo();
    const body = customerInput.partial().parse(await req.json());
    const doc = await Customer.findOneAndUpdate({ _id: params.id, ...notDeleted }, body, { returnDocument: 'after' });
    if (!doc) throw new ApiError(404, "Customer not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("customers.manage");
    await connectMongo();
    await softDeleteById(Customer, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
