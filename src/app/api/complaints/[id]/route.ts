import { Complaint } from "@/lib/db/models/Complaint";
import { Customer } from "@/lib/db/models/Customer";
import { Employee } from "@/lib/db/models/Employee";
import { Product } from "@/lib/db/models/Product";
import { Invoice } from "@/lib/db/models/Invoice";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  softDeleteById,
  ApiError,
} from "@/lib/api/http";
import { complaintUpdateInput } from "@/lib/api/schemas";
import { invoiceTotals } from "@/lib/invoice";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { logActivity } from "@/lib/db/logActivity";

type Params = { params: { id: string } };

async function nextInvoiceNumber() {
  const count = await Invoice.countDocuments({});
  return `INV-${2000 + count + 1}`;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireCap("complaints.view");
    await connectMongo();
    const doc = await Complaint.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Complaint not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireCap("complaints.manage");
    await connectMongo();
    const body = complaintUpdateInput.parse(await req.json());

    const complaint = await Complaint.findOne({ _id: params.id, ...notDeleted });
    if (!complaint) throw new ApiError(404, "Complaint not found");

    const wasResolved = complaint.status === "resolved";

    // Apply editable fields.
    if (body.customerId !== undefined)
      complaint.customerId = (body.customerId as never) || null;
    if (body.customerName !== undefined) complaint.customerName = body.customerName;
    if (body.phone !== undefined) complaint.phone = body.phone;
    if (body.address !== undefined) complaint.address = body.address;
    if (body.complaint !== undefined) complaint.complaint = body.complaint;
    if (body.status !== undefined) complaint.status = body.status;
    if (body.resolvedById !== undefined)
      complaint.resolvedById = (body.resolvedById as never) || null;
    if (body.serviceCharge !== undefined)
      complaint.serviceCharge = body.serviceCharge;
    if (body.notes !== undefined) complaint.notes = body.notes;
    if (body.date !== undefined) complaint.date = new Date(body.date);
    if (body.items !== undefined) {
      complaint.items = body.items.map((i) => ({
        productId: (i.productId as never) || null,
        description: i.description,
        qty: i.qty,
        unitPrice: i.unitPrice,
      }));
    }

    // Resolve → generate the finance/stock invoice exactly once.
    const nowResolving =
      complaint.status === "resolved" && !wasResolved && !complaint.invoiceId;

    if (nowResolving) {
      // Resolver name for the record.
      if (complaint.resolvedById) {
        const emp = await Employee.findOne({
          _id: complaint.resolvedById,
          ...notDeleted,
        });
        complaint.resolvedByName = emp?.name || complaint.resolvedByName;
      }
      complaint.resolvedAt = new Date();

      const usedItems = (complaint.items || []).filter(
        (i) => i.description && i.qty > 0,
      );
      const hasCharge = (complaint.serviceCharge || 0) > 0 || usedItems.length > 0;

      if (hasCharge) {
        // Ensure a customer to attach the invoice + ledger to.
        let customerId = complaint.customerId;
        if (!customerId) {
          const created = await Customer.create({
            name: complaint.customerName || "Complaint customer",
            phone: complaint.phone || "-",
            whatsapp: complaint.phone || "-",
            address: complaint.address || "On-site service",
          });
          customerId = created._id;
          complaint.customerId = created._id;
        }

        // Build invoice line items: service charge + products used.
        const invoiceItems: {
          description: string;
          qty: number;
          unitPrice: number;
          productId: string | null;
        }[] = [];
        if ((complaint.serviceCharge || 0) > 0) {
          invoiceItems.push({
            description: `Service charge — ${complaint.number}`,
            qty: 1,
            unitPrice: complaint.serviceCharge,
            productId: null,
          });
        }

        // Validate stock and compute cost of goods from catalogue prices.
        let cost = 0;
        const stockChecks: { productId: string; name: string; qty: number }[] = [];
        for (const it of usedItems) {
          invoiceItems.push({
            description: it.description,
            qty: it.qty,
            unitPrice: it.unitPrice,
            productId: it.productId ? String(it.productId) : null,
          });
          if (!it.productId) continue;
          const p = await Product.findOne({ _id: it.productId, ...notDeleted });
          if (!p) throw new ApiError(400, `Product not found for "${it.description}"`);
          if (p.stock < it.qty) {
            throw new ApiError(
              400,
              `Insufficient stock for ${p.brand} ${p.model}`.trim() +
                ` (available: ${p.stock}, requested: ${it.qty})`,
            );
          }
          stockChecks.push({
            productId: String(p._id),
            name: `${p.brand} ${p.model}`.trim(),
            qty: it.qty,
          });
          cost += (p.purchasePrice || 0) * it.qty;
        }

        const totals = invoiceTotals({ items: invoiceItems });
        const date = new Date();

        const invoice = await Invoice.create({
          number: await nextInvoiceNumber(),
          customerId,
          employeeId: complaint.resolvedById || user.employeeId || null,
          source: "complaint",
          items: invoiceItems,
          amount: totals.total,
          cost,
          paid: totals.total,
          status: "approved",
          date,
          notes: `Complaint ${complaint.number}: ${complaint.complaint}`,
        });

        // Decrement stock atomically.
        for (const it of stockChecks) {
          const updated = await Product.findOneAndUpdate(
            { _id: it.productId, stock: { $gte: it.qty }, ...notDeleted },
            { $inc: { stock: -it.qty } },
            { returnDocument: "after" },
          );
          if (!updated) {
            throw new ApiError(400, `Insufficient stock for ${it.name}`);
          }
        }

        // Ledger: the charge, then the payment received on site.
        await LedgerEntry.create({
          customerId,
          employeeId: complaint.resolvedById || user.employeeId || null,
          invoiceId: invoice._id,
          type: "invoice",
          amount: totals.total,
          status: "approved",
          date,
          note: `Complaint service ${complaint.number} (${invoice.number})`,
        });
        await LedgerEntry.create({
          customerId,
          employeeId: complaint.resolvedById || user.employeeId || null,
          invoiceId: invoice._id,
          type: "payment",
          amount: totals.total,
          status: "approved",
          date,
          note: `Payment for complaint ${complaint.number}`,
        });

        complaint.invoiceId = invoice._id;
      }
    }

    await complaint.save();

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: nowResolving ? "resolved a complaint" : "updated a complaint",
      target: `${complaint.number} · ${complaint.customerName}`,
      kind: "customer",
    });

    return json(serializeDoc(complaint));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireCap("complaints.manage");
    await connectMongo();
    await softDeleteById(Complaint, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
