"use client";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  STATS, ENHANCE_ITEMS, SCENARIOS, INITIAL_STATS,
  corruptionLevel, getBestTitle, TITLE_COLORS, RARITY_KO,
  type StatsMap, type Scenario,
} from "@/data/stats";
import { checkEvolution, getUnlockedForms, TOTAL_FORMS, getStatStage, getNextStage, getActiveCombination, type ActiveCombination } from "@/data/evolution";
import type { EvolutionStage } from "@/data/evolution";
import { useGameState } from "@/hooks/useGameState";
import { useUser } from "@/hooks/useUser";
import Radar from "@/components/Radar";
import Face from "@/components/Face";
import ChoiceModal from "@/components/ChoiceModal";
import EnhanceResult from "@/components/EnhanceResult";
import EvolutionAlert from "@/components/EvolutionAlert";
import ResultCard from "@/components/ResultCard";
import Collection from "@/components/Collection";
import Toast from "@/components/Toast";
import Burst from "@/components/Burst";

interface BurstData { id: number; x: number; y: number; emoji: string }

export default function Home() {
  const { gameState, loading: gameLoading, addPoints, buyStat, eventStat } = useGameState();
  const { loading: userLoading, addClick, addSpent, logAction } = useUser();
  const { stats, totalClicks, bank } = gameState;

  const [bursts, setBursts] = useState<BurstData[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [enhanceResult, setEnhanceResult] = useState<{ statId: string; success: boolean; amount: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [evolutionAlert, setEvolutionAlert] = useState<{ statId: string; stage: EvolutionStage } | null>(null);
  const [pendingEvolution, setPendingEvolution] = useState<{ statId: string; stage: EvolutionStage } | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [enhanceAttempts, setEnhanceAttempts] = useState(0);
  const [enhanceSuccesses, setEnhanceSuccesses] = useState(0);
  const [pendingSpecialTitle, setPendingSpecialTitle] = useState<ActiveCombination["specialTitle"]>(null);
  const bid = useRef(0);
  const sincePick = useRef(0);
  const prevSpecialTitleRef = useRef<string | null>(null);

  const total = useMemo(() => Object.values(stats).reduce((a, b) => a + b, 0), [stats]);
  const lv = corruptionLevel(total);
  const sorted = useMemo(() => Object.entries(stats).sort((a, b) => b[1] - a[1]), [stats]);
  // 개별 스탯 값 의존 — stats 객체 ref는 매 렌더마다 새로 생성되므로 사용 불가
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeCombination = useMemo(() => getActiveCombination(stats),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats.anger, stats.peterpan, stats.avoidant, stats.menhera, stats.tsundere, stats.chuuni, stats.simp, stats.delusion]
  );
  const dom = sorted[0];
  const domStat = STATS.find(s => s.id === dom[0]) || STATS[0];
  const title = useMemo(() => getBestTitle(stats), [stats]);
  const nextChoice = 10 - sincePick.current;
  const isModalOpen = !!scenario || !!enhanceResult || showResult || showCollection || !!evolutionAlert;
  const unlockedForms = useMemo(() => getUnlockedForms(stats), [stats]);
  const domEvo = useMemo(() => getStatStage(dom[0], dom[1]), [dom]);

  // specialTitle이 새로 달성됐을 때만 토스트 발동
  useEffect(() => {
    const currentTitle = activeCombination?.specialTitle?.title ?? null;
    if (currentTitle && currentTitle !== prevSpecialTitleRef.current) {
      setPendingSpecialTitle(activeCombination!.specialTitle);
    }
    prevSpecialTitleRef.current = currentTitle;
  }, [activeCombination]);

  // ─── Click ───
  const doClick = useCallback((e: React.MouseEvent) => {
    if (isModalOpen) return;
    const earn = lv >= 3 ? 3 : lv >= 1 ? 2 : 1;
    addPoints(earn);
    addClick(1);
    logAction("click", { earn });
    sincePick.current += 1;

    const id = ++bid.current;
    const ems = ["💥", "⚡", "🔥", "💢", "✨", "😱", "💀"];
    setBursts(p => [...p, { id, x: e.clientX, y: e.clientY, emoji: ems[Math.floor(Math.random() * ems.length)] }]);
    setTimeout(() => setBursts(p => p.filter(b => b.id !== id)), 600);
    setShaking(true);
    setTimeout(() => setShaking(false), 120);

    if (sincePick.current >= 10) {
      sincePick.current = 0;
      const sc = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      setTimeout(() => setScenario(sc), 300);
    }
  }, [lv, isModalOpen, addPoints, addClick, logAction]);

  // ─── Scenario pick → 강화 시도 (확률!) ───
  const doPick = useCallback((sid: string) => {
    const inc = lv >= 4 ? 12 : lv >= 2 ? 10 : 8;
    const success = Math.random() < 0.65;
    setEnhanceAttempts(p => p + 1);
    const prevVal = stats[sid] || 0;

    if (success) {
      setEnhanceSuccesses(p => p + 1);
      eventStat(sid, inc);
      logAction("event", { stat: sid, amount: inc, success: true });
      setEnhanceResult({ statId: sid, success: true, amount: inc });
      // 진화 체크
      const newVal = Math.min(prevVal + inc, 100);
      const evo = checkEvolution(sid, prevVal, newVal);
      if (evo) setPendingEvolution({ statId: sid, stage: evo });
    } else {
      const loss = Math.floor(inc * 0.3);
      eventStat(sid, -loss);
      logAction("event", { stat: sid, amount: -loss, success: false });
      setEnhanceResult({ statId: sid, success: false, amount: -loss });
    }
    setScenario(null);
  }, [lv, stats, eventStat, logAction]);

  // ─── Shop enhance (확률 기반!) ───
  const doEnhance = useCallback((item: (typeof ENHANCE_ITEMS)[number]) => {
    if (bank < item.cost) return;
    const sid = item.stat === "random" ? STATS[Math.floor(Math.random() * STATS.length)].id : item.stat;
    const success = Math.random() < item.successRate;
    setEnhanceAttempts(p => p + 1);
    const prevVal = stats[sid] || 0;

    buyStat(sid, success ? item.successAmt : item.failAmt, item.cost);
    addSpent(item.cost);

    if (success) {
      setEnhanceSuccesses(p => p + 1);
      logAction("buy", { item: item.id, stat: sid, amount: item.successAmt, success: true });
      setEnhanceResult({ statId: sid, success: true, amount: item.successAmt });
      // 진화 체크
      const newVal = Math.min(prevVal + item.successAmt, 100);
      const evo = checkEvolution(sid, prevVal, newVal);
      if (evo) setPendingEvolution({ statId: sid, stage: evo });
    } else {
      logAction("buy", { item: item.id, stat: sid, amount: item.failAmt, success: false });
      setEnhanceResult({ statId: sid, success: false, amount: item.failAmt });
    }
  }, [bank, stats, buyStat, addSpent, logAction]);

  // ─── Status message ───
  const statusMsg = useMemo(() => {
    if (total === 0) return "아직 정상적인 사회인입니다";
    if (total >= 600) return "이 신입은 인간의 영역을 벗어났습니다";
    if (total >= 400) return "정신건강의학과 예약이 필요합니다";
    if (total >= 200) return "인사팀에서 면담 요청이 왔습니다";
    if (total >= 100) return "약간 불안정한 기운이 감지됩니다";
    return `${domStat.name} 기질이 보이기 시작합니다`;
  }, [total, domStat]);

  // ─── Loading ───
  if (gameLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ animation: "float 2s ease-in-out infinite" }}>🧑‍💼</div>
          <div className="text-sm text-[#71717a]">신입사원 출근 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BG glow */}
      <div className="fixed pointer-events-none transition-all duration-[2000ms]" style={{ top: "-30%", right: "-20%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${domStat.c}08,transparent 70%)` }} />
      <div className="fixed pointer-events-none transition-all duration-[2000ms]" style={{ bottom: "-30%", left: "-20%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${domStat.c}05,transparent 70%)` }} />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      {/* specialTitle 토스트 — EvolutionAlert와 겹치지 않게 */}
      {!evolutionAlert && pendingSpecialTitle && (
        <Toast
          msg={`✨ [${RARITY_KO[pendingSpecialTitle.rarity]}] ${pendingSpecialTitle.title}`}
          onDone={() => setPendingSpecialTitle(null)}
        />
      )}
      {bursts.map(b => <Burst key={b.id} {...b} />)}
      {scenario && <ChoiceModal scenario={scenario} onPick={doPick} />}
      {enhanceResult && (
        <EnhanceResult
          statId={enhanceResult.statId}
          success={enhanceResult.success}
          amount={enhanceResult.amount}
          onDone={() => {
            setEnhanceResult(null);
            setShaking(true);
            setTimeout(() => setShaking(false), 250);
            // 진화 대기 중이면 진화 알림 표시
            if (pendingEvolution) {
              setTimeout(() => {
                setEvolutionAlert(pendingEvolution);
                setPendingEvolution(null);
              }, 300);
            }
          }}
        />
      )}
      {evolutionAlert && (
        <EvolutionAlert
          statId={evolutionAlert.statId}
          stage={evolutionAlert.stage}
          onDone={() => {
            setEvolutionAlert(null);
            // evo 대기 중 stats가 30% 밑으로 내려갔을 수 있으므로 재검증
            setPendingSpecialTitle(prev => {
              if (!prev) return null;
              const current = getActiveCombination(stats);
              return current?.specialTitle?.title === prev.title ? prev : null;
            });
          }}
        />
      )}
      {showCollection && (
        <Collection stats={stats} onClose={() => setShowCollection(false)} />
      )}
      {showResult && (
        <ResultCard
          stats={stats}
          totalClicks={totalClicks}
          enhanceAttempts={enhanceAttempts}
          enhanceSuccesses={enhanceSuccesses}
          activeCombination={activeCombination}
          onClose={() => setShowResult(false)}
        />
      )}

      {/* Main container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-6 relative z-[1] md:h-screen md:flex md:flex-col">

        {/* Title */}
        <div className="text-center mb-6 md:mb-5 shrink-0">
          <div className="text-xs md:text-sm font-semibold text-[#818cf8] tracking-wider mb-2">✦ 신입사원 스탯 빌더</div>
          <h1 className="font-black tracking-tight" style={{
            fontSize: lv >= 5 ? 40 : 32,
            fontFamily: lv >= 5 ? "'Comic Sans MS',cursive" : "inherit",
            animation: lv >= 4 ? "shake .5s infinite" : "none",
          }}>
            {lv >= 5 ? "이 신입은 끝났다" : lv >= 3 ? "위험 수위 돌파" : "이 신입의 운명은?"}
          </h1>
          <div className="text-xs md:text-sm text-[#71717a] mt-2">
            ⚡ {totalClicks.toLocaleString()}클릭 · ☠️ {total}% · 다음 이벤트 {nextChoice}클릭
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-5 md:flex-1 md:min-h-0">

          {/* Left: Character */}
          <div
            onClick={doClick}
            className="rounded-2xl md:rounded-3xl text-center select-none transition-transform duration-150 flex flex-col items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)",
              padding: "40px 28px 32px", cursor: isModalOpen ? "not-allowed" : "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Face lv={Math.min(lv, 5)} dominant={dom[0]} shaking={shaking} stats={stats} activeCombination={activeCombination} />

            {/* specialTitle이 없을 때만 기존 TITLES 뱃지 표시 */}
            {title && !activeCombination?.specialTitle && (
              <div className="mt-3 inline-block px-3 py-1 rounded-full text-[11px] font-bold" style={{
                background: `${TITLE_COLORS[title.rarity]}12`,
                border: `1px solid ${TITLE_COLORS[title.rarity]}30`,
                color: TITLE_COLORS[title.rarity],
              }}>
                {title.name}
              </div>
            )}

            <div className="mt-3 text-base md:text-lg font-bold" style={{ color: domStat.c }}>
              {domStat.em} {domStat.name} {dom[1]}%
            </div>
            <div className="text-sm text-zinc-700 mt-1">{statusMsg}</div>

            <div className="mt-5 inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-6 py-2 rounded-2xl">
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: domStat.c }}>{bank.toLocaleString()}</span>
              <span className="text-sm text-[#71717a]">pt</span>
            </div>
            <div className="text-xs text-zinc-800 mt-2" style={{ animation: "breathe 2s infinite" }}>눌러서 포인트 모으기</div>

            {/* 진화 진행도 + 다음 단계 미리보기 */}
            {domEvo && (
              <div className="mt-2 text-[11px] text-[#71717a]">
                {(() => {
                  const next = getNextStage(dom[0], dom[1]);
                  return next
                    ? <span>다음 진화: <span style={{ color: domStat.c }}>{next.name}</span> ({next.minPercent}%)</span>
                    : <span style={{ color: "#fbbf24" }}>MAX 진화 달성!</span>;
                })()}
              </div>
            )}

            {/* 버튼 행 */}
            {total > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-[320px]">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowResult(true); }}
                  className="py-3 rounded-2xl text-xs font-extrabold cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${domStat.c}25, ${domStat.c}10)`,
                    border: `1px solid ${domStat.c}40`, color: domStat.c,
                  }}
                >
                  📤 결과 공유
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowCollection(true); }}
                  className="py-3 rounded-2xl text-xs font-extrabold cursor-pointer transition-all hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(129,140,248,0.15), rgba(129,140,248,0.05))",
                    border: "1px solid rgba(129,140,248,0.3)",
                    color: "#a5b4fc",
                  }}
                >
                  📖 도감 <span className="font-black text-white">{unlockedForms.length}</span>/{TOTAL_FORMS}
                </button>
              </div>
            )}
          </div>

          {/* Right: Radar + Enhance Shop */}
          <div className="flex flex-col gap-4 md:gap-3 md:min-h-0">
            <div className="rounded-2xl md:rounded-3xl p-4 md:p-5 flex justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Radar stats={stats} size={240} />
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setShopOpen(p => !p)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 md:hidden shrink-0"
              style={{
                background: shopOpen ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.035)",
                border: `1px solid ${shopOpen ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.07)"}`,
                fontFamily: "inherit", color: "#fafafa",
              }}
            >
              ⚔️ 강화
              <span className="text-xs font-semibold text-[#71717a]">({bank.toLocaleString()}pt)</span>
              <span className="text-[11px] transition-transform duration-200" style={{ transform: shopOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </button>

            {/* Desktop header */}
            <div className="hidden md:flex items-center justify-between px-1 shrink-0">
              <div className="text-sm font-bold text-[#71717a]">⚔️ 강화</div>
              <div className="text-sm font-semibold text-[#818cf8]">{bank.toLocaleString()}pt 보유</div>
            </div>

            {/* Enhance items */}
            <div
              className={`rounded-2xl p-3 grid grid-cols-2 gap-1.5 ${shopOpen ? "block" : "hidden"} md:grid md:flex-1 md:min-h-0 md:overflow-y-auto md:content-start`}
              style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {ENHANCE_ITEMS.map(item => {
                const stat = STATS.find(s => s.id === item.stat);
                const canBuy = bank >= item.cost;
                return (
                  <button
                    key={item.id}
                    onClick={() => doEnhance(item)}
                    disabled={!canBuy}
                    className="flex items-center gap-2 rounded-xl transition-all duration-200 text-left h-fit"
                    style={{
                      padding: "10px 12px", border: "1px solid rgba(255,255,255,0.07)",
                      background: canBuy ? "rgba(255,255,255,0.02)" : "transparent",
                      cursor: canBuy ? "pointer" : "not-allowed", opacity: canBuy ? 1 : 0.3,
                      fontFamily: "inherit", color: "#fafafa",
                    }}
                  >
                    <span className="text-xl shrink-0">{item.em}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[10px] text-[#71717a]">
                        {item.cost}pt · {Math.round(item.successRate * 100)}% → {item.stat === "random" ? "랜덤" : stat?.em} +{item.successAmt}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-3 text-[10px] md:text-xs text-zinc-800 shrink-0">
          Lv.{lv} · 총 오염도 {total}% · 강화 {enhanceAttempts}회 (성공 {enhanceSuccesses}회)
        </div>
      </div>
    </div>
  );
}
