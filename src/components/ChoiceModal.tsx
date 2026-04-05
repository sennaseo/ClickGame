"use client";
import { useState, useEffect, useRef } from "react";
import type { Stat, Scenario } from "@/data/stats";

interface Props {
  opts: [Stat, Stat];
  scene: Scenario;
  onPick: (statId: string) => void;
}

export default function ChoiceModal({ opts, scene, onPick }: Props) {
  const [cd, setCd] = useState(10);
  const stableOpts = useRef(opts);
  const flavors = useRef(opts.map((o) => o.desc));

  useEffect(() => {
    if (cd <= 0) {
      onPick(stableOpts.current[Math.floor(Math.random() * 2)].id);
      return;
    }
    const t = setTimeout(() => setCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cd, onPick]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      <div
        className="relative w-full max-w-[440px] mx-4"
        style={{ animation: "modalIn .3s ease" }}
      >
        {/* Header */}
        <div className="text-center rounded-t-[20px] border border-b-0 border-white/[0.07]"
          style={{ background: "rgba(20,18,28,.98)", padding: "28px 24px 20px" }}>
          <div className="text-[11px] font-semibold text-[#818cf8] mb-2">
            ⚡ 이벤트 · <span className={cd <= 3 ? "text-red-400" : ""}>⏱ {cd}초</span>
          </div>
          <div className="text-lg font-extrabold">{scene.t}</div>
          <div className="text-[13px] text-[#71717a] mt-1">{scene.s}</div>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-2 relative">
          {stableOpts.current.map((o, idx) => (
            <button
              key={o.id}
              onClick={() => onPick(o.id)}
              className="flex flex-col items-center justify-center border border-white/[0.07] cursor-pointer transition-colors duration-200"
              style={{
                padding: "28px 16px 24px",
                background: "rgba(12,10,22,.98)",
                fontFamily: "inherit",
                color: "#fafafa",
                borderRadius: idx === 0 ? "0 0 0 20px" : "0 0 20px 0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${o.c}10`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(12,10,22,.98)")}
            >
              <span className="text-[44px] mb-3">{o.em}</span>
              <span className="text-[15px] font-bold mb-1">{o.name}</span>
              <span className="text-[11px] text-[#71717a]">{flavors.current[idx]}</span>
              <div
                className="mt-3 px-4 py-1 rounded-2xl text-[13px] font-bold text-white"
                style={{ background: o.c }}
              >
                선택
              </div>
            </button>
          ))}
          {/* VS badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#18181b] border-2 border-white/[0.08] flex items-center justify-center text-[10px] font-black text-[#818cf8]">
            VS
          </div>
        </div>
      </div>
    </div>
  );
}
