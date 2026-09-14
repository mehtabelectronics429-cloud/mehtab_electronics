import { Expense } from "@/lib/db/models/Expense";
import {
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
} from "@/lib/api/http";
import { expenseInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { logActivity } from "@/lib/db/logActivity";

export async function GET(req: Request) {
  try {
    await requireCap("expenses.view");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const filter: Record<string, unknown> = {};
    const category = url.searchParams.get("category");
    if (category && category !== "all") filter.category = category;
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ category: rx }, { paidTo: rx }, { note: rx }];
    }
    return json(await paginate(Expense, filter, p));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("expenses.manage");
    await connectMongo();
    const body = expenseInput.parse(await req.json());
    const doc = await Expense.create({
      ...body,
      date: new Date(body.date),
      employeeId: body.employeeId || null,
    });
    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "recorded an expense",
      target: `${body.category} · ${body.amount}`,
      kind: "payment",
    });
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
