"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin dialog.
 *
 *  - default ("page"): every add / edit / detail form opens as a full-screen
 *    page — sticky header with back + title, the body scrolls in a centred
 *    column (`wide` gives the column more room for tables / line items).
 *  - `size="dialog"`: a small centred box for confirmations, scanners and
 *    other quick prompts (a bottom sheet on phones).
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  size = "page",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  size?: "page" | "dialog";
}) {
  // Esc closes; the page behind doesn't scroll while a dialog is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (size === "dialog") {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/60"
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6",
                "border-slate-200 bg-white text-slate-900",
                "dark:border-white/10 dark:bg-[#0c0e16] dark:text-white",
              )}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="admin-modal-body text-slate-700 dark:text-white/80">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "admin-page-dialog fixed inset-0 z-[100] flex flex-col",
            "bg-[#f3f5f9] text-slate-900 dark:bg-[#06070d] dark:text-white",
          )}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 pt-[env(safe-area-inset-top)] sm:h-16 sm:px-4 dark:border-white/10 dark:bg-[#080a12]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X className="h-4 w-4" /> Close
              <kbd className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[0.6rem] text-slate-500 dark:bg-white/10 dark:text-white/50">
                Esc
              </kbd>
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div
              className={cn(
                "admin-modal-body mx-auto w-full px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-slate-700 sm:px-6 sm:py-8 dark:text-white/80",
                wide ? "max-w-5xl" : "max-w-2xl",
              )}
            >
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
