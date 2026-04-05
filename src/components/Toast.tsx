"use client";
import { useEffect } from "react";

export default function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] bg-zinc-900/95 backdrop-blur-2xl text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold border border-white/[0.07]"
      style={{ animation: "fadeUp .25s ease" }}
    >
      {msg}
    </div>
  );
}
