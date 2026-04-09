"use client";
import { motion } from "motion/react";

interface BurstProps {
  x: number;
  y: number;
  emoji: string;
}

export default function Burst({ x, y, emoji }: BurstProps) {
  // 랜덤 방향 — 위쪽 반원으로 퍼지되 다양한 각도
  const angle = -90 + (Math.random() - 0.5) * 120; // -150 ~ -30 degrees
  const distance = 40 + Math.random() * 60;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance;
  const rotation = (Math.random() - 0.5) * 60;
  const scale = 0.8 + Math.random() * 0.6;

  return (
    <motion.div
      className="fixed pointer-events-none z-[1500] text-2xl"
      style={{ left: x - 12, top: y - 12 }}
      initial={{ opacity: 1, scale: 0.3, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: 0,
        scale,
        x: dx,
        y: dy,
        rotate: rotation,
      }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {emoji}
    </motion.div>
  );
}
