"use client";
import { useState, useEffect } from "react";

export default function Burst({ x, y, emoji }: { x: number; y: number; emoji: string }) {
  const [gone, setGone] = useState(false);
  useEffect(() => { setTimeout(() => setGone(true), 500); }, []);
  if (gone) return null;
  return (
    <div
      className="fixed pointer-events-none z-[1500] text-2xl"
      style={{ left: x - 12, top: y - 12, animation: "fadeUp .5s forwards" }}
    >
      {emoji}
    </div>
  );
}
