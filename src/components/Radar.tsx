"use client";
import { STATS, type StatsMap } from "@/data/stats";

export default function Radar({ stats, size = 180 }: { stats: StatsMap; size?: number }) {
  const n = STATS.length;
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number): [number, number] => [
    cx + Math.cos(ang(i)) * r * (v / 100),
    cy + Math.sin(ang(i)) * r * (v / 100),
  ];

  const grid = [50, 100];
  const data = STATS.map((s, i) => pt(i, stats[s.id]));
  const d = data.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {grid.map((lv) => {
        const pts = STATS.map((_, i) => pt(i, lv));
        return (
          <path
            key={lv}
            d={pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z"}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
          />
        );
      })}
      {STATS.map((_, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + Math.cos(ang(i)) * r}
          y2={cy + Math.sin(ang(i)) * r}
          stroke="rgba(255,255,255,0.04)"
        />
      ))}
      <path
        d={d}
        fill="rgba(129,140,248,0.12)"
        stroke="rgba(129,140,248,0.6)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{ transition: "d .4s ease" }}
      />
      {data.map((p, i) =>
        stats[STATS[i].id] > 0 ? (
          <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={STATS[i].c} style={{ transition: "all .4s ease" }} />
        ) : null
      )}
      {STATS.map((s, i) => {
        const lx = cx + Math.cos(ang(i)) * (r + 16);
        const ly = cy + Math.sin(ang(i)) * (r + 16);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={13} fill="rgba(255,255,255,0.4)">
            {s.em}
          </text>
        );
      })}
    </svg>
  );
}
