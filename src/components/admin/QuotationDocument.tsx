import Image from "next/image";
import { LETTERHEAD as L } from "@/lib/letterhead";
import { LOGO_MARK } from "@/lib/assets";
import { invoiceTotals } from "@/lib/invoice";

export type QuotationLine = {
  description: string;
  qty: number;
  unitPrice: number;
  kind?: "product" | "labour" | "material" | "other";
};

export type QuotationData = {
  number: string;
  date: string;
  validUntil?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  title?: string;
  notes?: string;
  items: QuotationLine[];
  discount?: number;
  taxRate?: number;
  shipping?: number;
};

const money = (n: number) =>
  n.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Print-ready installation quotation matching the Mehtab invoice letterhead.
 */
export default function QuotationDocument({ data }: { data: QuotationData }) {
  // Brand accent used for the heading, table header and bottom stripe.
  const accent = "#000000";
  const t = invoiceTotals({
    items: data.items,
    discount: data.discount,
    taxRate: data.taxRate,
    shipping: data.shipping,
  });

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
      id="quotation-sheet"
      className="mx-auto w-full max-w-3xl bg-white p-4 text-[12px] text-neutral-900 sm:p-8 sm:text-[13px] md:p-10"
    >
      <div className="flex items-start justify-between">
        <div />
        <div className="flex items-start gap-3 text-right">
          <div className="pt-1">
            <div className="text-[10px] font-semibold tracking-widest text-neutral-500">
              {L.since}
            </div>
            <div className="mt-4 text-[10px] italic text-neutral-400 sm:mt-8">
              {L.tagline}
            </div>
          </div>
          <span
            className="grid h-14 w-14 place-items-center overflow-hidden rounded-md sm:h-20 sm:w-20"
            style={{ background: "#000000" }}
          >
            <Image
              src={LOGO_MARK}
              alt="Mehtab Electronics"
              width={770}
              height={666}
              className="h-[90%] w-[90%] object-contain"
              unoptimized
            />
          </span>
        </div>
      </div>

      <h1
        className="mt-2 font-display text-3xl font-bold uppercase sm:-mt-6 sm:text-4xl"
        style={{ color: accent }}
      >
        Quotation
      </h1>
      {data.title ? (
        <p className="mt-1 text-sm text-neutral-600">{data.title}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 break-words leading-relaxed">
          <div className="text-base font-bold">{L.name}</div>
          <div className="text-neutral-600">{L.address}</div>
          <div className="text-neutral-600">{L.postal}</div>
          <div className="text-neutral-600">{L.phones}</div>
          <div className="text-neutral-600">{L.ntn}</div>
          <a href={`mailto:${L.email}`} className="text-blue-600 underline">
            {L.email}
          </a>
        </div>
        <div className="w-full shrink-0 sm:w-52">
          <div className="border-b border-neutral-300 pb-1 text-[10px] uppercase tracking-widest text-neutral-500">
            Date
          </div>
          <div className="py-1 font-medium">{data.date}</div>
          <div className="mt-2 border-b border-neutral-300 pb-1 text-[10px] uppercase tracking-widest text-neutral-500">
            Quote Number
          </div>
          <div className="py-1 font-medium">{data.number}</div>
          {data.validUntil ? (
            <>
              <div className="mt-2 border-b border-neutral-300 pb-1 text-[10px] uppercase tracking-widest text-neutral-500">
                Valid Until
              </div>
              <div className="py-1 font-medium">{data.validUntil}</div>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 break-words">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Quote To
          </div>
          <div className="mt-1 font-medium">{data.customerName || "—"}</div>
          {data.customerAddress && (
            <div className="text-neutral-600">{data.customerAddress}</div>
          )}
          {data.customerPhone && (
            <div className="text-neutral-600">{data.customerPhone}</div>
          )}
        </div>
        <div className="w-full shrink-0 sm:w-52">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Prepared By
          </div>
          <div className="mt-1 font-medium">{L.preparedBy.name}</div>
          <div className="text-neutral-600">{L.preparedBy.role}</div>
          <div className="text-neutral-600">{L.preparedBy.phone}</div>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: accent }} className="text-left text-white">
            <th className="w-6 px-2 py-2 font-semibold">#</th>
            <th className="px-2 py-2 font-semibold">DESCRIPTION</th>
            <th className="hidden w-20 px-2 py-2 font-semibold sm:table-cell">TYPE</th>
            <th className="hidden w-16 px-2 py-2 text-right font-semibold sm:table-cell">QTY</th>
            <th className="hidden w-28 px-2 py-2 text-right font-semibold sm:table-cell">
              UNIT PRICE
            </th>
            <th className="w-28 px-2 py-2 text-right font-semibold sm:w-32">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-2 py-6 text-center text-neutral-400"
              >
                No line items
              </td>
            </tr>
          )}
          {data.items.map((it, i) => (
            <tr key={i} className="border-b border-neutral-200 align-top">
              <td className="px-2 py-1.5 text-neutral-400">{i + 1}</td>
              <td className="px-2 py-1.5">
                {it.description}
                {/* phones: the hidden columns, folded under the item */}
                <div className="mt-0.5 text-[11px] tabular-nums text-neutral-500 sm:hidden">
                  {it.qty} × {money(it.unitPrice)}
                  <span className="capitalize"> · {it.kind || "other"}</span>
                </div>
              </td>
              <td className="hidden px-2 py-1.5 capitalize text-neutral-600 sm:table-cell">
                {it.kind || "other"}
              </td>
              <td className="hidden px-2 py-1.5 text-right tabular-nums sm:table-cell">{it.qty}</td>
              <td className="hidden px-2 py-1.5 text-right tabular-nums sm:table-cell">
                {money(it.unitPrice)}
              </td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right font-medium tabular-nums">
                {money(it.qty * it.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-full sm:w-72">
          <Row label="Subtotal" value={money(t.subtotal)} />
          <Row label="Discount" value={money(t.discount)} />
          <Row label="Subtotal Less Discount" value={money(t.lessDiscount)} />
          {(t.taxRate > 0 || t.tax > 0) && (
            <>
              <Row label="Tax Rate" value={`${t.taxRate}%`} />
              <Row label="Total Tax" value={money(t.tax)} />
            </>
          )}
          <Row label="Shipping / Handling" value={money(t.shipping)} />
          <div className="mt-1 flex items-center justify-between border-t-2 border-neutral-800 pt-2 text-base font-bold">
            <span>Quote Total</span>
            <span className="tabular-nums">Rs {money(t.total)}</span>
          </div>
        </div>
      </div>

      {data.notes ? (
        <div className="mt-6 rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-[12px] text-neutral-700">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Notes
          </div>
          {data.notes}
        </div>
      ) : null}

      <div className="mt-10 text-center text-[10px] italic leading-relaxed text-neutral-500">
        <div>
          This quotation is an estimate and is subject to site survey confirmation.
        </div>
        {L.disclaimer.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-6 h-3 w-full" style={{ background: accent }} />
    </div>
  );
}
