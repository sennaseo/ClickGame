"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  STATS,
  SHOP,
  SCENARIOS,
  corruptionLevel,
  pick2,
  type Stat,
  type Scenario,
} from "@/data/stats";
import { useGameState } from "@/hooks/useGameState";
import { useUser } from "@/hooks/useUser";
import Radar from "@/components/Radar";
import Face from "@/components/Face";
import ChoiceModal from "@/components/ChoiceModal";
import Toast from "@/components/Toast";
import Burst from "@/components/Burst";

interface BurstData {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface ModalData {
  opts: [Stat, Stat];
  scene: Scenario;
}

interface FeedItem {
  id: number;
  text: string;
}

type MobileTab = "stats" | "feed" | "summary";

const FEED_LIMIT = 5;
const MOBILE_TABS: Array<{ id: MobileTab; label: string; emoji: string }> = [
  { id: "stats", label: "강화", emoji: "📊" },
  { id: "feed", label: "로그", emoji: "📝" },
  { id: "summary", label: "결과", emoji: "📣" },
];
const EVENT_MILESTONES = [10, 50, 100, 500, 1000, 2000, 5000];

export default function Home() {
  const { gameState, loading: gameLoading, addPoints, buyStat, eventStat } = useGameState();
  const { loading: userLoading, addClick, addSpent, logAction } = useUser();
  const { stats, totalClicks, bank } = gameState;

  const [bursts, setBursts] = useState<BurstData[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [autoClickEnabled, setAutoClickEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("stats");
  const [recentActions, setRecentActions] = useState<FeedItem[]>([
    { id: 1, text: "신입이 멀쩡한 척 출근했습니다." },
  ]);
  const burstId = useRef(1);

  const total = useMemo(() => Object.values(stats).reduce((sum, value) => sum + value, 0), [stats]);
  const lv = corruptionLevel(total);
  const sorted = useMemo(() => Object.entries(stats).sort((a, b) => b[1] - a[1]), [stats]);
  const dom = sorted[0];
  const domStat = STATS.find((stat) => stat.id === dom[0]) || STATS[0];
  const gainPerClick = lv >= 3 ? 3 : lv >= 1 ? 2 : 1;
  const statItems = SHOP.filter((item) => item.stat !== "random");
  const luckyItem = SHOP.find((item) => item.stat === "random") || SHOP[SHOP.length - 1];
  const nextMilestone = getNextEventMilestone(totalClicks);
  const prevMilestone = getPrevEventMilestone(totalClicks);
  const clicksUntilEvent = Math.max(nextMilestone - totalClicks, 0);
  const eventProgress = getEventProgress(totalClicks, prevMilestone, nextMilestone);
  const topStats = sorted
    .slice(0, 3)
    .map(([id, value]) => {
      const stat = STATS.find((item) => item.id === id)!;
      return `${stat.em} ${stat.name} ${value}%`;
    })
    .join(" · ");
  const impulseLabel = lv >= 4 ? "더 망가뜨리기" : lv >= 2 ? "한 번만 더 누르기" : "지금 눌러보기";

  const pushFeed = useCallback((text: string) => {
    setRecentActions((prev) => [{ id: Date.now() + Math.random(), text }, ...prev].slice(0, FEED_LIMIT));
  }, []);

  const fireShake = useCallback((duration: number) => {
    setShaking(true);
    setTimeout(() => setShaking(false), duration);
  }, []);

  const shareResult = useCallback(async () => {
    const lines = [
      "신입사원 스탯 빌더 결과",
      `오염도 Lv.${lv} / 총 ${total}%`,
      `대표 증상: ${domStat.em} ${domStat.name} ${dom[1]}%`,
      `진단: ${statusMsg(total, domStat.name)}`,
      `TOP 3: ${topStats}`,
    ];
    const text = `${lines.join("\n")}\n\n나도 신입 하나 망가뜨려보기`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "신입사원 스탯 빌더", text });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }

      setToast("결과 문구를 준비했어요. 지금 바로 퍼뜨리면 됩니다.");
      pushFeed("결과 공유 준비 완료. 단톡방 민폐 타이밍입니다.");
    } catch {
      setToast("공유는 취소됐지만 이 신입은 이미 끝났습니다.");
    }
  }, [dom, domStat, lv, pushFeed, topStats, total]);

  const performClick = useCallback(
    (coords?: { x: number; y: number }) => {
      if (modal) return;

      const projectedClicks = totalClicks + 1;
      const shouldOpenEvent = projectedClicks >= getNextEventMilestone(totalClicks);

      addPoints(gainPerClick);
      addClick(1);
      logAction("click", { earn: gainPerClick, source: coords ? "manual" : "auto" });

      const id = ++burstId.current;
      const emojis = ["💥", "⚡", "🔥", "💢", "✨", "😱", "💀"];
      const burstX =
        coords?.x ??
        (typeof window !== "undefined" ? Math.round(window.innerWidth / 2) : 0);
      const burstY =
        coords?.y ??
        (typeof window !== "undefined" ? Math.round(window.innerHeight / 2.6) : 0);
      setBursts((prev) => [
        ...prev,
        { id, x: burstX, y: burstY, emoji: emojis[Math.floor(Math.random() * emojis.length)] },
      ]);
      setTimeout(() => setBursts((prev) => prev.filter((item) => item.id !== id)), 600);
      fireShake(140);

      if (projectedClicks === 1 || projectedClicks % 25 === 0) {
        pushFeed(`클릭 ${projectedClicks}회 돌파. ${domStat.name} 기운이 더 진해졌습니다.`);
      }

      if (shouldOpenEvent) {
        const [a, b] = pick2();
        const scene = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        setTimeout(() => setModal({ opts: [a, b], scene }), 240);
        pushFeed(`이벤트 도착. ${projectedClicks}클릭 지점에서 사회생활이 다시 꼬였습니다.`);
      }
    },
    [addClick, addPoints, domStat.name, fireShake, gainPerClick, logAction, modal, pushFeed, totalClicks]
  );

  const doClick = useCallback(
    (e: React.MouseEvent) => {
      performClick({ x: e.clientX, y: e.clientY });
    },
    [performClick]
  );

  useEffect(() => {
    if (!autoClickEnabled || modal) return;

    const interval = window.setInterval(() => {
      performClick();
    }, 850);

    return () => window.clearInterval(interval);
  }, [autoClickEnabled, modal, performClick]);

  const toggleAutoClick = useCallback(() => {
    setAutoClickEnabled((prev) => {
      const next = !prev;
      setToast(next ? "자동 클릭 ON. 신입을 알아서 망가뜨리는 중..." : "자동 클릭 OFF. 다시 손맛 모드입니다.");
      pushFeed(next ? "자동 클릭을 켰습니다. 손 대신 집념이 클릭합니다." : "자동 클릭을 껐습니다. 다시 직접 괴롭힙니다.");
      return next;
    });
  }, [pushFeed]);

  const doPick = useCallback(
    (sid: string) => {
      const inc = lv >= 4 ? 12 : lv >= 2 ? 10 : 8;
      eventStat(sid, inc);
      logAction("event", { stat: sid, amount: inc });
      fireShake(260);

      const stat = STATS.find((item) => item.id === sid)!;
      setToast(`${stat.em} ${stat.name} +${inc}%!`);
      pushFeed(`이벤트 선택 완료. ${stat.em} ${stat.name} +${inc}%로 급발진했습니다.`);
      setModal(null);
    },
    [eventStat, fireShake, logAction, lv, pushFeed]
  );

  const doBuy = useCallback(
    (item: (typeof SHOP)[number]) => {
      if (bank < item.cost) return;

      const sid = item.stat === "random" ? STATS[Math.floor(Math.random() * STATS.length)].id : item.stat;
      buyStat(sid, item.amt, item.cost);
      addSpent(item.cost);
      logAction("buy", { item: item.id, stat: sid, amount: item.amt, cost: item.cost });
      fireShake(200);

      const stat = STATS.find((entry) => entry.id === sid)!;
      setToast(`${item.em} ${stat.name} +${item.amt}%`);
      pushFeed(`${item.em} ${item.name} 구매. ${stat.name} ${item.amt}% 상승.`);
    },
    [addSpent, bank, buyStat, fireShake, logAction, pushFeed]
  );

  if (gameLoading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="mb-4 text-6xl" style={{ animation: "float 2s ease-in-out infinite" }}>
            🧑‍💼
          </div>
          <div className="text-sm uppercase tracking-[0.24em] text-[#a5b4fc]">신입사원 스탯 빌더</div>
          <div className="mt-2 text-sm text-[#9ca3af]">신입이 출근 중입니다...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.14),_transparent_24%),_radial-gradient(circle_at_bottom,_rgba(244,63,94,0.1),_transparent_18%),_#09090b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02)_50%,transparent)] opacity-40" />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      {bursts.map((burst) => (
        <Burst key={burst.id} {...burst} />
      ))}
      {modal && <ChoiceModal opts={modal.opts} scene={modal.scene} onPick={doPick} />}

      <main className="relative z-[1] mx-auto w-full max-w-[1180px] px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#a5b4fc]">Interactive Toy</div>
            <h1
              className="mt-1 text-[1.9rem] font-black tracking-[-0.06em] text-white sm:text-[2.4rem]"
              style={{
                fontFamily: lv >= 5 ? "'Comic Sans MS', cursive" : "inherit",
                animation: lv >= 4 ? "shake .5s infinite" : "none",
              }}
            >
              이신입의운명은?
            </h1>
          </div>
          <button
            onClick={shareResult}
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(79,70,229,0.18)] transition hover:bg-white/12"
          >
            📣 공유
          </button>
        </header>

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,34,0.96),rgba(9,9,11,0.98))] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:p-4 lg:p-5">
          <div
            className="pointer-events-none absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[90px]"
            style={{ background: `${domStat.c}2f` }}
          />

          <div className="relative mx-auto grid max-w-[820px] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <HudMetric label="포인트" value={`${bank.toLocaleString()} pt`} accent />
            <HudMetric label="클릭" value={totalClicks.toLocaleString()} />
            <HudMetric label="오염도" value={`${total}%`} />
            <HudMetric label="이벤트" value={clicksUntilEvent === 0 ? "도착" : `${clicksUntilEvent}회`} />
          </div>

          <div className="relative mx-auto mt-3 max-w-[860px]">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
                <span>{domStat.em}</span>
                <span>{domStat.name}</span>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f43f5e33] bg-[#f43f5e1a] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
                <span>Lv.{lv}</span>
                <span>{impulseLabel}</span>
              </div>
            </div>

            <button
              onClick={doClick}
              disabled={Boolean(modal)}
              type="button"
              aria-label={`캐릭터 클릭하기. 현재 ${bank.toLocaleString()} 포인트, 클릭당 ${gainPerClick} 포인트 획득`}
              className="group relative block min-h-[560px] w-full overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.07),_transparent_30%),_linear-gradient(180deg,rgba(18,20,34,0.98),rgba(9,9,11,0.98))] p-4 text-center transition duration-150 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.36)] active:scale-[0.985] sm:min-h-[650px] sm:p-6"
            >
              <div
                className="pointer-events-none absolute left-1/2 top-[20%] h-[360px] w-[360px] -translate-x-1/2 rounded-full opacity-80 blur-[54px] sm:h-[420px] sm:w-[420px]"
                style={{ background: `${domStat.c}33`, animation: "pulseGlow 1.8s ease-in-out infinite" }}
              />
              <div
                className="pointer-events-none absolute left-1/2 bottom-[8%] h-[160px] w-[480px] -translate-x-1/2 rounded-full opacity-70 blur-[72px]"
                style={{ background: `${domStat.c}2c` }}
              />

              <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-5">
                <div className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-[0_0_24px_rgba(255,255,255,0.06)]">
                  {impulseLabel}
                </div>

                <Face lv={Math.min(lv, 5)} dominant={dom[0]} shaking={shaking} />

                <div className="space-y-2">
                  <div className="text-[3.4rem] font-black leading-none tracking-[-0.08em] text-white sm:text-[5.4rem]">
                    {bank.toLocaleString()}
                    <span className="ml-2 text-[0.28em] font-semibold text-[#a1a1aa]">pt</span>
                  </div>
                  <p className="mx-auto max-w-[440px] text-sm leading-6 text-[#d4d4d8] sm:text-base">{statusMsg(total, domStat.name)}</p>
                </div>

                <div className="w-full max-w-[620px] rounded-[26px] border border-white/10 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-left">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-[#c7d2fe]">Tap To Break</div>
                      <div className="mt-1 text-xl font-black text-white sm:text-2xl">여길 눌러서 인생 꼬이게 하기</div>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-black/30 px-4 py-3 text-right shadow-[0_0_28px_rgba(129,140,248,0.14)]">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#9ca3af]">Reward</div>
                      <div className="mt-1 text-2xl font-black text-white sm:text-3xl">+{gainPerClick}</div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="relative mx-auto mt-3 grid max-w-[820px] gap-3 sm:grid-cols-2">
            <InfoCard
              eyebrow="Breakdown"
              title={domStat.name}
              body={`${dom[1]}% 집중 / TOP 3: ${topStats}`}
            />
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">Next Event</div>
              <div className="mt-1 text-xl font-black text-white">{nextMilestone.toLocaleString()} 클릭</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#818cf8,#f43f5e)] transition-all duration-500"
                  style={{ width: `${eventProgress}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-[#d4d4d8]">{clicksUntilEvent}회만 더 누르면 선택지 등장</div>
              <button
                onClick={toggleAutoClick}
                type="button"
                className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-black transition ${
                  autoClickEnabled
                    ? "border-[#f43f5e55] bg-[#f43f5e1f] text-white"
                    : "border-white/12 bg-white/8 text-white hover:bg-white/12"
                }`}
              >
                {autoClickEnabled ? "자동 클릭 OFF" : "자동 클릭 ON"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(11,11,15,0.88)] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-4">
          <div className="grid grid-cols-3 gap-2">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-extrabold transition ${
                  activeTab === tab.id
                    ? "border-[#c7d2fe33] bg-[linear-gradient(180deg,rgba(129,140,248,0.2),rgba(255,255,255,0.05))] text-white shadow-[0_12px_28px_rgba(79,70,229,0.14)]"
                    : "border-white/10 bg-white/5 text-[#d4d4d8]"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === "stats" && (
              <StatsPanel stats={stats} bank={bank} doBuy={doBuy} statItems={statItems} luckyItem={luckyItem} />
            )}
            {activeTab === "feed" && <FeedPanel recentActions={recentActions} />}
            {activeTab === "summary" && (
              <SummaryPanel
                dom={dom}
                domStat={domStat}
                lv={lv}
                shareResult={shareResult}
                status={statusMsg(total, domStat.name)}
                topStats={topStats}
                total={total}
                totalClicks={totalClicks}
                stats={stats}
              />
            )}
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[1fr_1.35fr_1fr] gap-3 bg-[linear-gradient(180deg,rgba(9,9,11,0),rgba(9,9,11,0.94)_24%,rgba(9,9,11,0.98))] px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 sm:hidden">
          <button
            onClick={() => setActiveTab("stats")}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-4 text-sm font-extrabold text-white"
          >
            📊 강화
          </button>
          <button
            onClick={shareResult}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-[linear-gradient(135deg,rgba(129,140,248,0.22),rgba(129,140,248,0.1))] px-3 py-4 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(79,70,229,0.2)]"
          >
            📣 결과 공유
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-4 text-sm font-extrabold text-white"
          >
            ☠️ 결과
          </button>
        </div>
      </main>
    </div>
  );
}

function HudMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
        accent
          ? "border-[#c7d2fe33] bg-[linear-gradient(180deg,rgba(129,140,248,0.22),rgba(255,255,255,0.04))] shadow-[0_0_30px_rgba(129,140,248,0.14)]"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.22em] text-[#9ca3af]">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white sm:text-base">{value}</div>
    </div>
  );
}

function InfoCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">{eyebrow}</div>
      <div className="mt-1 text-xl font-black text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[#d4d4d8]">{body}</div>
    </div>
  );
}

function StatsPanel({
  stats,
  bank,
  doBuy,
  statItems,
  luckyItem,
}: {
  stats: Record<string, number>;
  bank: number;
  doBuy: (item: (typeof SHOP)[number]) => void;
  statItems: (typeof SHOP);
  luckyItem: (typeof SHOP)[number];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">Allocation Shop</div>
            <h2 className="mt-1 text-xl font-black text-white">망가뜨릴 방향 고르기</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-extrabold text-white">
            {bank.toLocaleString()} pt
          </div>
        </div>

        <div className="grid gap-3">
          {statItems.map((item) => {
            const stat = STATS.find((entry) => entry.id === item.stat)!;
            const value = stats[stat.id];
            const canBuy = bank >= item.cost;

            return (
              <button
                key={item.id}
                onClick={() => doBuy(item)}
                disabled={!canBuy}
                type="button"
                aria-label={`${stat.name} 강화. 비용 ${item.cost}포인트, 증가량 ${item.amt}퍼센트, 현재 ${value}퍼센트`}
                className="grid grid-cols-[56px_minmax(0,1fr)_84px] items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45 sm:grid-cols-[64px_minmax(0,1fr)_94px]"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 text-2xl sm:h-16 sm:w-16"
                  style={{ background: `${stat.c}16`, color: stat.c, boxShadow: `0 0 30px ${stat.c}20` }}
                >
                  {stat.em}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-extrabold text-white">{stat.name}</div>
                    <div className="text-sm font-bold text-white">{value}%</div>
                  </div>
                  <div className="mt-1 text-xs text-[#9ca3af]">{item.name}</div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${value}%`, background: `linear-gradient(90deg, ${stat.c}, transparent)` }}
                    />
                  </div>
                </div>
                <div
                  className={`rounded-[20px] border px-3 py-3 text-center ${
                    canBuy
                      ? "border-[#c7d2fe33] bg-[linear-gradient(180deg,rgba(129,140,248,0.22),rgba(255,255,255,0.04))] text-white"
                      : "border-white/10 bg-white/5 text-[#71717a]"
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-[0.22em]">Buy</div>
                  <div className="mt-1 text-lg font-black">{item.cost}pt</div>
                  <div className="text-[11px] text-[#cbd5e1]">+{item.amt}%</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">Breakdown Graph</div>
          <div className="mt-1 text-lg font-black text-white">현재 분포</div>
        </div>
        <div className="flex justify-center">
          <Radar stats={stats} size={220} />
        </div>
        <button
          onClick={() => doBuy(luckyItem)}
          disabled={bank < luckyItem.cost}
          type="button"
          className="w-full rounded-[24px] border border-[#fde68a33] bg-[radial-gradient(circle_at_top_right,rgba(253,230,138,0.12),transparent_30%),linear-gradient(135deg,rgba(245,158,11,0.1),rgba(255,255,255,0.04))] p-4 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#fde68a]">Random Spike</div>
          <div className="mt-1 text-lg font-black text-white">
            {luckyItem.em} {luckyItem.name}
          </div>
          <div className="mt-1 text-sm text-[#d4d4d8]">운에 맡기면 서사는 더 빨라집니다.</div>
        </button>
      </div>
    </div>
  );
}

function FeedPanel({ recentActions }: { recentActions: FeedItem[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">Activity Log</div>
          <h2 className="mt-1 text-xl font-black text-white">실시간 관찰일지</h2>
        </div>
        <div className="text-xs text-[#9ca3af]">최근 {recentActions.length}개</div>
      </div>
      <div className="grid gap-3">
        {recentActions.map((item, index) => (
          <div
            key={item.id}
            className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-[#d4d4d8]"
            style={{ animation: `fadeUp .25s ease ${index * 0.04}s both` }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryPanel({
  dom,
  domStat,
  lv,
  shareResult,
  status,
  topStats,
  total,
  totalClicks,
  stats,
}: {
  dom: [string, number];
  domStat: Stat;
  lv: number;
  shareResult: () => void;
  status: string;
  topStats: string;
  total: number;
  totalClicks: number;
  stats: Record<string, number>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.14),transparent_30%),rgba(255,255,255,0.04)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">Run Summary</div>
            <h2 className="mt-1 text-xl font-black text-white">지금 공유하면 웃긴 장면</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-extrabold text-white">Lv.{lv}</div>
        </div>

        <div className="mt-4 text-sm font-bold" style={{ color: domStat.c }}>
          {domStat.em} 대표 증상
        </div>
        <div className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">{domStat.name}</div>
        <p className="mt-3 text-sm leading-6 text-[#e4e4e7]">{status}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-[#d4d4d8]">
          <SummaryChip text={`클릭 ${totalClicks.toLocaleString()}회`} />
          <SummaryChip text={`오염도 ${total}%`} />
          <SummaryChip text={`${dom[1]}% 집중`} />
          <SummaryChip text="TOP 3 활성" />
        </div>

        <div className="mt-4 rounded-[20px] border border-white/10 bg-black/25 p-3">
          <div className="text-xs text-[#9ca3af]">TOP 3</div>
          <div className="mt-1 text-sm text-white">{topStats}</div>
        </div>

        <button
          onClick={shareResult}
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/14 bg-[linear-gradient(135deg,rgba(129,140,248,0.22),rgba(129,140,248,0.1))] px-4 py-4 text-sm font-black text-white"
        >
          📱 이 장면 공유하기
        </button>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a5b4fc]">Breakdown Graph</div>
        <div className="mt-1 text-lg font-black text-white">최종 분포</div>
        <div className="mt-4 flex justify-center">
          <Radar stats={stats} size={220} />
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ text }: { text: string }) {
  return <div className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3">{text}</div>;
}

function statusMsg(total: number, dominantName: string) {
  if (total === 0) return "아직은 멀쩡한 척합니다.";
  if (total >= 600) return "이 신입은 인간의 영역을 벗어났습니다.";
  if (total >= 400) return "정신건강의학과 예약이 필요합니다.";
  if (total >= 200) return "인사팀에서 면담 요청이 왔습니다.";
  if (total >= 100) return "약간 불안정한 기운이 감지됩니다.";
  return `${dominantName} 기질이 보이기 시작합니다.`;
}

function getNextEventMilestone(totalClicks: number) {
  for (const milestone of EVENT_MILESTONES) {
    if (totalClicks < milestone) return milestone;
  }

  const last = EVENT_MILESTONES[EVENT_MILESTONES.length - 1];
  const extraStep = 5000;
  return last + Math.ceil((totalClicks - last + 1) / extraStep) * extraStep;
}

function getPrevEventMilestone(totalClicks: number) {
  let previous = 0;

  for (const milestone of EVENT_MILESTONES) {
    if (milestone >= totalClicks) return previous;
    previous = milestone;
  }

  const last = EVENT_MILESTONES[EVENT_MILESTONES.length - 1];
  const extraStep = 5000;
  return last + Math.floor((totalClicks - last) / extraStep) * extraStep;
}

function getEventProgress(totalClicks: number, previous: number, next: number) {
  const distance = next - previous;
  if (distance <= 0) return 100;
  return Math.max(0, Math.min(((totalClicks - previous) / distance) * 100, 100));
}
