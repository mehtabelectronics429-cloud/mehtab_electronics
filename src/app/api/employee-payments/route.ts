import { EmployeePayment } from "@/lib/db/models/EmployeePayment";
import { Employee } from "@/lib/db/models/Employee";
import {
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { employeePaymentInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { logActivity } from "@/lib/db/logActivity";

export async function GET(req: Request) {
  try {
    await requireCap("payroll.view");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const filter: Record<string, unknown> = {};
    const employeeId = url.searchParams.get("employeeId");
    const type = url.searchParams.get("type");
    if (employeeId) filter.employeeId = employeeId;
    if (type && type !== "all") filter.type = type;
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ employeeName: rx }, { note: rx }];
    }
    return json(await paginate(EmployeePayment, filter, p));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("payroll.manage");
    await connectMongo();
    const body = employeePaymentInput.parse(await req.json());
    const emp = await Employee.findOne({ _id: body.employeeId, ...notDeleted });
    if (!emp) throw new ApiError(400, "Invalid employee");
    const doc = await EmployeePayment.create({
      ...body,
      employeeName: emp.name,
      date: new Date(body.date),
    });
    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "recorded an employee payment",
      target: `${emp.name} · ${body.amount}`,
      kind: "payment",
    });
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
