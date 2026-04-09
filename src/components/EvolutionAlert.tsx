"use client";
import { useEffect, useState } from "react";
import { STATS } from "@/data/stats";
import type { EvolutionStage } from "@/data/evolution";

interface Props {
  statId: string;
  stage: EvolutionStage;
  onDone: () => void;
}

export default function EvolutionAlert({ statId, stage, onDone }: Props) {
  const [phase, setPhase] = useState<"intro" | "reveal" | "show">("intro");
  const stat = STATS.find(s => s.id === statId) || STATS[0];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 800);
    const t2 = setTimeout(() => setPhase("show"), 1600);
    const t3 = setTimeout(onDone, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const rarityLabel =
    stage.level >= 5 ? "LEGENDARY" :
    stage.level >= 4 ? "EPIC" :
    stage.level >= 3 ? "RARE" : "COMMON";

  const rarityColor =
    stage.level >= 5 ? "#fbbf24" :
    stage.level >= 4 ? "#f093fb" :
    stage.level >= 3 ? "#818cf8" : "#71717a";

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      {/* BG */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: phase === "intro"
            ? "rgba(0,0,0,0.95)"
            : `radial-gradient(circle at center, ${stat.c}15, rgba(0,0,0,0.92) 70%)`,
          backdropFilter: "blur(16px)",
        }}
      />

      <div className="relative text-center">
        {phase === "intro" && (
          <div style={{ animation: "breathe 0.4s infinite" }}>
            <div className="text-6xl md:text-7xl mb-4" style={{ animation: "shake .08s infinite" }}>
              ⚡
            </div>
            <div className="text-xl font-black text-white/70 tracking-widest">
              진 화 중 . . .
            </div>
          </div>
        )}

        {phase === "reveal" && (
          <div style={{ animation: "evolutionBurst .6s ease" }}>
            <div className="text-8xl md:text-9xl mb-2">
              {stage.deco[0]}
            </div>
            <div
              className="text-3xl md:text-4xl font-black tracking-wide"
              style={{ color: stat.c, textShadow: `0 0 40px ${stat.c}88` }}
            >
              진화 완료!
            </div>
          </div>
        )}

        {phase === "show" && (
          <div style={{ animation: "modalIn .4s ease" }}>
            {/* 장식 이모지 ring */}
            <div className="relative inline-block mb-6">
              <div
                className="text-8xl md:text-9xl"
                style={{ filter: `drop-shadow(0 0 50px ${stat.c})` }}
              >
                {stage.deco[0]}
              </div>
              {stage.deco.slice(1).map((d, i) => (
                <span
                  key={i}
                  className="absolute text-3xl"
                  style={{
                    top: `${30 + Math.sin(i * 2.1) * 40}%`,
                    left: `${i % 2 === 0 ? -30 : 100}%`,
                    animation: `float ${1.5 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* 등급 뱃지 */}
            <div
              className="inline-block px-4 py-1 rounded-full text-[11px] font-black tracking-widest mb-3"
              style={{
                background: `${rarityColor}18`,
                border: `1px solid ${rarityColor}50`,
                color: rarityColor,
              }}
            >
              {rarityLabel} Lv.{stage.level}
            </div>

            {/* 이름 */}
            <div
              className="text-2xl md:text-3xl font-black mb-2"
              style={{ color: stat.c, textShadow: `0 0 30px ${stat.c}66` }}
            >
              {stat.em} {stage.name}
            </div>

            {/* 설명 */}
            <div className="text-sm text-white/60 max-w-[300px] mx-auto mb-4">
              &ldquo;{stage.desc}&rdquo;
            </div>

            {/* 도감 등록 안내 */}
            <div className="text-xs text-white/30 tracking-wider">
              📖 도감에 등록되었습니다
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
