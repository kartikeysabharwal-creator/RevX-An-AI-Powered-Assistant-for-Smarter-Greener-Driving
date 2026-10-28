'use client';

import React from 'react';

interface DayData {
  day: string;
  ecoScore: number;
  distanceKm: number;
  fuelUsedLitres: number;
  co2Kg: number;
}

interface TrendChartProps {
  data: DayData[];
  height?: number;
}

export function WeeklyEcoTrendChart({ data, height = 200 }: TrendChartProps) {
  if (!data || data.length === 0) return null;

  const maxScore = 100;
  const minScore = 50;
  const chartHeight = height - 40;
  const width = 600;

  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * (width - 80) + 40;
    const norm = (d.ecoScore - minScore) / (maxScore - minScore);
    const y = chartHeight - norm * (chartHeight - 30) + 15;
    return { x: Math.round(x), y: Math.round(y), score: d.ecoScore, day: d.day };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal guidelines */}
          {[100, 80, 60].map((score) => {
            const norm = (score - minScore) / (maxScore - minScore);
            const y = chartHeight - norm * (chartHeight - 30) + 15;
            return (
              <g key={score}>
                <line
                  x1="40"
                  y1={y}
                  x2={width - 20}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text x="15" y={y + 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                  {score}
                </text>
              </g>
            );
          })}

          {/* Shaded Area */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Glowing Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' }}
          />

          {/* Data Nodes */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#080b0f" stroke="#10b981" strokeWidth="2.5" />
              <text
                x={p.x}
                y={chartHeight + 25}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function FuelComparisonBarChart({ data }: { data: DayData[] }) {
  const maxLitres = Math.max(...data.map((d) => d.fuelUsedLitres), 4.0);

  return (
    <div className="w-full flex items-end justify-between gap-3 h-36 pt-4">
      {data.map((d, i) => {
        const heightPct = Math.round((d.fuelUsedLitres / maxLitres) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition">
              {d.fuelUsedLitres}L
            </span>
            <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t-md overflow-hidden h-24 flex items-end">
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-700 group-hover:from-emerald-500 group-hover:to-teal-300"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}
