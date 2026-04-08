"use client";

import { useState, useEffect, useRef } from "react";
import type { Stat, Scenario } from "@/data/stats";

interface Props {
  opts: [Stat, Stat];
  scene: Scenario;
  onPick: (statId: string) => void;
}

export default function ChoiceModal({ opts, scene, onPick }: Props) {
  const [cd, setCd] = useState(10);
  const [armed, setArmed] = useState(false);
  const stableOpts = useRef(opts);
  const flavors = useRef(opts.map((o) => o.desc));

  useEffect(() => {
    setArmed(false);
    const armTimer = setTimeout(() => setArmed(true), 450);
    return () => clearTimeout(armTimer);
  }, [opts, scene]);

  useEffect(() => {
    if (cd <= 0) {
      onPick(stableOpts.current[Math.floor(Math.random() * 2)].id);
      return;
    }

    const timer = setTimeout(() => setCd((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cd, onPick]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="event-modal-title" aria-describedby="event-modal-desc">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.28),_transparent_35%)]" />

      <div
        className="relative w-full max-w-[860px] overflow-hidden rounded-[32px] border border-white/10 bg-[#09090be8] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
        style={{ animation: "modalIn .28s ease" }}
      >
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(129,140,248,0.18),rgba(255,255,255,0.02))] px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c7d2fe]">Special Event</div>
              <div id="event-modal-title" className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-[2rem]">{scene.t}</div>
              <div id="event-modal-desc" className="mt-2 text-sm text-[#d4d4d8]">{scene.s}</div>
            </div>
            <div className={`rounded-full border px-4 py-2 text-sm font-extrabold ${cd <= 3 ? "border-red-400/40 bg-red-500/15 text-red-200" : "border-white/10 bg-white/6 text-white"}`}>
              ⏱ {cd}초
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-[#a1a1aa]">
            {armed
              ? "이제 안전하게 선택할 수 있습니다."
              : "손 떼는 중... 연속 클릭 오작동 방지 잠금이 잠깐 적용됩니다."}
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          {stableOpts.current.map((option, index) => (
            <button
              key={option.id}
              onClick={() => {
                if (!armed) return;
                onPick(option.id);
              }}
              className="event-option group"
              disabled={!armed}
              type="button"
            >
              <div className="event-option__glow" style={{ background: `${option.c}30` }} />
              <div className="relative z-[1]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  {option.em}
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-left">
                    <div className="text-xl font-black tracking-[-0.04em] text-white">{option.name}</div>
                    <div className="mt-2 text-sm leading-6 text-[#d4d4d8]">{flavors.current[index]}</div>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-xs font-extrabold text-white"
                    style={{ background: option.c }}
                  >
                    선택 시 +{cd <= 3 ? "긴박감" : "오염도"}
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-white transition-transform duration-200 group-hover:translate-x-1">
                  <span>{armed ? "이 루트 탄다" : "잠깐만"}</span>
                  <span>{armed ? "→" : "..."}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[#09090b] text-xs font-black tracking-[0.28em] text-[#a5b4fc] sm:flex">
          VS
        </div>
      </div>
    </div>
  );
}
