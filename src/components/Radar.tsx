"use client";

import { STATS, type StatsMap } from "@/data/stats";

export default function Radar({ stats, size = 180 }: { stats: StatsMap; size?: number }) {
  const count = STATS.length;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.34;
  const angle = (index: number) => (Math.PI * 2 * index) / count - Math.PI / 2;
  const point = (index: number, value: number): [number, number] => [
    centerX + Math.cos(angle(index)) * radius * (value / 100),
    centerY + Math.sin(angle(index)) * radius * (value / 100),
  ];

  const gridLevels = [25, 50, 75, 100];
  const data = STATS.map((stat, index) => point(index, stats[stat.id]));
  const path = `${data
    .map((entry, index) => `${index === 0 ? "M" : "L"}${entry[0]},${entry[1]}`)
    .join(" ")}Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block overflow-visible">
      <defs>
        <linearGradient id="radarFill" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(129,140,248,0.42)" />
          <stop offset="100%" stopColor="rgba(244,63,94,0.14)" />
        </linearGradient>
      </defs>

      {gridLevels.map((level) => {
        const points = STATS.map((_, index) => point(index, level));
        return (
          <path
            key={level}
            d={`${points
              .map((entry, index) => `${index === 0 ? "M" : "L"}${entry[0]},${entry[1]}`)
              .join(" ")}Z`}
            fill={level === 100 ? "rgba(255,255,255,0.02)" : "none"}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray={level === 100 ? "0" : "4 6"}
          />
        );
      })}

      {STATS.map((_, index) => (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.cos(angle(index)) * radius}
          y2={centerY + Math.sin(angle(index)) * radius}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}

      <circle cx={centerX} cy={centerY} r={4} fill="rgba(255,255,255,0.55)" />
      <path
        d={path}
        fill="url(#radarFill)"
        stroke="rgba(199,210,254,0.95)"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transition: "d .45s ease" }}
      />

      {data.map((entry, index) =>
        stats[STATS[index].id] > 0 ? (
          <g key={STATS[index].id}>
            <circle cx={entry[0]} cy={entry[1]} r={9} fill={`${STATS[index].c}22`} />
            <circle cx={entry[0]} cy={entry[1]} r={4.5} fill={STATS[index].c} style={{ transition: "all .4s ease" }} />
          </g>
        ) : null
      )}

      {STATS.map((stat, index) => {
        const labelX = centerX + Math.cos(angle(index)) * (radius + 28);
        const labelY = centerY + Math.sin(angle(index)) * (radius + 28);

        return (
          <g key={stat.id} transform={`translate(${labelX}, ${labelY})`}>
            <circle r={14} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" />
            <text textAnchor="middle" dominantBaseline="central" fontSize={14}>
              {stat.em}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
