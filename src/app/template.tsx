"use client";

import { motion } from "framer-motion";

/**
 * App Router template re-mounts on every navigation, giving us a cinematic
 * page-in transition: a light sweep + depth fade-through.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>

      {/* light sweep overlay */}
      <motion.div
        aria-hidden
        initial={{ x: "-100%", opacity: 0.9 }}
        animate={{ x: "120%", opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed inset-0 z-[70] bg-gradient-to-r from-transparent via-cyan/15 to-transparent"
      />
    </>
  );
}
