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
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("customers.manage");
    await connectMongo();
    const body = customerInput.parse(await req.json());
    const doc = await Customer.create(body);
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
