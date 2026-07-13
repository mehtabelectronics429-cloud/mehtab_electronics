"use client";

import { Suspense } from "react";
import LedgerPageInner from "./LedgerInner";

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-white/40">Loading…</div>}>
      <LedgerPageInner />
    </Suspense>
  );
}
