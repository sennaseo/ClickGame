"use client";
import { STATS, type StatsMap } from "@/data/stats";
import { EVOLUTIONS, TOTAL_FORMS, getUnlockedForms, getStatStage, getNextStage } from "@/data/evolution";

interface Props {
  stats: StatsMap;
  onClose: () => void;
}

export default function Collection({ stats, onClose }: Props) {
  const unlocked = getUnlockedForms(stats);
  const unlockedCount = unlocked.length;
  const completionPct = Math.round((unlockedCount / TOTAL_FORMS) * 100);

  const rarityColor = (level: number) =>
    level >= 5 ? "#fbbf24" :
    level >= 4 ? "#f093fb" :
    level >= 3 ? "#818cf8" :
    level >= 2 ? "#a1a1aa" : "#71717a";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />

      <div
        className="relative w-full max-w-[560px] mx-4 max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,30,0.98), rgba(12,10,22,0.98))",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "modalIn .4s ease",
        }}
      >
        {/* Header */}
        <div className="shrink-0 p-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-[#818cf8] tracking-wider mb-1">📖 진화 도감</div>
              <div className="text-lg font-black">
                {unlockedCount}<span className="text-sm font-semibold text-[#71717a]"> / {TOTAL_FORMS} 폼 수집</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: completionPct >= 80 ? "#fbbf24" : completionPct >= 40 ? "#818cf8" : "#71717a" }}>
                {completionPct}%
              </div>
              <div className="text-[10px] text-[#71717a]">완성도</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionPct}%`,
                background: completionPct >= 80
                  ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                  : completionPct >= 40
                  ? "linear-gradient(90deg, #818cf8, #6366f1)"
                  : "linear-gradient(90deg, #71717a, #52525b)",
              }}
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {EVOLUTIONS.map(evo => {
            const stat = STATS.find(s => s.id === evo.statId)!;
            const currentPercent = stats[evo.statId] || 0;
            const currentStage = getStatStage(evo.statId, currentPercent);
            const nextStage = getNextStage(evo.statId, currentPercent);
            const statUnlocked = evo.stages.filter(s => currentPercent >= s.minPercent).length;

            return (
              <div
                key={evo.statId}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${currentStage ? stat.c + "20" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {/* Stat header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{stat.em}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">{stat.name}</div>
                    <div className="text-[11px] text-[#71717a]">
                      {currentPercent}% · {statUnlocked}/{evo.stages.length} 해금
                      {nextStage && (
                        <span className="ml-1" style={{ color: stat.c }}>
                          · 다음: {nextStage.minPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  {currentStage && (
                    <div
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                      style={{
                        background: `${rarityColor(currentStage.level)}15`,
                        color: rarityColor(currentStage.level),
                        border: `1px solid ${rarityColor(currentStage.level)}30`,
                      }}
                    >
                      Lv.{currentStage.level}
                    </div>
                  )}
                </div>

                {/* Stages grid */}
                <div className="grid grid-cols-5 gap-1 px-3 pb-3">
                  {evo.stages.map(stage => {
                    const isUnlocked = currentPercent >= stage.minPercent;
                    const isCurrent = currentStage?.level === stage.level;

                    return (
                      <div
                        key={stage.level}
                        className="relative rounded-xl text-center transition-all duration-300"
                        style={{
                          padding: "10px 4px 8px",
                          background: isCurrent
                            ? `${stat.c}12`
                            : isUnlocked
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.2)",
                          border: isCurrent
                            ? `1px solid ${stat.c}40`
                            : "1px solid rgba(255,255,255,0.04)",
                          opacity: isUnlocked ? 1 : 0.4,
                        }}
                      >
                        {/* Deco emoji */}
                        <div className="text-2xl mb-1" style={{ filter: isUnlocked ? "none" : "grayscale(1) blur(2px)" }}>
                          {isUnlocked ? stage.deco[0] : "❓"}
                        </div>

                        {/* Name */}
                        <div
                          className="text-[9px] font-bold leading-tight truncate"
                          style={{ color: isUnlocked ? rarityColor(stage.level) : "#52525b" }}
                        >
                          {isUnlocked ? stage.name : `${stage.minPercent}%`}
                        </div>

                        {/* Level dot */}
                        <div className="flex justify-center gap-0.5 mt-1.5">
                          {Array.from({ length: stage.level }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{
                                background: isUnlocked ? rarityColor(stage.level) : "#333",
                              }}
                            />
                          ))}
                        </div>

                        {/* Current indicator */}
                        {isCurrent && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold"
                            style={{ background: stat.c, color: "#000" }}
                          >
                            ★
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current stage description */}
                {currentStage && (
                  <div className="px-4 pb-3">
                    <div className="text-[11px] text-[#71717a] italic">
                      &ldquo;{currentStage.desc}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-white/[0.06] text-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-2xl text-sm font-bold cursor-pointer transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "inherit",
              color: "#fafafa",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
