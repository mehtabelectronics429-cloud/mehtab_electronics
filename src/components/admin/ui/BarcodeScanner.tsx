"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Loader2, ScanBarcode } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/admin/ui/Modal";
import { Button } from "@/components/admin/ui/primitives";
import { findProductByCode } from "@/lib/admin/product-search";
import type { Product } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/** Short confirmation beep (ignored where audio is blocked). */
function beep(ok = true) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 1250 : 320;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.09 : 0.25));
    osc.onended = () => void ctx.close();
  } catch {
    /* no audio */
  }
}

/**
 * Camera barcode reader (phone / laptop webcam). Keeps scanning until closed so
 * several items can be added in a row; the same code is ignored for 1.5s.
 */
export function CameraScanModal({
  open,
  onClose,
  onCode,
  title = "Scan with camera",
  continuous = true,
}: {
  open: boolean;
  onClose: () => void;
  onCode: (code: string) => void | Promise<void>;
  title?: string;
  continuous?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [status, setStatus] = useState<"starting" | "scanning" | "error">("starting");
  const [error, setError] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    let controls: { stop: () => void } | null = null;
    const seen = new Map<string, number>();
    setStatus("starting");
    setError("");
    setLast("");

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera is not available here. It needs HTTPS (or localhost) and a browser with camera access.",
          );
        }
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (stopped || !videoRef.current) return;
        const reader = new BrowserMultiFormatReader(undefined, {
          delayBetweenScanAttempts: 120,
          delayBetweenScanSuccess: 600,
        });
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          videoRef.current,
          (result) => {
            if (!result || stopped) return;
            const code = result.getText().trim();
            const now = Date.now();
            if (!code || now - (seen.get(code) ?? 0) < 1500) return;
            seen.set(code, now);
            setLast(code);
            void onCodeRef.current(code);
            if (!continuous) onCloseRef.current();
          },
        );
        if (stopped) controls.stop();
        else setStatus("scanning");
      } catch (e) {
        const err = e as Error & { name?: string };
        setStatus("error");
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in the browser and try again."
            : err?.name === "NotFoundError"
              ? "No camera found on this device."
              : err?.message || "Could not start the camera.",
        );
      }
    })();

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [open, continuous]);

  // Portal out of any parent (transformed) modal, but stay inside .admin-root
  // so the admin light/dark theme tokens still apply.
  if (typeof document === "undefined") return null;
  return createPortal(
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          {status === "scanning" && (
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-cyan/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-red-500" />
            </div>
          )}
          {status === "starting" && (
            <div className="absolute inset-0 grid place-items-center text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
              </span>
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
        <p className="text-xs text-white/50">
          Point the camera at the product barcode. {continuous && "Keep scanning to add more items — "}
          {last ? (
            <>
              last scanned: <span className="font-mono text-white">{last}</span>
            </>
          ) : (
            "codes are matched to the product barcode or SKU."
          )}
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>,
    document.querySelector(".admin-root") ?? document.body,
  );
}

/**
 * Scan field for USB / Bluetooth barcode scanners (they type the code + Enter)
 * with a camera button. Resolves the code to a catalogue product by exact
 * barcode or SKU and hands it to `onProduct`.
 */
export default function ScanInput({
  onProduct,
  placeholder = "Scan barcode / SKU and press Enter",
  className,
  autoFocus,
}: {
  /** Return `false` to reject the scan (e.g. out of stock — show your own toast). */
  onProduct: (product: Product) => boolean | void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);

  const resolve = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setBusy(true);
    try {
      const product = await findProductByCode(value);
      if (!product) {
        beep(false);
        toast.error(`No product with barcode / SKU “${value}”`);
        return;
      }
      if (onProduct(product) === false) {
        beep(false);
        return;
      }
      beep(true);
      toast.success(`Added ${`${product.brand} ${product.model}`.trim()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative min-w-0 flex-1">
        <ScanBarcode className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan" />
        <input
          ref={inputRef}
          value={code}
          autoFocus={autoFocus}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            // Never let a scanner's Enter submit the surrounding form.
            e.preventDefault();
            const value = code;
            setCode("");
            void resolve(value).then(() => inputRef.current?.focus());
          }}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-dashed border-cyan/40 bg-cyan/[0.04] pl-8 pr-8 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan/70"
        />
        {busy && (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-white/40" />
        )}
      </div>
      <button
        type="button"
        title="Scan with camera"
        onClick={() => setCamera(true)}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/5 hover:text-white"
      >
        <Camera className="h-4 w-4" /> <span className="hidden sm:inline">Camera</span>
      </button>
      <CameraScanModal open={camera} onClose={() => setCamera(false)} onCode={resolve} />
    </div>
  );
}
