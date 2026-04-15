"use client";
import { useRef } from "react";
import { STATS, EYES, MOUTHS, getBestTitle, TITLE_COLORS, RARITY_KO, getCombinationName, corruptionLevel, type StatsMap } from "@/data/stats";
import { getStatStage, getUnlockedForms, TOTAL_FORMS, type ActiveCombination } from "@/data/evolution";
import Radar from "./Radar";

interface Props {
  stats: StatsMap;
  totalClicks: number;
  enhanceAttempts: number;
  enhanceSuccesses: number;
  activeCombination?: ActiveCombination | null;
  onClose: () => void;
}

export default function ResultCard({ stats, totalClicks, enhanceAttempts, enhanceSuccesses, activeCombination, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  const top = STATS.find(s => s.id === sorted[0][0]) || STATS[0];
  const sub = STATS.find(s => s.id === sorted[1]?.[0]) || STATS[1];
  const title = getBestTitle(stats);
  const lv = corruptionLevel(total);
  const clampedLv = Math.min(lv, 5);
  const successRate = enhanceAttempts > 0 ? Math.round((enhanceSuccesses / enhanceAttempts) * 100) : 0;
  const evoStage = getStatStage(sorted[0][0], sorted[0][1]);
  const unlocked = getUnlockedForms(stats);

  const statusMsg =
    total >= 600 ? "이 신입은 이미 하나의 완전체입니다"
    : total >= 400 ? "뚜렷한 자아가 형성되었습니다"
    : total >= 200 ? "주변에서 캐릭터가 보이기 시작합니다"
    : total >= 100 ? "슬슬 본색이 드러나고 있습니다"
    : "아직은 정상적인 사회인입니다";

  const combinationName = activeCombination?.specialTitle?.title
    ?? (activeCombination ? getCombinationName(activeCombination.primary, activeCombination.secondaries) : null);

  const handleShare = async () => {
    const evoText = evoStage ? `진화: ${evoStage.deco[0]} ${evoStage.name} (Lv.${evoStage.level})` : "";
    const specialTitleText = activeCombination?.specialTitle
      ? `✨ [${RARITY_KO[activeCombination.specialTitle.rarity]}] ${activeCombination.specialTitle.title}`
      : "";
    const text = [
      `🏢 나의 직장인 성격 카드`,
      ``,
      `${EYES[clampedLv][0]} ${MOUTHS[clampedLv]} ${EYES[clampedLv][1]}`,
      ``,
      combinationName && !activeCombination?.specialTitle ? `나의 유형: ${combinationName}` : "",
      specialTitleText,
      `주 성향: ${top.em} ${top.name} ${sorted[0][1]}%`,
      `부 성향: ${sub.em} ${sub.name} ${sorted[1]?.[1] ?? 0}%`,
      evoText,
      `📖 도감 수집: ${unlocked.length}/${TOTAL_FORMS}`,
      `강화 ${enhanceAttempts}회 (성공률 ${successRate}%)`,
      ``,
      `"${statusMsg}"`,
      ``,
      `👉 너도 해봐!`,
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      await navigator.share({ title: "신입사원 스탯 빌더", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("결과가 클립보드에 복사됐어요! 카톡에 붙여넣기 하세요 ✌️");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-[400px] mx-4" style={{ animation: "modalIn .4s ease" }}>
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(20,18,30,0.98), rgba(12,10,22,0.98))",
            border: `2px solid ${top.c}30`,
          }}
        >
          {/* Header glow */}
          <div
            className="h-2 w-full"
            style={{ background: `linear-gradient(90deg, ${top.c}, ${sub.c})` }}
          />

          <div className="p-6 text-center">
            {/* TITLES 뱃지 — specialTitle 없을 때만 표시 */}
            {title && !activeCombination?.specialTitle && (
              <div
                className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4"
                style={{
                  background: `${TITLE_COLORS[title.rarity]}15`,
                  border: `1px solid ${TITLE_COLORS[title.rarity]}40`,
                  color: TITLE_COLORS[title.rarity],
                }}
              >
                {title.name}
              </div>
            )}

            {/* Character face */}
            <div
              className="mx-auto mb-3 flex flex-col items-center justify-center"
              style={{
                width: 140,
                height: 140,
                borderRadius: "46%",
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), transparent 22%), linear-gradient(145deg, ${top.c}20, rgba(9,9,11,0.95) 72%)`,
                border: `1px solid ${top.c}40`,
                boxShadow: `0 0 40px ${top.c}18`,
              }}
            >
              <div className="flex" style={{ gap: 16, fontSize: 30, color: "#fafafa" }}>
                <span>{EYES[clampedLv][0]}</span>
                <span>{EYES[clampedLv][1]}</span>
              </div>
              <div style={{ fontSize: 24, marginTop: 4, color: "#fafafa" }}>
                {MOUTHS[clampedLv]}
              </div>
            </div>

            {/* Evolution stage */}
            {evoStage && (
              <div className="flex items-center justify-center gap-1.5 mb-2">
                {evoStage.deco.map((d, i) => (
                  <span key={i} className="text-lg">{d}</span>
                ))}
                <span className="text-xs font-bold ml-1" style={{ color: top.c }}>
                  {evoStage.name}
                </span>
              </div>
            )}

            {/* 조합 캐릭터 이름 — specialTitle 있을 때는 badge가 title 포함하므로 생략 */}
            {combinationName && !activeCombination?.specialTitle && (
              <div className="text-base font-black mb-1" style={{ color: "#fafafa" }}>
                {combinationName}
              </div>
            )}
            {activeCombination?.specialTitle && (
              <div
                className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold mb-2"
                style={{
                  background: `${TITLE_COLORS[activeCombination.specialTitle.rarity]}15`,
                  border: `1px solid ${TITLE_COLORS[activeCombination.specialTitle.rarity]}40`,
                  color: TITLE_COLORS[activeCombination.specialTitle.rarity],
                }}
              >
                ✨ [{RARITY_KO[activeCombination.specialTitle.rarity]}] {activeCombination.specialTitle.title}
              </div>
            )}

            {/* Main stat */}
            <div className="text-xl font-black" style={{ color: top.c }}>
              {top.em} {top.name} {sorted[0][1]}%
            </div>
            <div className="text-sm text-[#71717a] mt-1">
              부 성향: {sub.em} {sub.name} {sorted[1]?.[1] ?? 0}%
            </div>

            {/* Radar */}
            <div className="my-4 flex justify-center">
              <Radar stats={stats} size={160} />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-white/[0.03] rounded-xl p-2.5">
                <div className="text-base font-extrabold">{totalClicks.toLocaleString()}</div>
                <div className="text-[10px] text-[#71717a]">클릭</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2.5">
                <div className="text-base font-extrabold">{enhanceAttempts}</div>
                <div className="text-[10px] text-[#71717a]">강화</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2.5">
                <div className="text-base font-extrabold">{successRate}%</div>
                <div className="text-[10px] text-[#71717a]">성공률</div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)" }}>
                <div className="text-base font-extrabold text-[#a5b4fc]">{unlocked.length}<span className="text-[10px] text-[#71717a]">/{TOTAL_FORMS}</span></div>
                <div className="text-[10px] text-[#818cf8]">도감</div>
              </div>
            </div>

            {/* Status message */}
            <div className="text-sm text-[#71717a] italic mb-4">
              &ldquo;{statusMsg}&rdquo;
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-full py-3.5 rounded-2xl text-base font-bold text-white cursor-pointer transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${top.c}, ${sub.c})` }}
            >
              📤 이 캐릭터 공유하기
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pb-4 text-[10px] text-zinc-700">
            신입사원 스탯 빌더 · 각성도 {total}%
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-sm cursor-pointer hover:bg-zinc-700 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
