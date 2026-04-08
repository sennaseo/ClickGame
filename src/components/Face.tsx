"use client";

import { STATS, EYES, MOUTHS } from "@/data/stats";

interface FaceProps {
  lv: number;
  dominant: string;
  shaking: boolean;
}

export default function Face({ lv, dominant, shaking }: FaceProps) {
  const stat = STATS.find((item) => item.id === dominant) || STATS[0];
  const paint = lv >= 5;
  const clampedLv = Math.min(lv, 5);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        animation: lv >= 4 ? "shake .3s infinite" : lv >= 2 ? "float 3s ease-in-out infinite" : "none",
        transform: shaking ? "scale(1.08)" : "scale(1)",
        transition: "transform .15s ease",
      }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{
          background: paint ? "rgba(255,255,0,0.25)" : `radial-gradient(circle, ${stat.c}55 0%, transparent 72%)`,
          transform: "scale(1.2)",
        }}
      />
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{
          width: 220,
          height: 220,
          borderRadius: paint ? 24 : "46%",
          background: paint
            ? "linear-gradient(135deg, #fff700, #ffe168)"
            : `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.16), transparent 22%), linear-gradient(145deg, ${stat.c}24, rgba(9,9,11,0.98) 72%)`,
          border: paint ? `3px dashed ${stat.c}` : `1px solid ${stat.c}50`,
          boxShadow: paint
            ? "0 0 0 6px rgba(255,255,0,0.08), 0 20px 70px rgba(0,0,0,0.45)"
            : `inset 0 1px 0 rgba(255,255,255,0.1), 0 24px 80px ${stat.c}20`,
          fontFamily: paint ? "'Comic Sans MS', cursive" : "inherit",
        }}
      >
        <div className="absolute inset-x-5 top-4 flex justify-between text-xl opacity-35">
          <span>{stat.em}</span>
          <span>{stat.em}</span>
        </div>

        <div
          className="flex"
          style={{
            gap: paint ? 26 : 24,
            fontSize: paint ? 38 : 46,
            color: paint ? "#111827" : "#fafafa",
            textShadow: paint ? "none" : "0 0 16px rgba(255,255,255,0.12)",
          }}
        >
          <span>{EYES[clampedLv][0]}</span>
          <span>{EYES[clampedLv][1]}</span>
        </div>
        <div
          style={{
            fontSize: paint ? 38 : 34,
            marginTop: 6,
            color: paint ? "#111827" : "#fafafa",
          }}
        >
          {MOUTHS[clampedLv]}
        </div>

        <div className="absolute bottom-4 rounded-full border border-white/10 bg-black/25 px-4 py-1.5 text-xs font-bold text-white">
          Breakdown Lv.{clampedLv}
        </div>
      </div>
    </div>
  );
}
