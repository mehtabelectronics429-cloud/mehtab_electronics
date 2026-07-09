"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border border-white/10 bg-[#0c0e16]/95 p-6 shadow-2xl backdrop-blur-xl`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
