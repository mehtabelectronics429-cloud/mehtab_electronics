import { Installation } from "@/lib/db/models/Installation";
import { Customer } from "@/lib/db/models/Customer";
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
import { installationInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { isEmployeeOnInstallation } from "@/lib/api/scope";
import { queueWhatsAppEvent } from "@/lib/whatsapp/queue";

type Ctx = { params: { id: string } };

function mapPopulatedPerson(v: unknown): { id: string | null; name: string } {
  if (!v) return { id: null, name: "" };
  if (typeof v === "object" && v && "_id" in v) {
    const o = v as { _id: unknown; name?: string };
    return { id: String(o._id), name: o.name || "" };
  }
  return { id: String(v), name: "" };
}

function mapInstallation(item: Record<string, unknown>) {
  const customer = mapPopulatedPerson(item.customerId);
  const lead = mapPopulatedPerson(item.employeeId);
  const teamRaw = (item.employeeIds as unknown[]) || [];
  const team = teamRaw.map(mapPopulatedPerson).filter((t) => t.id);
  const invoice = item.invoiceId as { _id?: unknown; number?: string; status?: string } | string | null;
  const materials =
    (item.materials as {
      materialId?: { name?: string; unit?: string; _id?: unknown } | string;
      qty?: number;
      used?: number;
    }[]) || [];

  const employees = team.length > 0 ? team : lead.id ? [lead] : [];

  return {
    ...item,
    customerId: customer.id,
    employeeId: lead.id || employees[0]?.id || null,
    employeeIds: employees.map((e) => e.id!),
    invoiceId:
      typeof invoice === "object" && invoice?._id ? String(invoice._id) : invoice ? String(invoice) : null,
    customer: customer.name,
    employee: employees.map((e) => e.name).filter(Boolean).join(", "),
    employees: employees.map((e) => ({ id: e.id!, name: e.name })),
    invoiceNumber: typeof invoice === "object" && invoice?.number ? invoice.number : "",
    invoiceStatus: typeof invoice === "object" && invoice?.status ? invoice.status : "",
    materials: materials.map((m) => ({
      materialId:
        typeof m.materialId === "object" && m.materialId?._id
          ? String(m.materialId._id)
          : m.materialId
            ? String(m.materialId)
            : "",
      name: typeof m.materialId === "object" ? m.materialId.name || "" : "",
      unit: typeof m.materialId === "object" ? m.materialId.unit || "" : "",
      qty: m.qty || 0,
      used: m.used || 0,
    })),
    date: item.date instanceof Date ? (item.date as Date).toISOString().slice(0, 10) : item.date,
  };
}

async function assertAccess(id: string) {
  const user = await requireUser();
  const doc = await Installation.findOne({ _id: id, ...notDeleted }).populate(
    "customerId employeeId employeeIds invoiceId materials.materialId"
  );
  if (!doc) throw new ApiError(404, "Installation not found");
  if (!can(user.role, "installations.view.all")) {
    if (!user.employeeId || !isEmployeeOnInstallation(user.employeeId, doc)) {
      throw new ApiError(403, "Forbidden");
    }
  }
  return { user, doc };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectMongo();
    const { doc } = await assertAccess(params.id);
    return json(mapInstallation(serializeDoc(doc)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await connectMongo();
    const { user, doc } = await assertAccess(params.id);
    const body = installationInput.partial().parse(await req.json());

    const isOwnUpdate =
      can(user.role, "installations.manage") ||
      (can(user.role, "installations.view.own") &&
        user.employeeId &&
        isEmployeeOnInstallation(user.employeeId, doc));

    if (!isOwnUpdate) throw new ApiError(403, "Forbidden");

    if (body.status === "approved" || body.status === "rejected") {
      await requireCap("installations.approve");
    }

    if (body.date) body.date = new Date(body.date as string) as unknown as string;

    if (body.employeeIds || body.employeeId !== undefined) {
      const ids = [...(body.employeeIds || [])];
      if (body.employeeId && !ids.includes(body.employeeId)) ids.unshift(body.employeeId);
      const unique = [...new Set(ids.filter(Boolean))];
      doc.employeeIds = unique as unknown as typeof doc.employeeIds;
      doc.employeeId = (unique[0] || null) as unknown as typeof doc.employeeId;
      delete (body as { employeeIds?: unknown }).employeeIds;
      delete (body as { employeeId?: unknown }).employeeId;
    }

    if (body.materials) {
      doc.materials = body.materials.map((m) => ({
        materialId: m.materialId as unknown as typeof doc.materials[0]["materialId"],
        qty: m.qty,
        used: m.used ?? m.qty,
      }));
      delete (body as { materials?: unknown }).materials;
    }

    Object.assign(doc, body);
    await doc.save();

    if (body.status === "completed" || body.status === "approved") {
      const customer = await Customer.findById(doc.customerId);
      if (customer) {
        await queueWhatsAppEvent({
          event: body.status === "completed" ? "installation_completed" : "installation_approved",
          customerId: String(customer._id),
          toName: customer.name,
          toPhone: customer.whatsapp || customer.phone,
          ctx: {
            customerName: customer.name,
            ref: doc.ref,
            jobType: doc.type,
            amount: doc.amount,
          },
        });
      }
    }

    const populated = await Installation.findById(doc._id).populate(
      "customerId employeeId employeeIds invoiceId materials.materialId"
    );
    return json(mapInstallation(serializeDoc(populated!)));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("installations.manage");
    await connectMongo();
    await softDeleteById(Installation, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
