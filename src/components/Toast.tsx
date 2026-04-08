"use client";

import { useEffect } from "react";

export default function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-4 z-[2000] flex min-w-[260px] max-w-[min(92vw,540px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-[#09090bf2] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      style={{ animation: "toastIn .25s ease" }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-lg">⚡</div>
      <div className="leading-5 text-[#f4f4f5]">{msg}</div>
    </div>
  );
}
