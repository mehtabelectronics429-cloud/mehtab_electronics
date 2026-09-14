import { Expense } from "@/lib/db/models/Expense";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  softDeleteById,
  ApiError,
} from "@/lib/api/http";
import { expenseInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireCap("expenses.manage");
    await connectMongo();
    const body = expenseInput.partial().parse(await req.json());
    const update: Record<string, unknown> = { ...body };
    if (body.date) update.date = new Date(body.date);
    if (body.employeeId !== undefined) update.employeeId = body.employeeId || null;
    const doc = await Expense.findOneAndUpdate(
      { _id: params.id, ...notDeleted },
      update,
      { returnDocument: "after" },
    );
    if (!doc) throw new ApiError(404, "Expense not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireCap("expenses.manage");
    await connectMongo();
    await softDeleteById(Expense, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
