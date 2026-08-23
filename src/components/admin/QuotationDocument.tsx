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
      className="mx-auto w-full max-w-3xl bg-white p-8 text-[13px] text-neutral-900 md:p-10"
    >
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
              unoptimized
            />
          </span>
        </div>
      </div>

      <h1
        className="-mt-6 font-display text-4xl font-bold uppercase"
        style={{ color: accent }}
      >
        Quotation
      </h1>
      {data.title ? (
        <p className="mt-1 text-sm text-neutral-600">{data.title}</p>
      ) : null}

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

      <div className="mt-6 flex items-start justify-between gap-8">
        <div>
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
        <div className="w-52 shrink-0">
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
            <th className="px-2 py-2 font-semibold">DESCRIPTION</th>
            <th className="w-20 px-2 py-2 font-semibold">TYPE</th>
            <th className="w-16 px-2 py-2 text-right font-semibold">QTY</th>
            <th className="w-28 px-2 py-2 text-right font-semibold">
              UNIT PRICE
            </th>
            <th className="w-32 px-2 py-2 text-right font-semibold">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-2 py-6 text-center text-neutral-400"
              >
                No line items
              </td>
            </tr>
          )}
          {data.items.map((it, i) => (
            <tr key={i} className="border-b border-neutral-200">
              <td className="px-2 py-1.5">{it.description}</td>
              <td className="px-2 py-1.5 capitalize text-neutral-600">
                {it.kind || "other"}
              </td>
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

      <div className="mt-4 flex justify-end">
        <div className="w-72">
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
