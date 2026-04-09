"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { StatsMap } from "@/data/stats";
import { INITIAL_STATS } from "@/data/stats";

interface GameState {
  stats: StatsMap;
  totalClicks: number;
  bank: number;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    stats: { ...INITIAL_STATS },
    totalClicks: 0,
    bank: 0,
  });
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("game_state")
        .select("*")
        .eq("id", 1)
        .single();

      if (data) {
        setGameState({
          stats: data.stats as StatsMap,
          totalClicks: data.total_clicks,
          bank: data.bank,
        });
      }
      setLoading(false);
    };

    fetch();

    // Realtime 구독 — 다른 유저의 변경도 실시간 반영
    const channel = supabase
      .channel("game_state_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_state", filter: "id=eq.1" },
        (payload) => {
          const d = payload.new;
          setGameState({
            stats: d.stats as StatsMap,
            totalClicks: d.total_clicks,
            bank: d.bank,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 클릭 — 포인트 적립
  const addPoints = useCallback(async (earn: number) => {
    // Optimistic update
    setGameState((prev) => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      bank: prev.bank + earn,
    }));

    await supabase.rpc("game_add_click", { earn });
  }, []);

  // 상점 구매 — 스탯 올리고 포인트 차감
  const buyStat = useCallback(async (statId: string, amount: number, cost: number) => {
    // Optimistic update
    setGameState((prev) => ({
      ...prev,
      stats: { ...prev.stats, [statId]: Math.max(0, Math.min((prev.stats[statId] || 0) + amount, 100)) },
      bank: prev.bank - cost,
    }));

    await supabase.rpc("game_buy_stat", { stat_id: statId, amt: amount, cost });
  }, []);

  // 이벤트 선택 — 스탯만 올림 (포인트 소비 없음)
  const eventStat = useCallback(async (statId: string, amount: number) => {
    // Optimistic update
    setGameState((prev) => ({
      ...prev,
      stats: { ...prev.stats, [statId]: Math.max(0, Math.min((prev.stats[statId] || 0) + amount, 100)) },
    }));

    await supabase.rpc("game_event_stat", { stat_id: statId, amt: amount });
  }, []);

  return { gameState, loading, addPoints, buyStat, eventStat };
}
