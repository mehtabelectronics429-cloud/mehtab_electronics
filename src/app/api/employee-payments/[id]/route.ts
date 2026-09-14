import { EmployeePayment } from "@/lib/db/models/EmployeePayment";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  softDeleteById,
  ApiError,
} from "@/lib/api/http";
import { employeePaymentInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireCap("payroll.manage");
    await connectMongo();
    const body = employeePaymentInput.partial().parse(await req.json());
    const update: Record<string, unknown> = { ...body };
    if (body.date) update.date = new Date(body.date);
    const doc = await EmployeePayment.findOneAndUpdate(
      { _id: params.id, ...notDeleted },
      update,
      { returnDocument: "after" },
    );
    if (!doc) throw new ApiError(404, "Payment not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireCap("payroll.manage");
    await connectMongo();
    await softDeleteById(EmployeePayment, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
