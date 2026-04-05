"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const USER_KEY = "clickgame_user_id";

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 1. localStorage에서 기존 UUID 확인
      let id = localStorage.getItem(USER_KEY);

      if (id) {
        // 기존 유저 — last_active 갱신
        await supabase
          .from("users")
          .update({ last_active: new Date().toISOString() })
          .eq("id", id);
        setUserId(id);
      } else {
        // 2. 새 유저 생성
        const { data, error } = await supabase
          .from("users")
          .insert({})
          .select("id")
          .single();

        if (data && !error) {
          localStorage.setItem(USER_KEY, data.id);
          setUserId(data.id);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  // 개인 클릭 수 증가
  const addClick = async (count: number = 1) => {
    if (!userId) return;
    await supabase.rpc("increment_user_clicks", { uid: userId, n: count });
  };

  // 개인 소비 기록
  const addSpent = async (amount: number) => {
    if (!userId) return;
    await supabase.rpc("increment_user_spent", { uid: userId, n: amount });
  };

  // 활동 로그 기록
  const logAction = async (action: "click" | "buy" | "event", detail: Record<string, unknown>) => {
    if (!userId) return;
    await supabase.from("action_log").insert({
      user_id: userId,
      action,
      detail,
    });
  };

  return { userId, loading, addClick, addSpent, logAction };
}
