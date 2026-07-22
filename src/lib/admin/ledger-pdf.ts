"use client";

import { generateInvoicePdfFile, downloadFile } from "@/lib/admin/invoice-pdf";

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

/** Capture the branded `#ledger-sheet` document into a PDF (same pipeline as invoices). */
export async function generateLedgerReportPdf(
  data: LedgerReportData,
  sheetId = "ledger-sheet",
): Promise<File> {
  const el = document.getElementById(sheetId);
  if (!el) throw new Error("Ledger statement sheet is not ready");
  const safeName = data.customer.name.replace(/\s+/g, "-").toLowerCase();
  const range =
    data.from || data.to
      ? `-${data.from || "start"}-to-${data.to || "end"}`
      : "";
  return generateInvoicePdfFile(el, `ledger-${safeName}${range}.pdf`);
}

export { downloadFile };
