import { Invoice } from "@/lib/db/models/Invoice";
import { requireCap, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { csvResponse } from "@/lib/api/csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireCap("billing.view.all");
    await connectMongo();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = (url.searchParams.get("q") || "").trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (status && status !== "all") filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ number: rx }, { notes: rx }];
    }
    const items = await Invoice.find(filter)
      .populate("customerId", "name")
      .sort({ date: -1 })
      .lean();
    return csvResponse(
      "invoices-export.csv",
      [
        "Number",
        "Customer",
        "Date",
        "Amount",
        "Cost",
        "Paid",
        "Balance",
        "Status",
        "Notes",
      ],
      items.map((i) => {
        const customer =
          typeof i.customerId === "object" &&
          i.customerId &&
          "name" in i.customerId
            ? String((i.customerId as { name?: string }).name || "")
            : "";
        const amount = i.amount ?? 0;
        const paid = i.paid ?? 0;
        return [
          i.number,
          customer,
          i.date instanceof Date
            ? i.date.toISOString().slice(0, 10)
            : String(i.date || ""),
          amount,
          i.cost ?? 0,
          paid,
          Math.max(0, amount - paid),
          i.status,
          i.notes || "",
        ];
      }),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
