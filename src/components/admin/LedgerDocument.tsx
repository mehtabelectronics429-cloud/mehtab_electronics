import Image from "next/image";
import { LETTERHEAD as L } from "@/lib/letterhead";
import { LOGO_MARK } from "@/lib/assets";
import type { LedgerReportData } from "@/lib/admin/ledger-pdf";

const money = (n: number) =>
  n.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Print-ready ledger statement matching the Mehtab invoice letterhead
 * (logo, brand red, company block). Used for on-screen preview and PDF capture.
 */
export default function LedgerDocument({ data }: { data: LedgerReportData }) {
  const red = L.red;
  const range =
    data.from || data.to
      ? `${data.from || "…"} → ${data.to || "…"}`
      : "All dates";

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
      id="ledger-sheet"
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
            style={{ background: red }}
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
        style={{ color: red }}
      >
        Ledger Statement
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
            Period
          </div>
          <div className="py-1 font-medium">{range}</div>
          <div className="mt-2 border-b border-neutral-300 pb-1 text-[10px] uppercase tracking-widest text-neutral-500">
            Generated
          </div>
          <div className="py-1 font-medium">
            {new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>

      {/* statement-to + prepared-by */}
      <div className="mt-6 flex items-start justify-between gap-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Statement For
          </div>
          <div className="mt-1 font-medium">{data.customer.name}</div>
          {data.customer.address && (
            <div className="text-neutral-600">{data.customer.address}</div>
          )}
          {data.customer.phone && (
            <div className="text-neutral-600">{data.customer.phone}</div>
          )}
          {data.customer.whatsapp &&
            data.customer.whatsapp !== data.customer.phone && (
              <div className="text-neutral-600">
                WhatsApp: {data.customer.whatsapp}
              </div>
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

      {/* entries table */}
      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: red }} className="text-left text-white">
            <th className="px-2 py-2 font-semibold">DATE</th>
            <th className="px-2 py-2 font-semibold">TYPE</th>
            <th className="w-28 px-2 py-2 text-right font-semibold">AMOUNT</th>
            <th className="w-24 px-2 py-2 font-semibold">STATUS</th>
            <th className="px-2 py-2 font-semibold">NOTE</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-2 py-6 text-center text-neutral-400"
              >
                No ledger entries in this period
              </td>
            </tr>
          )}
          {data.entries.map((e, i) => (
            <tr key={i} className="border-b border-neutral-200">
              <td className="px-2 py-1.5 whitespace-nowrap">{e.date}</td>
              <td className="px-2 py-1.5 capitalize">{e.type}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {money(e.amount)}
              </td>
              <td className="px-2 py-1.5 capitalize">{e.status}</td>
              <td className="px-2 py-1.5 text-neutral-600">{e.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-72">
          <Row label="Entries" value={String(data.totals.count)} />
          <Row label="Debits" value={`Rs ${money(data.totals.debits)}`} />
          <Row label="Credits" value={`Rs ${money(data.totals.credits)}`} />
          <Row label="Net (period)" value={`Rs ${money(data.totals.net)}`} />
          <div className="mt-1 flex items-center justify-between border-t-2 border-neutral-800 pt-2 text-base font-bold">
            <span>Current Balance</span>
            <span className="tabular-nums">
              Rs {money(data.customer.balance)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-[10px] italic leading-relaxed text-neutral-500">
        {L.disclaimer.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-6 h-3 w-full" style={{ background: red }} />
    </div>
  );
}
