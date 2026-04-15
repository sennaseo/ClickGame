"use client";

import { motion, useAnimationControls } from "motion/react";
import { useEffect, useRef } from "react";
import { STATS, EYES, MOUTHS, STAT_DECO_LAYERS, TITLE_COLORS, type StatsMap } from "@/data/stats";
import { getStatStage, type ActiveCombination } from "@/data/evolution";

interface FaceProps {
  lv: number;
  dominant: string;
  shaking: boolean;
  stats?: StatsMap;
  activeCombination?: ActiveCombination | null;
}

export default function Face({ lv, dominant, shaking, stats, activeCombination }: FaceProps) {
  const stat = STATS.find((item) => item.id === dominant) || STATS[0];
  const paint = lv >= 5;
  const clampedLv = Math.min(lv, 5);
  const controls = useAnimationControls();
  const prevLv = useRef(lv);

  // 진화 단계 데코 이모지
  const domPercent = stats?.[dominant] || 0;
  const evoStage = getStatStage(dominant, domPercent);

  // 부 성향 데코 (최대 2개 × 이모지 1개)
  const secondaryDecos = activeCombination
    ? activeCombination.secondaries
        .slice(0, 2)
        .map(id => STAT_DECO_LAYERS[id]?.[0] ?? "")
        .filter(Boolean)
    : [];

  // evolution 데코 + 부 성향 데코 합산 (각도 공식이 자동 재분배)
  const allDecos = evoStage
    ? [...evoStage.deco, ...secondaryDecos]
    : secondaryDecos;

  const specialTitle = activeCombination?.specialTitle ?? null;

  // squash/stretch on click
  useEffect(() => {
    if (shaking) {
      controls.start({
        scaleX: [1, 1.12, 0.94, 1.03, 1],
        scaleY: [1, 0.88, 1.08, 0.97, 1],
        transition: { duration: 0.35, ease: "easeOut", type: "tween" },
      });
    }
  }, [shaking, controls]);

  // dramatic morph on level change
  useEffect(() => {
    if (prevLv.current !== lv) {
      controls.start({
        scale: [1, 1.18, 0.92, 1.06, 1],
        rotate: [0, -4, 4, -2, 0],
        transition: { duration: 0.5, ease: "easeInOut", type: "tween" },
      });
      prevLv.current = lv;
    }
  }, [lv, controls]);

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={controls}
      style={{ willChange: "transform" }}
    >
      {/* idle breathing */}
      <motion.div
        className="absolute inset-0"
        animate={
          lv >= 4
            ? { rotate: [0, -2, 2, -2, 0] }
            : { y: [0, -5, 0] }
        }
        transition={
          lv >= 4
            ? { duration: 0.25, repeat: Infinity, ease: "easeInOut", type: "tween" }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut", type: "tween" }
        }
      >
        {/* halo glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1.15, 1.3, 1.15],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", type: "tween" }}
          style={{
            background: paint
              ? "rgba(255,255,0,0.25)"
              : evoStage
              ? `radial-gradient(circle, ${evoStage.aura} 0%, transparent 72%)`
              : `radial-gradient(circle, ${stat.c}55 0%, transparent 72%)`,
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
            <motion.span
              key={`eye-l-${clampedLv}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {EYES[clampedLv][0]}
            </motion.span>
            <motion.span
              key={`eye-r-${clampedLv}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
            >
              {EYES[clampedLv][1]}
            </motion.span>
          </div>
          <motion.div
            key={`mouth-${clampedLv}`}
            initial={{ scale: 0.4, opacity: 0, y: 4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.08 }}
            style={{
              fontSize: paint ? 38 : 34,
              marginTop: 6,
              color: paint ? "#111827" : "#fafafa",
            }}
          >
            {MOUTHS[clampedLv]}
          </motion.div>

          <motion.div
            className="absolute bottom-4 rounded-full border border-white/10 bg-black/25 px-4 py-1.5 text-xs font-bold text-white"
            key={`lv-badge-${clampedLv}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            Growth Lv.{clampedLv}
          </motion.div>
        </div>
      </motion.div>

      {/* invisible spacer to maintain layout */}
      <div style={{ width: 220, height: 220 }} />

      {/* 특수 칭호 뱃지 — Face 최상단 */}
      {specialTitle && (
        <motion.div
          key={specialTitle.title}
          role="status"
          aria-live="polite"
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap max-w-[200px] truncate z-10"
          style={{
            background: `${TITLE_COLORS[specialTitle.rarity]}18`,
            border: `1px solid ${TITLE_COLORS[specialTitle.rarity]}50`,
            color: TITLE_COLORS[specialTitle.rarity],
            boxShadow: `0 0 16px ${TITLE_COLORS[specialTitle.rarity]}30`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          ✨ {specialTitle.title}
        </motion.div>
      )}

      {/* 데코 이모지 — evolution 데코 + 부 성향 데코 합산, 캐릭터 주변에 떠다님 */}
      {allDecos.map((emoji, i) => {
        const angle = (360 / allDecos.length) * i;
        const radius = 130 + (i % 2) * 15;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <motion.span
            key={`deco-${emoji}-${i}`}
            className="absolute pointer-events-none text-xl md:text-2xl"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: x - 12,
              marginTop: y - 12,
              filter: `drop-shadow(0 0 8px ${stat.c}88)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0.85, 1.1, 0.85],
              opacity: [0.6, 1, 0.6],
              y: [0, -6, 0],
            }}
            transition={{
              duration: 2.5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
              type: "tween",
            }}
          >
            {emoji}
          </motion.span>
        );
      })}

      {/* 진화 단계 뱃지 */}
      {evoStage && evoStage.level >= 2 && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap"
          style={{
            background: `${stat.c}18`,
            border: `1px solid ${stat.c}40`,
            color: stat.c,
            boxShadow: `0 0 20px ${stat.c}22`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {evoStage.deco[0]} {evoStage.name}
        </motion.div>
      )}
    </motion.div>
  );
}
