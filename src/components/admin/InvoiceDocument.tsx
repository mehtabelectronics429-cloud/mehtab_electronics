import Image from "next/image";
import { LETTERHEAD as L } from "@/lib/letterhead";
import { LOGO_MARK } from "@/lib/assets";
import { invoiceTotals } from "@/lib/invoice";
import type { Invoice } from "@/lib/admin/types";

const money = (n: number) =>
  n.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Print-ready invoice that mirrors the physical Mehtab invoice. It renders on a
 * white sheet with black text and brand-red accents regardless of the admin
 * theme, so it looks identical on screen and when printed / saved as PDF.
 */
export default function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const items = invoice.items ?? [];
  const t = invoiceTotals(invoice);
  const paid = invoice.paid ?? 0;
  const returns = invoice.returns ?? [];
  const returned = invoice.returnedAmount ?? 0;
  const netTotal = t.total - returned;
  const balance = Math.max(0, netTotal - paid);
  const red = L.red;

  const Row = ({
    label,
    value,
    bold,
  }: {
    label: string;
    value: string;
    bold?: boolean;
  }) => (
    <div
      className={`flex items-center justify-between gap-6 py-1 ${bold ? "font-bold" : ""}`}
    >
      <span className="text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="tabular-nums">{value}</span>
    </div>
  );

  return (
    <div
      id="invoice-sheet"
      className="mx-auto w-full max-w-3xl bg-white p-8 text-[13px] text-neutral-900 md:p-10"
    >
      {/* header */}
      <div className="flex items-start justify-between">
        <div />
        <div className="flex items-start gap-3 text-right">
          <div className="pt-1">
            <div className="text-[10px] font-semibold tracking-widest text-neutral-500">
              {L.since}
            </div>
            <div className="mt-8 text-[10px] italic text-neutral-400">
              {L.tagline}
            </div>
          </div>
          <span
            className="grid h-20 w-20 place-items-center overflow-hidden rounded-md"
            style={{ background: "#000000" }}
          >
            <Image
              src={LOGO_MARK}
              alt="Mehtab Electronics"
              width={210}
              height={178}
              className="h-[80%] w-[80%] object-contain"
            />
          </span>
        </div>
      </div>

      <h1
        className="-mt-6 font-display text-4xl font-bold uppercase"
        style={{ color: red }}
      >
        Invoice
      </h1>

      {/* company + meta */}
      <div className="mt-4 flex items-start justify-between gap-8">
        <div className="leading-relaxed">
          <div className="text-base font-bold">{L.name}</div>
          <div className="text-neutral-600">{L.address}</div>
          <div className="text-neutral-600">{L.postal}</div>
          <div className="text-neutral-600">{L.phones}</div>
          <div className="text-neutral-600">{L.ntn}</div>
          <a href={`mailto:${L.email}`} className="text-blue-600 underline">
            {L.email}
          </a>
        </div>
        <div className="w-52 shrink-0">
          <div className="border-b border-neutral-300 pb-1 text-[10px] uppercase tracking-widest text-neutral-500">
            Date
          </div>
          <div className="py-1 font-medium">{invoice.date}</div>
          <div className="mt-2 border-b border-neutral-300 pb-1 text-[10px] uppercase tracking-widest text-neutral-500">
            Invoice Number
          </div>
          <div className="py-1 font-medium">{invoice.number}</div>
        </div>
      </div>

      {/* invoice-to + prepared-by */}
      <div className="mt-6 flex items-start justify-between gap-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Invoice To
          </div>
          <div className="mt-1 font-medium">{invoice.customer || ""}</div>
          {invoice.customerAddress && (
            <div className="text-neutral-600">{invoice.customerAddress}</div>
          )}
          {invoice.customerPhone && (
            <div className="text-neutral-600">{invoice.customerPhone}</div>
          )}
        </div>
        <div className="w-52 shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Prepared By
          </div>
          <div className="mt-1 font-medium">{L.preparedBy.name}</div>
          <div className="text-neutral-600">{L.preparedBy.role}</div>
          <div className="text-neutral-600">{L.preparedBy.phone}</div>
        </div>
      </div>

      {/* items table */}
      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: red }} className="text-left text-white">
            <th className="px-2 py-2 font-semibold">DESCRIPTION</th>
            <th className="w-16 px-2 py-2 text-right font-semibold">QTY</th>
            <th className="w-28 px-2 py-2 text-right font-semibold">
              UNIT PRICE
            </th>
            <th className="w-32 px-2 py-2 text-right font-semibold">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-2 py-6 text-center text-neutral-400"
              >
                No line items
              </td>
            </tr>
          )}
          {items.map((it, i) => (
            <tr key={i} className="border-b border-neutral-200">
              <td className="px-2 py-1.5">{it.description}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{it.qty}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {money(it.unitPrice)}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {money(it.qty * it.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-72">
          <Row label="Subtotal" value={money(t.subtotal)} />
          <Row label="Discount" value={money(t.discount)} />
          <Row label="Subtotal Less Discount" value={money(t.lessDiscount)} />
          <Row label="Tax Rate" value={`${t.taxRate}`} />
          <Row label="Total Tax" value={money(t.tax)} />
          <Row label="Shipping / Handling" value={money(t.shipping)} />
          {returned > 0 && (
            <>
              <Row label="Returns / Refund" value={`(${money(returned)})`} />
              <Row label="Net Total" value={money(netTotal)} bold />
            </>
          )}
          {paid > 0 && <Row label="Paid" value={money(paid)} />}
          <div className="mt-1 flex items-center justify-between border-t-2 border-neutral-800 pt-2 text-base font-bold">
            <span>Balance Due</span>
            <span className="tabular-nums">Rs {money(balance)}</span>
          </div>
        </div>
      </div>

      {/* returns / credit notes */}
      {returns.length > 0 && (
        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Returns / Credit Notes
          </div>
          <table className="mt-2 w-full border-collapse text-[11px]">
            <tbody>
              {returns.map((r) => (
                <tr key={r.number} className="border-b border-neutral-200">
                  <td className="py-1.5 pr-2 font-medium">{r.number}</td>
                  <td className="py-1.5 pr-2 text-neutral-600">
                    {String(r.date).slice(0, 10)}
                  </td>
                  <td className="py-1.5 pr-2 text-neutral-600">
                    {r.items
                      .map((it) => `${it.qty} × ${it.description}`)
                      .join(", ")}
                    {r.reason ? ` — ${r.reason}` : ""}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    ({money(r.refund)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* disclaimer */}
      <div className="mt-10 text-center text-[10px] italic leading-relaxed text-neutral-500">
        {L.disclaimer.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-6 h-3 w-full" style={{ background: red }} />
    </div>
  );
}
