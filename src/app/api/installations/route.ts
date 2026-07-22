import { Installation } from "@/lib/db/models/Installation";
import { Customer } from "@/lib/db/models/Customer";
import { Material } from "@/lib/db/models/Material";
import { Invoice } from "@/lib/db/models/Invoice";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import {
  requireCap,
  requireUser,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { installationInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { installationAssignedFilter } from "@/lib/api/scope";
import { logActivity } from "@/lib/db/logActivity";

async function nextRef() {
  const count = await Installation.countDocuments({});
  return `INST-${1000 + count + 1}`;
}

async function nextInvoiceNumber() {
  const count = await Invoice.countDocuments({});
  return `INV-${2000 + count + 1}`;
}

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

  const employees =
    team.length > 0
      ? team
      : lead.id
        ? [lead]
        : [];

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
    date: item.date instanceof Date ? item.date.toISOString().slice(0, 10) : item.date,
  };
}

function resolveEmployeeIds(
  body: { employeeIds?: string[]; employeeId?: string | null },
  fallback?: string | null
) {
  const ids = [...(body.employeeIds || [])];
  if (body.employeeId && !ids.includes(body.employeeId)) ids.unshift(body.employeeId);
  if (!ids.length && fallback) ids.push(fallback);
  return [...new Set(ids.filter(Boolean))];
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "installations.view.all") && !can(user.role, "installations.view.own")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const status = url.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (!can(user.role, "installations.view.all")) {
      if (!user.employeeId) return json({ items: [], page: 1, limit: p.limit, total: 0, totalPages: 1 });
      Object.assign(filter, installationAssignedFilter(user.employeeId));
    }
    if (p.q) filter.ref = new RegExp(p.q, "i");

    const result = await paginate(Installation, filter, {
      ...p,
      populate: ["customerId", "employeeId", "employeeIds", "invoiceId", "materials.materialId"],
    });
    return json({ ...result, items: result.items.map(mapInstallation) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("installations.manage");
    await connectMongo();
    const body = installationInput.parse(await req.json());
    const customer = await Customer.findOne({ _id: body.customerId, ...notDeleted });
    if (!customer) throw new ApiError(400, "Invalid customer");

    const materials = body.materials || [];
    for (const line of materials) {
      const mat = await Material.findOne({ _id: line.materialId, ...notDeleted });
      if (!mat) throw new ApiError(400, "Invalid material");
      await Material.findByIdAndUpdate(mat._id, {
        $inc: { issued: line.qty, used: line.used ?? line.qty },
      });
    }

    const employeeIds = resolveEmployeeIds(
      body,
      user.role === "employee" ? user.employeeId : null
    );
    if (user.role === "employee" && !employeeIds.length) {
      throw new ApiError(
        400,
        "Your login is not linked to an employee profile. Ask admin to set your employee email to match this account."
      );
    }
    const leadId = employeeIds[0] || null;

    const items = body.items || [];
    // Total from line items (+ discount/tax/shipping) unless an explicit amount is given.
    const totals = invoiceTotals({
      items: items.map((i) => ({ qty: i.qty, unitPrice: i.unitPrice })),
      discount: body.discount,
      taxRate: body.taxRate,
      shipping: body.shipping,
    });
    const amount = body.amount ?? totals.total;

    const doc = await Installation.create({
      ref: body.ref || (await nextRef()),
      customerId: body.customerId,
      employeeId: leadId,
      employeeIds,
      type: body.type,
      status: body.status || (employeeIds.length ? "assigned" : "pending"),
      date: new Date(body.date),
      amount,
      notes: body.notes || "",
      items: items.map((i) => ({
        productId: i.productId || null,
        name: i.name,
        unitPrice: i.unitPrice,
        qty: i.qty,
      })),
      materials: materials.map((m) => ({
        materialId: m.materialId,
        qty: m.qty,
        used: m.used ?? m.qty,
      })),
    });

    await Customer.findByIdAndUpdate(customer._id, { $inc: { installations: 1 } });

    if (body.createInvoice !== false && amount > 0) {
      const inv = await Invoice.create({
        number: await nextInvoiceNumber(),
        customerId: customer._id,
        employeeId: leadId,
        installationId: doc._id,
        items: items.map((i) => ({ description: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        discount: body.discount ?? 0,
        taxRate: body.taxRate ?? 0,
        shipping: body.shipping ?? 0,
        amount,
        paid: 0,
        status: "pending",
        date: new Date(body.date),
      });
      doc.invoiceId = inv._id;
      await doc.save();

      await LedgerEntry.create({
        customerId: customer._id,
        employeeId: leadId,
        invoiceId: inv._id,
        installationId: doc._id,
        type: "invoice",
        amount,
        status: "pending",
        date: new Date(body.date),
        note: `Invoice ${inv.number} for ${doc.ref}`,
      });
    }

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "created installation",
      target: `${doc.ref} · ${customer.name}`,
      kind: "install",
    });

    const populated = await Installation.findById(doc._id).populate(
      "customerId employeeId employeeIds invoiceId materials.materialId"
    );
    return json(mapInstallation(serializeDoc(populated!)), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
