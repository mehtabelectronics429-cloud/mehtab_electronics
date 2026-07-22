import { notFound } from "next/navigation";
import type { Metadata } from "next";
import mongoose from "mongoose";
import InvoiceDocument from "@/components/admin/InvoiceDocument";
import InvoicePrintButton from "@/components/admin/InvoicePrintButton";
import ShareInvoiceButton from "@/components/admin/ShareInvoiceButton";
import { connectMongo } from "@/lib/db/mongodb";
import { Invoice } from "@/lib/db/models/Invoice";
// Import Customer explicitly so the model is registered on cold serverless
// lambdas (we query it directly below instead of using populate()).
import { Customer } from "@/lib/db/models/Customer";
import { notDeleted } from "@/lib/db/soft-delete";
import type { Invoice as InvoiceT } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice  Mehtab Electronics",
  robots: { index: false, follow: false },
};

async function getInvoice(id: string): Promise<InvoiceT | null> {
  // A malformed id is simply "not found"  never a crash.
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  // NOTE: no try/catch here on purpose  a real DB/connection failure should
  // surface (500 + logs) rather than be masked as a misleading 404.
  await connectMongo();
  const doc = await Invoice.findOne({ _id: id, ...notDeleted }).lean();
  if (!doc) return null;

  let c: {
    name?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  } | null = null;
  if (doc.customerId) {
    c = (await Customer.findById(doc.customerId).lean()) as typeof c;
  }

  return {
    id: String(doc._id),
    number: doc.number,
    date:
      doc.date instanceof Date
        ? doc.date.toISOString().slice(0, 10)
        : String(doc.date),
    items: (doc.items ?? []).map((i) => ({
      description: i.description,
      qty: i.qty,
      unitPrice: i.unitPrice,
    })),
    discount: doc.discount ?? 0,
    taxRate: doc.taxRate ?? 0,
    shipping: doc.shipping ?? 0,
    amount: doc.amount ?? 0,
    paid: doc.paid ?? 0,
    status: doc.status,
    customer: c?.name ?? "",
    customerPhone: c?.phone ?? "",
    customerAddress: c?.address ?? "",
  };
}

export default async function PublicInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await getInvoice(params.id);
  if (!invoice) notFound();

  return (
    <main className="min-h-screen px-4 pt-28 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          <ShareInvoiceButton
            filename={`Invoice-${invoice.number}.pdf`}
            label="Share PDF"
          />
          <InvoicePrintButton />
        </div>
        <div className="rounded-xl bg-neutral-200/50 p-3 md:p-4">
          <InvoiceDocument invoice={invoice} />
        </div>
      </div>
    </main>
  );
}
