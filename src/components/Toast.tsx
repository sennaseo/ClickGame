"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

export default function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-4 z-[2000] flex min-w-[260px] max-w-[min(92vw,540px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-[#09090bf2] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <motion.div
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-lg"
        initial={{ rotate: -20, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 15, delay: 0.06 }}
      >
        ⚡
      </motion.div>
      <div className="leading-5 text-[#f4f4f5]">{msg}</div>
    </motion.div>
  );
}
