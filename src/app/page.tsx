"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import {
  STATS, SHOP, SCENARIOS,
  corruptionLevel, pick2,
  type Stat, type Scenario,
} from "@/data/stats";
import { useGameState } from "@/hooks/useGameState";
import { useUser } from "@/hooks/useUser";
import Radar from "@/components/Radar";
import Face from "@/components/Face";
import ChoiceModal from "@/components/ChoiceModal";
import Toast from "@/components/Toast";
import Burst from "@/components/Burst";

interface BurstData { id: number; x: number; y: number; emoji: string }
interface ModalData { opts: [Stat, Stat]; scene: Scenario }

export default function Home() {
  const { gameState, loading: gameLoading, addPoints, buyStat, eventStat } = useGameState();
  const { userId, loading: userLoading, addClick, addSpent, logAction } = useUser();

  const { stats, totalClicks, bank } = gameState;

  const [bursts, setBursts] = useState<BurstData[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const bid = useRef(0);
  const sincePick = useRef(0);

  const total = useMemo(() => Object.values(stats).reduce((a, b) => a + b, 0), [stats]);
  const lv = corruptionLevel(total);
  const sorted = useMemo(() => Object.entries(stats).sort((a, b) => b[1] - a[1]), [stats]);
  const dom = sorted[0];
  const domStat = STATS.find((s) => s.id === dom[0]) || STATS[0];
  const nextChoice = 10 - sincePick.current;

  // ─── Click ───
  const doClick = useCallback(
    (e: React.MouseEvent) => {
      if (modal) return;
      const earn = lv >= 3 ? 3 : lv >= 1 ? 2 : 1;
      addPoints(earn);
      addClick(1);
      logAction("click", { earn });
      sincePick.current += 1;

      const id = ++bid.current;
      const ems = ["💥", "⚡", "🔥", "💢", "✨", "😱", "💀"];
      setBursts((p) => [...p, { id, x: e.clientX, y: e.clientY, emoji: ems[Math.floor(Math.random() * ems.length)] }]);
      setTimeout(() => setBursts((p) => p.filter((b) => b.id !== id)), 600);
      setShaking(true);
      setTimeout(() => setShaking(false), 120);

      if (sincePick.current >= 10) {
        sincePick.current = 0;
        const [a, b] = pick2();
        const sc = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        setTimeout(() => setModal({ opts: [a, b], scene: sc }), 300);
      }
    },
    [lv, modal, addPoints, addClick, logAction]
  );

  // ─── Event pick ───
  const doPick = useCallback(
    (sid: string) => {
      const inc = lv >= 4 ? 12 : lv >= 2 ? 10 : 8;
      eventStat(sid, inc);
      logAction("event", { stat: sid, amount: inc });
      setShaking(true);
      setTimeout(() => setShaking(false), 250);
      const st = STATS.find((s) => s.id === sid)!;
      setToast(`${st.em} ${st.name} +${inc}%!`);
      setModal(null);
    },
    [lv, eventStat, logAction]
  );

  // ─── Shop buy ───
  const doBuy = useCallback(
    (item: (typeof SHOP)[number]) => {
      if (bank < item.cost) return;
      const sid = item.stat === "random" ? STATS[Math.floor(Math.random() * STATS.length)].id : item.stat;
      buyStat(sid, item.amt, item.cost);
      addSpent(item.cost);
      logAction("buy", { item: item.id, stat: sid, amount: item.amt, cost: item.cost });
      setShaking(true);
      setTimeout(() => setShaking(false), 200);
      const st = STATS.find((s) => s.id === sid)!;
      setToast(`${item.em} ${st.name} +${item.amt}%`);
    },
    [bank, buyStat, addSpent, logAction]
  );

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
      <div
        className="fixed pointer-events-none transition-all duration-[2000ms]"
        style={{
          top: "-30%", right: "-20%", width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle,${domStat.c}08,transparent 70%)`,
        }}
      />
      <div
        className="fixed pointer-events-none transition-all duration-[2000ms]"
        style={{
          bottom: "-30%", left: "-20%", width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle,${domStat.c}05,transparent 70%)`,
        }}
      />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      {bursts.map((b) => <Burst key={b.id} {...b} />)}
      {modal && <ChoiceModal opts={modal.opts} scene={modal.scene} onPick={doPick} />}

      {/* ═══ Main container ═══ */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-6 relative z-[1] md:h-screen md:flex md:flex-col">

        {/* Title */}
        <div className="text-center mb-6 md:mb-5 shrink-0">
          <div className="text-xs md:text-sm font-semibold text-[#818cf8] tracking-wider mb-2">
            ✦ 신입사원 스탯 빌더
          </div>
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: lv >= 5 ? 40 : 32,
              fontFamily: lv >= 5 ? "'Comic Sans MS',cursive" : "inherit",
              animation: lv >= 4 ? "shake .5s infinite" : "none",
            }}
          >
            {lv >= 5 ? "이 신입은 끝났다" : lv >= 3 ? "위험 수위 돌파" : "이 신입의 운명은?"}
          </h1>
          <div className="text-xs md:text-sm text-[#71717a] mt-2">
            ⚡ {totalClicks.toLocaleString()}클릭 · ☠️ {total}% · 다음 이벤트 {nextChoice}클릭
          </div>
        </div>

        {/* ═══ Desktop: 2-column / Mobile: 1-column ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-5 md:flex-1 md:min-h-0">

          {/* ─── Left column: Character ─── */}
          <div
            onClick={doClick}
            className="rounded-2xl md:rounded-3xl text-center select-none transition-transform duration-150 flex flex-col items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "40px 28px 32px",
              cursor: modal ? "not-allowed" : "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Face lv={Math.min(lv, 5)} dominant={dom[0]} shaking={shaking} />
            <div className="mt-4 text-base md:text-lg font-bold" style={{ color: domStat.c }}>
              {domStat.em} {domStat.name} {dom[1]}%
            </div>
            <div className="text-sm text-zinc-700 mt-1">{statusMsg}</div>

            {/* Point bank */}
            <div className="mt-5 inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-6 py-2 rounded-2xl">
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: domStat.c }}>
                {bank.toLocaleString()}
              </span>
              <span className="text-sm text-[#71717a]">pt</span>
            </div>
            <div className="text-xs text-zinc-800 mt-2" style={{ animation: "breathe 2s infinite" }}>
              눌러서 포인트 모으기
            </div>
          </div>

          {/* ─── Right column: Radar + Shop ─── */}
          <div className="flex flex-col gap-4 md:gap-3 md:min-h-0">

            {/* Radar */}
            <div
              className="rounded-2xl md:rounded-3xl p-4 md:p-5 flex justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Radar stats={stats} size={240} />
            </div>

            {/* Shop toggle — mobile only */}
            <button
              onClick={() => setShopOpen((p) => !p)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 md:hidden shrink-0"
              style={{
                background: shopOpen ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.035)",
                border: `1px solid ${shopOpen ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.07)"}`,
                fontFamily: "inherit",
                color: "#fafafa",
              }}
            >
              🛒 상점
              <span className="text-xs font-semibold text-[#71717a]">({bank.toLocaleString()}pt 보유)</span>
              <span
                className="text-[11px] transition-transform duration-200"
                style={{ transform: shopOpen ? "rotate(180deg)" : "rotate(0)" }}
              >
                ▼
              </span>
            </button>

            {/* Shop header — desktop only */}
            <div className="hidden md:flex items-center justify-between px-1 shrink-0">
              <div className="text-sm font-bold text-[#71717a]">🛒 상점</div>
              <div className="text-sm font-semibold text-[#818cf8]">{bank.toLocaleString()}pt 보유</div>
            </div>

            {/* Shop items — always open on desktop (scrollable), toggle on mobile */}
            <div
              className={`rounded-2xl p-3 grid grid-cols-2 gap-1.5 ${shopOpen ? "block" : "hidden"} md:grid md:flex-1 md:min-h-0 md:overflow-y-auto md:content-start`}
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {SHOP.map((item) => {
                const stat = STATS.find((s) => s.id === item.stat);
                const canBuy = bank >= item.cost;
                return (
                  <button
                    key={item.id}
                    onClick={() => doBuy(item)}
                    disabled={!canBuy}
                    className="flex items-center gap-2 rounded-xl transition-all duration-200 text-left h-fit"
                    style={{
                      padding: "10px 12px",
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: canBuy ? "rgba(255,255,255,0.02)" : "transparent",
                      cursor: canBuy ? "pointer" : "not-allowed",
                      opacity: canBuy ? 1 : 0.3,
                      fontFamily: "inherit",
                      color: "#fafafa",
                    }}
                  >
                    <span className="text-xl shrink-0">{item.em}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[10px] text-[#71717a]">
                        {item.cost}pt → {item.stat === "random" ? "랜덤" : stat?.em} +{item.amt}%
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
          Lv.{lv} · 총 오염도 {total}%
        </div>
      </div>
    </div>
  );
}
