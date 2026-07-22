"use client";

import { jsPDF } from "jspdf";
import { downloadFile } from "@/lib/admin/invoice-pdf";

export type LedgerReportData = {
  customer: {
    name: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    balance: number;
  };
  from: string | null;
  to: string | null;
  entries: {
    date: string;
    type: string;
    amount: number;
    status: string;
    note: string;
  }[];
  totals: { debits: number; credits: number; net: number; count: number };
};

function money(n: number) {
  return `Rs ${n.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** Build a printable customer ledger statement PDF. */
export async function generateLedgerReportPdf(
  data: LedgerReportData,
): Promise<File> {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const ensureSpace = (need: number) => {
    if (y + need > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Mehtab Electronics", margin, y);
  y += 22;
  pdf.setFontSize(12);
  pdf.text("Customer Ledger Statement", margin, y);
  y += 28;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Customer: ${data.customer.name}`, margin, y);
  y += 14;
  if (data.customer.phone) {
    pdf.text(`Phone: ${data.customer.phone}`, margin, y);
    y += 14;
  }
  if (data.customer.address) {
    const lines = pdf.splitTextToSize(
      `Address: ${data.customer.address}`,
      pageW - margin * 2,
    );
    pdf.text(lines, margin, y);
    y += lines.length * 14;
  }
  const range =
    data.from || data.to
      ? `${data.from || "…"} → ${data.to || "…"}`
      : "All dates";
  pdf.text(`Period: ${range}`, margin, y);
  y += 14;
  pdf.text(`Current balance: ${money(data.customer.balance)}`, margin, y);
  y += 22;

  // Table header
  pdf.setFont("helvetica", "bold");
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, y - 10, pageW - margin * 2, 18, "F");
  pdf.text("Date", margin + 4, y);
  pdf.text("Type", margin + 70, y);
  pdf.text("Amount", margin + 160, y);
  pdf.text("Status", margin + 240, y);
  pdf.text("Note", margin + 300, y);
  y += 18;
  pdf.setFont("helvetica", "normal");

  for (const e of data.entries) {
    ensureSpace(28);
    pdf.text(e.date, margin + 4, y);
    pdf.text(e.type, margin + 70, y);
    pdf.text(money(e.amount), margin + 160, y);
    pdf.text(e.status, margin + 240, y);
    const noteLines = pdf.splitTextToSize(e.note || "—", pageW - margin - 300);
    pdf.text(noteLines, margin + 300, y);
    y += Math.max(16, noteLines.length * 12);
  }

  if (!data.entries.length) {
    ensureSpace(20);
    pdf.setTextColor(120);
    pdf.text("No entries in this period.", margin + 4, y);
    pdf.setTextColor(0);
    y += 20;
  }

  y += 16;
  ensureSpace(60);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Entries: ${data.totals.count}`, margin, y);
  y += 14;
  pdf.text(`Debits: ${money(data.totals.debits)}`, margin, y);
  y += 14;
  pdf.text(`Credits: ${money(data.totals.credits)}`, margin, y);
  y += 14;
  pdf.text(`Net: ${money(data.totals.net)}`, margin, y);
  y += 24;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(
    `Generated ${new Date().toLocaleString("en-PK")} · Mehtab Electronics`,
    margin,
    y,
  );

  const safeName = data.customer.name.replace(/\s+/g, "-").toLowerCase();
  const blob = pdf.output("blob");
  return new File([blob], `ledger-${safeName}.pdf`, { type: "application/pdf" });
}

export { downloadFile };
