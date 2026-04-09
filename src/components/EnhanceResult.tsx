"use client";
import { useEffect, useState } from "react";
import { STATS, ENHANCE_SUCCESS_MSGS, ENHANCE_FAIL_MSGS } from "@/data/stats";

interface Props {
  statId: string;
  success: boolean;
  amount: number;
  onDone: () => void;
}

export default function EnhanceResult({ statId, success, amount, onDone }: Props) {
  const [phase, setPhase] = useState<"rolling" | "result">("rolling");
  const st = STATS.find(s => s.id === statId) || STATS[0];

  useEffect(() => {
    // 1초 긴장감 연출 후 결과
    const t = setTimeout(() => setPhase("result"), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "result") {
      const t = setTimeout(onDone, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  const msg = success
    ? ENHANCE_SUCCESS_MSGS[Math.floor(Math.random() * ENHANCE_SUCCESS_MSGS.length)]
    : ENHANCE_FAIL_MSGS[Math.floor(Math.random() * ENHANCE_FAIL_MSGS.length)];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: phase === "result"
            ? success ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.9)"
            : "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
        }}
      />

      <div className="relative text-center">
        {phase === "rolling" ? (
          // 긴장감 연출: 떨리는 이모지
          <div>
            <div
              className="text-7xl md:text-8xl mb-4"
              style={{ animation: "shake .1s infinite" }}
            >
              {st.em}
            </div>
            <div className="text-lg font-bold text-white/60" style={{ animation: "breathe 0.5s infinite" }}>
              강화 중...
            </div>
          </div>
        ) : (
          // 결과
          <div style={{ animation: "modalIn .4s ease" }}>
            {success ? (
              <>
                <div className="text-8xl md:text-9xl mb-6" style={{ filter: `drop-shadow(0 0 40px ${st.c})` }}>
                  {st.em}
                </div>
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{msg}</div>
                <div className="text-xl font-bold" style={{ color: st.c }}>
                  {st.name} +{amount}%
                </div>
              </>
            ) : (
              <>
                <div className="text-8xl md:text-9xl mb-6 grayscale opacity-50">
                  {st.em}
                </div>
                <div className="text-3xl md:text-4xl font-black text-red-400 mb-2">{msg}</div>
                {amount < 0 && (
                  <div className="text-xl font-bold text-red-500/70">
                    {st.name} {amount}%
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
