"use client";

import { useState } from "react";
import { DownloadIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { generateInvoicePdfFile, downloadFile } from "@/lib/admin/invoice-pdf";
import { cn } from "@/lib/utils";

/**
 * Generates the invoice PDF in-browser and hands it to the OS share sheet
 * (navigator.share with files) so the operator can pick WhatsApp and the PDF
 * attaches to the chat. On devices without file-sharing support it downloads the
 * PDF and tells the user to attach it manually.
 */
export default function ShareInvoiceButton({
  targetId = "invoice-sheet",
  filename,
  shareText,
  label = "Download & Share",
  className,
}: {
  targetId?: string;
  filename: string;
  shareText?: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    const el = document.getElementById(targetId);
    if (!el) return toast.error("Invoice not ready yet");
    setBusy(true);
    try {
      const file = await generateInvoicePdfFile(el, filename);
      const nav = navigator as Navigator & {
        canShare?: (d?: ShareData) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: filename, text: shareText });
        } catch (err) {
          // user cancelled the share sheet — not an error
          if ((err as Error)?.name !== "AbortError") throw err;
        }
      } else {
        downloadFile(file);
        toast(
          "PDF downloaded — attach it in WhatsApp (file sharing isn't supported on this device/browser).",
          {
            icon: "📎",
            duration: 6000,
          },
        );
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not generate the PDF",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn("btn-brand disabled:opacity-60", className)}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="h-4 w-4" />
      )}
      {busy ? "Preparing PDF…" : label}
    </button>
  );
}
