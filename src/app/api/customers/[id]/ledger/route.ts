import { Customer } from "@/lib/db/models/Customer";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import { Installation } from "@/lib/db/models/Installation";
import { Invoice } from "@/lib/db/models/Invoice";
import {
  requireUser,
  json,
  errorResponse,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";

type Ctx = { params: { id: string } };

/** Full customer ledger + related installs/invoices for the ledger drawer. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (!can(user.role, "ledger.view.all") && !can(user.role, "ledger.view.own") && !can(user.role, "customers.view") && !can(user.role, "customers.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds) && !ownIds.includes(params.id)) throw new ApiError(403, "Forbidden");

    const customer = await Customer.findOne({ _id: params.id, ...notDeleted }).lean();
    if (!customer) throw new ApiError(404, "Customer not found");

    const [ledger, installations, invoices] = await Promise.all([
      LedgerEntry.find({ customerId: params.id, ...notDeleted }).sort({ date: -1 }).lean(),
      Installation.find({ customerId: params.id, ...notDeleted })
        .populate([
          { path: "employeeId", select: "name" },
          { path: "employeeIds", select: "name", strictPopulate: false },
        ])
        .sort({ date: -1 })
        .lean(),
      Invoice.find({ customerId: params.id, ...notDeleted }).sort({ date: -1 }).lean(),
    ]);

    return json({
      customer: {
        id: String(customer._id),
        name: customer.name,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        address: customer.address,
        balance: customer.balance,
      },
      ledger: ledger.map((l) => ({
        id: String(l._id),
        type: l.type,
        amount: l.amount,
        status: l.status,
        date: l.date,
        note: l.note,
        installationId: l.installationId ? String(l.installationId) : null,
        invoiceId: l.invoiceId ? String(l.invoiceId) : null,
      })),
      installations: installations.map((i) => {
        const team = ((i.employeeIds as { name?: string }[]) || [])
          .map((e) => e?.name)
          .filter(Boolean);
        const lead =
          i.employeeId && typeof i.employeeId === "object" && "name" in i.employeeId
            ? (i.employeeId as { name: string }).name
            : "";
        return {
          id: String(i._id),
          ref: i.ref,
          type: i.type,
          status: i.status,
          amount: i.amount,
          date: i.date,
          employee: (team.length ? team : lead ? [lead] : []).join(", "),
        };
      }),
      invoices: invoices.map((v) => ({
        id: String(v._id),
        number: v.number,
        amount: v.amount,
        paid: v.paid,
        status: v.status,
        date: v.date,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
