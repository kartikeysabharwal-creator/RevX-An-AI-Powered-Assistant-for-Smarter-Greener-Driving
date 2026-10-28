'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  band?: string;
  color?: string;
}

export function ScoreGauge({
  score,
  label = 'ECO SCORE',
  size = 180,
  strokeWidth = 12,
  band = 'EXCELLENT',
  color = '#10b981',
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getBandColor = (s: number) => {
    if (s >= 85) return 'text-emerald-400 border-emerald-500/30';
    if (s >= 70) return 'text-teal-400 border-teal-500/30';
    if (s >= 50) return 'text-amber-400 border-amber-500/30';
    return 'text-rose-400 border-rose-500/30';
  };

  const getArcColor = (s: number) => {
    if (s >= 85) return '#10b981';
    if (s >= 70) return '#14b8a6';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const arcColor = getArcColor(score);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1c2633"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${arcColor}55)`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tighter text-revx-platinum font-mono">
            {score}
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
        <span
          className={`mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-opacity-10 ${getBandColor(
            score
          )}`}
        >
          {band}
        </span>
      </div>
    </div>
  );
}

export function Speedometer({ speedKmh = 62, maxSpeed = 160 }: { speedKmh: number; maxSpeed?: number }) {
  const percentage = Math.min(100, (speedKmh / maxSpeed) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-5xl font-black font-mono tracking-tighter text-revx-platinum flex items-baseline gap-1">
        <span>{Math.round(speedKmh)}</span>
        <span className="text-xs text-slate-400 font-sans tracking-widest">KM/H</span>
      </div>
      <div className="w-full max-w-[200px] h-2 bg-slate-800 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
