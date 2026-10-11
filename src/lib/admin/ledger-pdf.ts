"use client";

import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import { LETTERHEAD as L } from "@/lib/letterhead";
import { LOGO_MARK } from "@/lib/assets";
import { downloadFile } from "@/lib/admin/invoice-pdf";
import {
  drCr,
  ledgerItemsTotal,
  ledgerProductSummary,
  ledgerTypeLabel,
  type LedgerStatement,
  type LedgerSummary,
} from "@/lib/ledger/statement";

export { downloadFile };

/* ── shared letterhead ─────────────────────────────────────────────────── */

const M = 40; // page margin (pt)
const RED: [number, number, number] = [216, 31, 39];
const INK: [number, number, number] = [23, 23, 23];
const MUTED: [number, number, number] = [110, 110, 110];
const LINE: [number, number, number] = [220, 220, 220];
const TOTAL_PAGES = "{total_pages_count_string}";

const money = (n: number) =>
  (Number(n) || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const rs = (n: number) => `Rs ${money(n)}`;
const balance = (n: number) => drCr(n, rs);
const fmtDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const periodLabel = (from: string | null, to: string | null) =>
  from || to
    ? `${from ? fmtDate(from) : "Beginning"}  to  ${to ? fmtDate(to) : "Today"}`
    : "All dates";

let logoCache: string | null | undefined;
async function loadLogo(): Promise<string | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    const blob = await (await fetch(LOGO_MARK)).blob();
    logoCache = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    logoCache = null;
  }
  return logoCache;
}

/** Letterhead block; returns the y position below it. */
function drawHeader(doc: jsPDF, logo: string | null, title: string, subtitle: string) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 6, "F");

  // logo tile
  doc.setFillColor(...RED);
  doc.roundedRect(M, 24, 58, 58, 4, 4, "F");
  if (logo) doc.addImage(logo, "PNG", M + 4, 29, 50, 43.4);

  // company block
  const x = M + 70;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold").setFontSize(15);
  doc.text(L.name, x, 38);
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`${L.address}  ·  ${L.postal}`, x, 51);
  doc.text(L.phones, x, 62);
  doc.text(`${L.ntn}  ·  ${L.email}`, x, 73);
  doc.setFont("helvetica", "italic").setFontSize(8);
  doc.text(`${L.since} — ${L.tagline}`, x, 84);

  // document title (right) — shrink to fit beside the company name
  doc.setFont("helvetica", "bold").setFontSize(15);
  const nameRight = x + doc.getTextWidth(L.name) + 16;
  let size = 17;
  doc.setFontSize(size);
  while (size > 10 && W - M - doc.getTextWidth(title) < nameRight) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  doc.setTextColor(...RED);
  doc.text(title, W - M, 40, { align: "right" });
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  doc.text(subtitle, W - M, 54, { align: "right" });
  doc.text(
    `Generated ${new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`,
    W - M,
    66,
    { align: "right" },
  );

  doc.setDrawColor(...RED);
  doc.setLineWidth(1.2);
  doc.line(M, 96, W - M, 96);
  return 110;
}

/** Footer on every page: page x of y + company line. */
function drawFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const page = doc.getCurrentPageInfo().pageNumber;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.6);
  doc.line(M, H - 34, W - M, H - 34);
  doc.setFont("helvetica", "normal").setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(`${L.name} · ${L.address} · ${L.phones}`, M, H - 22);
  // Left-aligned: the total-pages placeholder is wider than the final number.
  doc.text(`Page ${page} of ${TOTAL_PAGES}`, W - M - 48, H - 22);
  doc.setFillColor(...RED);
  doc.rect(0, H - 6, W, 6, "F");
}

/** Label/value box (used for "Statement for" and "Account summary"). */
function infoBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  heading: string,
  lines: { label?: string; value: string; bold?: boolean; color?: [number, number, number] }[],
) {
  const h = 26 + lines.length * 13;
  doc.setDrawColor(...LINE);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");
  doc.setFont("helvetica", "bold").setFontSize(7.5);
  doc.setTextColor(...RED);
  doc.text(heading.toUpperCase(), x + 10, y + 15);
  lines.forEach((ln, i) => {
    const ly = y + 30 + i * 13;
    doc.setFont("helvetica", ln.bold ? "bold" : "normal").setFontSize(9);
    doc.setTextColor(...(ln.color || INK));
    if (ln.label) {
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "normal");
      doc.text(ln.label, x + 10, ly);
      doc.setFont("helvetica", ln.bold ? "bold" : "normal");
      doc.setTextColor(...(ln.color || INK));
      doc.text(ln.value, x + w - 10, ly, { align: "right" });
    } else {
      doc.text(doc.splitTextToSize(ln.value, w - 20)[0] ?? "", x + 10, ly);
    }
  });
  return y + h;
}

function signatureBlock(doc: jsPDF, y: number) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  if (y + 90 > H - 44) {
    doc.addPage();
    drawFooter(doc);
    y = M + 10;
  }
  doc.setFont("helvetica", "italic").setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    "This is a computer-generated statement. Please report any discrepancy within 7 days of receipt.",
    M,
    y + 14,
  );
  const sy = y + 62;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.6);
  doc.line(M, sy, M + 150, sy);
  doc.line(W - M - 150, sy, W - M, sy);
  doc.setFont("helvetica", "normal").setFontSize(8);
  doc.setTextColor(...INK);
  doc.text("Customer signature", M, sy + 12);
  doc.text(`${L.preparedBy.name} (${L.preparedBy.role})`, W - M, sy + 12, { align: "right" });
}

function finish(doc: jsPDF, filename: string) {
  doc.putTotalPages(TOTAL_PAGES);
  return new File([doc.output("blob")], filename, { type: "application/pdf" });
}

const slug = (s: string) => s.replace(/\s+/g, "-").toLowerCase();
const rangeSlug = (from: string | null, to: string | null) =>
  from || to ? `-${from || "start"}-to-${to || "end"}` : "";

/* ── customer statement ────────────────────────────────────────────────── */

const ITEM_FILL: [number, number, number] = [248, 248, 248];
const ITEM_INK: [number, number, number] = [70, 70, 70];
const GREEN: [number, number, number] = [22, 128, 61];
const PENDING_INK: [number, number, number] = [150, 150, 150];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lastY = (doc: jsPDF, fallback: number): number => (doc as any).lastAutoTable?.finalY ?? fallback;

/** Section heading; starts a new page when there's no room for it plus a few rows. */
function sectionTitle(doc: jsPDF, y: number, title: string, note?: string) {
  const H = doc.internal.pageSize.getHeight();
  if (y + 80 > H - 50) {
    doc.addPage();
    drawFooter(doc);
    y = M + 10;
  }
  const heading = title.toUpperCase();
  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.setTextColor(...RED);
  doc.text(heading, M, y + 10);
  if (note) {
    const x = M + doc.getTextWidth(heading) + 10;
    doc.setFont("helvetica", "normal").setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(note, x, y + 10);
  }
  return y + 18;
}

const tableStyles = {
  font: "helvetica" as const,
  fontSize: 8,
  cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
  lineColor: LINE,
  lineWidth: 0.5,
  textColor: INK,
  valign: "middle" as const,
};

/**
 * One customer's full statement on the current page: letterhead, account
 * boxes, every entry with its goods lines (qty / rate / amount), a per-product
 * summary, pending note and signatures.
 */
function renderStatement(doc: jsPDF, st: LedgerStatement, logo: string | null) {
  const W = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc, logo, "LEDGER STATEMENT", periodLabel(st.from, st.to));

  const t = st.totals;
  const approved = st.rows.filter((r) => r.status === "approved");
  const charges = approved.filter((r) => r.debit > 0).length;
  const credits = approved.filter((r) => r.credit > 0).length;
  const itemLines = st.rows.reduce((n, r) => n + (r.items?.length ?? 0), 0);

  const third = (W - M * 2 - 20) / 3;
  const c = st.customer;
  const boxes = [
    infoBox(doc, M, y, third, "Statement for", [
      { value: c.name, bold: true },
      ...(c.address ? [{ value: c.address }] : []),
      ...(c.phone ? [{ value: `Phone: ${c.phone}` }] : []),
      ...(c.whatsapp && c.whatsapp !== c.phone ? [{ value: `WhatsApp: ${c.whatsapp}` }] : []),
    ]),
    infoBox(doc, M + third + 10, y, third, "Activity", [
      { label: "Entries", value: String(st.rows.length) },
      { label: "Sales / charges", value: `${charges}  ·  ${rs(t.debit)}` },
      { label: "Payments / credits", value: `${credits}  ·  ${rs(t.credit)}` },
      { label: "Item lines", value: String(itemLines) },
    ]),
    infoBox(doc, M + (third + 10) * 2, y, third, "Account summary", [
      { label: "Opening balance", value: balance(t.opening) },
      { label: "Total debit (charges)", value: rs(t.debit) },
      { label: "Total credit (payments)", value: rs(t.credit) },
      { label: "Closing balance", value: balance(t.closing), bold: true, color: t.closing > 0 ? RED : GREEN },
    ]),
  ];
  y = Math.max(...boxes) + 16;

  /* entries + goods lines */
  const body: RowInput[] = [
    [
      { content: st.from ? fmtDate(st.from) : "", styles: { fontStyle: "italic" } },
      "",
      { content: "Opening balance", colSpan: 6, styles: { fontStyle: "italic" } },
      { content: balance(t.opening), styles: { fontStyle: "bold" } },
    ],
  ];
  for (const r of st.rows) {
    const pending = r.status !== "approved";
    const ink = pending ? PENDING_INK : INK;
    body.push([
      { content: fmtDate(r.date), styles: { textColor: ink } },
      { content: r.ref || "-", styles: { textColor: ink } },
      {
        content: `${r.particulars}\n${ledgerTypeLabel(r.type)}${pending ? "  ·  PENDING APPROVAL" : ""}`,
        colSpan: 4,
        styles: { textColor: ink, fontStyle: "bold" },
      },
      { content: r.debit ? money(r.debit) : "", styles: { textColor: pending ? ink : RED } },
      { content: r.credit ? money(r.credit) : "", styles: { textColor: pending ? ink : GREEN } },
      { content: pending ? "-" : balance(r.balance), styles: { textColor: ink, fontStyle: "bold" } },
    ]);
    const items = r.items ?? [];
    items.forEach((it, i) => {
      const itemStyle = { fillColor: ITEM_FILL, textColor: pending ? PENDING_INK : ITEM_INK, fontSize: 7.5 };
      body.push([
        { content: "", styles: itemStyle },
        { content: "", styles: itemStyle },
        { content: `${i + 1}.  ${it.description}`, styles: itemStyle },
        { content: String(it.qty), styles: { ...itemStyle, halign: "right" } },
        { content: money(it.unitPrice), styles: { ...itemStyle, halign: "right" } },
        { content: money(it.qty * it.unitPrice), styles: { ...itemStyle, halign: "right" } },
        { content: "", colSpan: 3, styles: itemStyle },
      ]);
    });
    // Discount / tax / shipping: the gap between the goods and the entry amount.
    if (items.length) {
      const entryAmount = r.debit || r.credit;
      const diff = Math.round((entryAmount - ledgerItemsTotal(items)) * 100) / 100;
      if (Math.abs(diff) >= 0.01) {
        const s = { fillColor: ITEM_FILL, textColor: MUTED, fontSize: 7.5, fontStyle: "italic" as const };
        body.push([
          { content: "", styles: s },
          { content: "", styles: s },
          { content: diff < 0 ? "Less discount" : "Add tax / shipping / adjustment", colSpan: 3, styles: s },
          { content: money(diff), styles: { ...s, halign: "right" } },
          { content: "", colSpan: 3, styles: s },
        ]);
      }
    }
  }
  if (st.rows.length === 0) {
    body.push([
      {
        content: "No transactions in this period",
        colSpan: 9,
        styles: { halign: "center", textColor: PENDING_INK, fontStyle: "italic" },
      },
    ]);
  }

  y = sectionTitle(doc, y, "Ledger entries", "Goods lines are listed under each entry (qty × rate = amount).");
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: M + 10, bottom: 50 },
    head: [["Date", "Ref #", "Particulars / item", "Qty", "Rate", "Amount", "Debit (Rs)", "Credit (Rs)", "Balance (Rs)"]],
    body,
    foot: [
      [
        { content: "TOTAL (APPROVED)", colSpan: 6, styles: { halign: "right" } },
        money(t.debit),
        money(t.credit),
        "",
      ],
      [{ content: "CLOSING BALANCE", colSpan: 8, styles: { halign: "right" } }, balance(t.closing)],
    ],
    showFoot: "lastPage",
    theme: "grid",
    styles: tableStyles,
    headStyles: { fillColor: RED, textColor: 255, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: [245, 245, 245], textColor: INK, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 58 },
      1: { cellWidth: 62 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 34, halign: "right" },
      4: { cellWidth: 64, halign: "right" },
      5: { cellWidth: 70, halign: "right" },
      6: { cellWidth: 70, halign: "right" },
      7: { cellWidth: 70, halign: "right" },
      8: { cellWidth: 86, halign: "right" },
    },
    didParseCell: (d) => {
      if ((d.section === "head" || d.section === "foot") && d.column.index >= 3) d.cell.styles.halign = "right";
    },
    didDrawPage: () => drawFooter(doc),
  });
  let endY = lastY(doc, y);

  /* products summary */
  const ps = ledgerProductSummary(st.rows);
  if (ps.rows.length) {
    y = sectionTitle(doc, endY + 18, "Products summary", "Approved entries in this period · returns are netted off.");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, top: M + 10, bottom: 50 },
      head: [["#", "Product / item", "Sold qty", "Sold amount", "Returned qty", "Returned amount", "Net qty", "Net amount"]],
      body: ps.rows.map((r, i) => [
        String(i + 1),
        r.description,
        String(r.soldQty),
        money(r.soldAmount),
        r.returnedQty ? String(r.returnedQty) : "-",
        r.returnedAmount ? money(r.returnedAmount) : "-",
        { content: String(r.netQty), styles: { fontStyle: "bold" } },
        { content: money(r.netAmount), styles: { fontStyle: "bold" } },
      ]),
      foot: [
        [
          { content: "TOTAL", colSpan: 2, styles: { halign: "right" } },
          String(ps.totals.soldQty),
          money(ps.totals.soldAmount),
          String(ps.totals.returnedQty),
          money(ps.totals.returnedAmount),
          String(ps.totals.netQty),
          money(ps.totals.netAmount),
        ],
      ],
      showFoot: "lastPage",
      theme: "grid",
      styles: tableStyles,
      headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold", fontSize: 8 },
      footStyles: { fillColor: [245, 245, 245], textColor: INK, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      columnStyles: {
        0: { cellWidth: 24, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 56, halign: "right" },
        3: { cellWidth: 80, halign: "right" },
        4: { cellWidth: 66, halign: "right" },
        5: { cellWidth: 86, halign: "right" },
        6: { cellWidth: 56, halign: "right" },
        7: { cellWidth: 86, halign: "right" },
      },
      didParseCell: (d) => {
        if ((d.section === "head" || d.section === "foot") && d.column.index >= 2) d.cell.styles.halign = "right";
      },
      didDrawPage: () => drawFooter(doc),
    });
    endY = lastY(doc, y);
  }

  if (t.pendingCount) {
    doc.setFont("helvetica", "italic").setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `${t.pendingCount} pending entr${t.pendingCount === 1 ? "y" : "ies"} (Dr ${money(t.pendingDebit)} / Cr ${money(t.pendingCredit)}) shown in grey are not yet posted to the balance.`,
      M,
      endY + 14,
    );
    endY += 14;
  }
  signatureBlock(doc, endY + 6);
}

const newStatementDoc = () => new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });

export async function generateLedgerStatementPdf(st: LedgerStatement): Promise<File> {
  const doc = newStatementDoc();
  renderStatement(doc, st, await loadLogo());
  return finish(doc, `ledger-${slug(st.customer.name)}${rangeSlug(st.from, st.to)}.pdf`);
}

/**
 * Detailed ledger for many customers: an index page (customer, entries,
 * debit, credit, closing) followed by each customer's full statement.
 */
export async function generateLedgerDetailedPdf(
  statements: LedgerStatement[],
  from: string | null,
  to: string | null,
): Promise<File> {
  const doc = newStatementDoc();
  const logo = await loadLogo();
  const y = drawHeader(doc, logo, "DETAILED CUSTOMER LEDGER", periodLabel(from, to));

  const tot = statements.reduce(
    (a, s) => ({
      opening: a.opening + s.totals.opening,
      debit: a.debit + s.totals.debit,
      credit: a.credit + s.totals.credit,
      closing: a.closing + s.totals.closing,
      entries: a.entries + s.rows.length,
    }),
    { opening: 0, debit: 0, credit: 0, closing: 0, entries: 0 },
  );
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: M + 10, bottom: 50 },
    head: [["#", "Customer", "Phone", "Entries", "Opening", "Debit", "Credit", "Closing balance"]],
    body: statements.length
      ? statements.map((s, i) => [
          String(i + 1),
          s.customer.name,
          s.customer.phone || "-",
          String(s.rows.length),
          balance(s.totals.opening),
          money(s.totals.debit),
          money(s.totals.credit),
          {
            content: balance(s.totals.closing),
            styles: { fontStyle: "bold", textColor: s.totals.closing > 0 ? RED : s.totals.closing < 0 ? GREEN : INK },
          },
        ])
      : [[{ content: "No ledger activity", colSpan: 8, styles: { halign: "center", fontStyle: "italic" } }]],
    foot: [
      [
        { content: "GRAND TOTAL", colSpan: 3, styles: { halign: "right" } },
        String(tot.entries),
        balance(tot.opening),
        money(tot.debit),
        money(tot.credit),
        balance(tot.closing),
      ],
    ],
    showFoot: "lastPage",
    theme: "grid",
    styles: tableStyles,
    headStyles: { fillColor: RED, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [245, 245, 245], textColor: INK, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 90 },
      3: { cellWidth: 50, halign: "right" },
      4: { cellWidth: 90, halign: "right" },
      5: { cellWidth: 80, halign: "right" },
      6: { cellWidth: 80, halign: "right" },
      7: { cellWidth: 96, halign: "right" },
    },
    didParseCell: (d) => {
      if ((d.section === "head" || d.section === "foot") && d.column.index >= 3) d.cell.styles.halign = "right";
    },
    didDrawPage: () => drawFooter(doc),
  });

  for (const st of statements) {
    doc.addPage(); // the statement's tables draw this page's footer
    renderStatement(doc, st, logo);
  }
  return finish(doc, `ledger-detailed${rangeSlug(from, to)}.pdf`);
}

/* ── all-customer summary ──────────────────────────────────────────────── */

export async function generateLedgerSummaryPdf(sm: LedgerSummary): Promise<File> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const logo = await loadLogo();
  let y = drawHeader(doc, logo, "CUSTOMER LEDGER SUMMARY", periodLabel(sm.from, sm.to));

  const t = sm.totals;
  const receivable = sm.rows.filter((r) => r.closing > 0).reduce((s, r) => s + r.closing, 0);
  const advances = sm.rows.filter((r) => r.closing < 0).reduce((s, r) => s - r.closing, 0);
  const third = (W - M * 2 - 20) / 3;
  const boxes = [
    infoBox(doc, M, y, third, "Customers", [
      { label: "Accounts", value: String(sm.rows.length), bold: true },
      { label: "Entries in period", value: String(t.entries) },
    ]),
    infoBox(doc, M + third + 10, y, third, "Period activity", [
      { label: "Total debit", value: rs(t.debit) },
      { label: "Total credit", value: rs(t.credit) },
    ]),
    infoBox(doc, M + (third + 10) * 2, y, third, "Balances", [
      { label: "Receivable (Dr)", value: rs(receivable), bold: true, color: RED },
      { label: "Advances (Cr)", value: rs(advances) },
    ]),
  ];
  y = Math.max(...boxes) + 16;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: M + 10, bottom: 50 },
    head: [["#", "Customer", "Phone", "Opening", "Debit", "Credit", "Closing balance"]],
    body: sm.rows.length
      ? sm.rows.map((r, i) => [
          String(i + 1),
          r.name,
          r.phone || "-",
          balance(r.opening),
          money(r.debit),
          money(r.credit),
          {
            content: balance(r.closing),
            styles: {
              fontStyle: "bold",
              textColor: r.closing > 0 ? RED : r.closing < 0 ? [22, 128, 61] : INK,
            },
          },
        ])
      : [[{ content: "No ledger activity", colSpan: 7, styles: { halign: "center", fontStyle: "italic" } }]],
    foot: [
      [
        { content: "GRAND TOTAL", colSpan: 3, styles: { halign: "right" } },
        balance(t.opening),
        money(t.debit),
        money(t.credit),
        balance(t.closing),
      ],
    ],
    showFoot: "lastPage",
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
      lineColor: LINE,
      lineWidth: 0.5,
      textColor: INK,
      valign: "middle",
    },
    headStyles: { fillColor: RED, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [245, 245, 245], textColor: INK, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 78 },
      3: { cellWidth: 74, halign: "right" },
      4: { cellWidth: 66, halign: "right" },
      5: { cellWidth: 66, halign: "right" },
      6: { cellWidth: 84, halign: "right" },
    },
    didParseCell: (d) => {
      if ((d.section === "head" || d.section === "foot") && d.column.index >= 3) {
        d.cell.styles.halign = "right";
      }
    },
    didDrawPage: () => drawFooter(doc),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endY: number = (doc as any).lastAutoTable?.finalY ?? y;
  doc.setFont("helvetica", "italic").setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    "Dr = amount receivable from the customer · Cr = advance / amount payable to the customer. Approved entries only.",
    M,
    endY + 14,
  );

  return finish(doc, `ledger-summary${rangeSlug(sm.from, sm.to)}.pdf`);
}
