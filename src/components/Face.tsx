"use client";
import { STATS, EYES, MOUTHS } from "@/data/stats";

interface FaceProps {
  lv: number;
  dominant: string;
  shaking: boolean;
}

export default function Face({ lv, dominant, shaking }: FaceProps) {
  const st = STATS.find((s) => s.id === dominant) || STATS[0];
  const paint = lv >= 5;
  const clampedLv = Math.min(lv, 5);

  return (
    <div
      className="inline-block"
      style={{
        animation: lv >= 4 ? "shake .3s infinite" : lv >= 2 ? "float 3s ease-in-out infinite" : "none",
        transform: shaking ? "scale(1.1)" : "scale(1)",
        transition: "transform .15s ease",
      }}
    >
      <div
        className="flex flex-col items-center justify-center mx-auto"
        style={{
          width: 170,
          height: 170,
          borderRadius: paint ? 8 : "50%",
          background: paint ? "#ffff00" : `linear-gradient(135deg,${st.c}15,transparent)`,
          border: paint ? `3px dashed ${st.c}` : `2px solid ${st.c}22`,
          fontFamily: paint ? "'Comic Sans MS',cursive" : "inherit",
          boxShadow: paint ? "none" : `0 0 40px ${st.c}10`,
        }}
      >
        <div
          className="flex"
          style={{
            gap: paint ? 24 : 20,
            fontSize: paint ? 32 : 38,
            color: paint ? "#000" : "#fafafa",
          }}
        >
          <span>{EYES[clampedLv][0]}</span>
          <span>{EYES[clampedLv][1]}</span>
        </div>
        <div
          style={{
            fontSize: paint ? 34 : 30,
            marginTop: 4,
            color: paint ? "#000" : "#fafafa",
          }}
        >
          {MOUTHS[clampedLv]}
        </div>
      </div>
    </div>
  );
}
