"use client";
import { useState, useEffect, useRef } from "react";
import { STATS, type Scenario } from "@/data/stats";

interface Props {
  scenario: Scenario;
  onPick: (statId: string) => void;
}

export default function ChoiceModal({ scenario, onPick }: Props) {
  const [cd, setCd] = useState(10);
  const [armed, setArmed] = useState(false);
  const picked = useRef(false);

  const statA = STATS.find(s => s.id === scenario.choiceA.stat) || STATS[0];
  const statB = STATS.find(s => s.id === scenario.choiceB.stat) || STATS[0];

  // 클릭 관성 방지: 900ms 후 선택 가능
  useEffect(() => {
    setArmed(false);
    picked.current = false;
    const t = setTimeout(() => setArmed(true), 900);
    return () => clearTimeout(t);
  }, [scenario]);

  useEffect(() => {
    if (cd <= 0 && !picked.current) {
      picked.current = true;
      const random = Math.random() > 0.5 ? scenario.choiceA.stat : scenario.choiceB.stat;
      onPick(random);
      return;
    }
    const t = setTimeout(() => setCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cd, onPick, scenario]);

  const handlePick = (statId: string) => {
    if (!armed || picked.current) return;
    picked.current = true;
    onPick(statId);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      <div className="relative w-full max-w-[500px] mx-4" style={{ animation: "modalIn .3s ease" }}>
        {/* Situation */}
        <div
          className="text-center rounded-t-[20px] border border-b-0 border-white/[0.07]"
          style={{ background: "rgba(20,18,28,.98)", padding: "32px 28px 24px" }}
        >
          <div className="text-[11px] font-semibold text-[#818cf8] mb-3">
            {armed ? "⚡ 선택하세요" : "🔒 잠금 해제 중..."} · <span className={cd <= 3 ? "text-red-400" : ""}>⏱ {cd}초</span>
          </div>
          <div className="text-lg md:text-xl font-extrabold leading-relaxed">
            {scenario.situation}
          </div>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-2 relative">
          {[
            { choice: scenario.choiceA, stat: statA, idx: 0 },
            { choice: scenario.choiceB, stat: statB, idx: 1 },
          ].map(({ choice, stat, idx }) => (
            <button
              key={idx}
              onClick={() => handlePick(choice.stat)}
              disabled={!armed}
              className="flex flex-col items-center justify-center border border-white/[0.07] transition-all duration-200"
              style={{
                padding: "28px 16px 24px",
                background: "rgba(12,10,22,.98)",
                fontFamily: "inherit",
                color: "#fafafa",
                borderRadius: idx === 0 ? "0 0 0 20px" : "0 0 20px 0",
                opacity: armed ? 1 : 0.5,
                cursor: armed ? "pointer" : "not-allowed",
              }}
              onMouseEnter={e => armed && (e.currentTarget.style.background = `${stat.c}12`)}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(12,10,22,.98)")}
            >
              <span className="text-4xl mb-3">{stat.em}</span>
              <span className="text-sm md:text-base font-bold mb-1 text-center leading-snug">
                {choice.label}
              </span>
              <span className="text-[11px] text-[#71717a] text-center mt-1">{choice.desc}</span>
              <div
                className="mt-3 px-5 py-1.5 rounded-2xl text-xs font-bold text-white"
                style={{ background: stat.c }}
              >
                {stat.name} 강화 시도
              </div>
            </button>
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#18181b] border-2 border-white/[0.08] flex items-center justify-center text-[11px] font-black text-[#818cf8]">
            VS
          </div>
        </div>
      </div>
    </div>
  );
}
