import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Customer } from "@/lib/db/models/Customer";
import { requireUser, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Download ledger as CSV (optionally filtered by customerId). */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (
      !can(user.role, "ledger.view.all") &&
      !can(user.role, "ledger.view.own")
    ) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");
    const filter: Record<string, unknown> = { ...notDeleted };
    if (customerId) filter.customerId = customerId;

    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds)) {
      if (customerId && !ownIds.includes(customerId))
        throw new ApiError(403, "Forbidden");
      filter.customerId = customerId || { $in: ownIds };
    }

    const [entries, customer] = await Promise.all([
      LedgerEntry.find(filter)
        .populate("customerId", "name")
        .sort({ date: 1 })
        .lean(),
      customerId ? Customer.findById(customerId).lean() : null,
    ]);

    const rows = [
      ["Date", "Customer", "Type", "Amount", "Status", "Note"].join(","),
      ...entries.map((e) => {
        const name =
          e.customerId &&
          typeof e.customerId === "object" &&
          "name" in e.customerId
            ? String((e.customerId as { name: string }).name)
            : "";
        const date = new Date(e.date).toISOString().slice(0, 10);
        const note = String(e.note || "").replace(/"/g, '""');
        return [
          date,
          `"${name}"`,
          e.type,
          e.amount,
          e.status,
          `"${note}"`,
        ].join(",");
      }),
    ];

    const filename = customer
      ? `ledger-${customer.name.replace(/\s+/g, "-").toLowerCase()}.csv`
      : "ledger-export.csv";

    return new Response(rows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
