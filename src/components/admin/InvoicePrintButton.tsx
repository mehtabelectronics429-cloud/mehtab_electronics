"use client";

import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-brand">
      <Printer className="h-4 w-4" /> Print / Save PDF
    </button>
  );
}
