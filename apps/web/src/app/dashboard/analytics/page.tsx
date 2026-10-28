'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WeeklyEcoTrendChart, FuelComparisonBarChart } from '@/components/Charts';
import { getWeeklyAnalytics, getMonthlyAnalytics, type WeeklyAnalytics } from '@/lib/api';

const PERIODS = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

function TrendCard({
  label,
  value,
  unit,
  pct,
  isImprovement,
  narrative,
}: {
  label: string;
  value: number;
  unit: string;
  pct: number;
  isImprovement: boolean;
  narrative: string;
}) {
  const color = isImprovement ? 'text-emerald-400' : 'text-rose-400';
  const bg = isImprovement ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
  return (
    <div className={`rounded-2xl border p-5 ${bg}`}>
      <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">{label}</div>
      <div className="text-2xl font-black font-mono text-revx-platinum">
        {value.toFixed(1)}<span className="text-sm font-normal text-revx-titanium ml-1">{unit}</span>
      </div>
      <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${color}`}>
        {isImprovement ? <TrendingUp className="w-3.5 h-3.5" /> : pct === 0 ? <Minus className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {Math.abs(pct).toFixed(1)}% {isImprovement ? 'improvement' : 'decrease'}
      </div>
      <div className="text-[10px] text-revx-titanium mt-1">{narrative}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetch = period === 'week' ? getWeeklyAnalytics : getMonthlyAnalytics;
    fetch()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">Performance</div>
          <h1 className="text-2xl font-black text-revx-platinum">Analytics</h1>
          {data && <div className="text-sm text-revx-titanium mt-0.5">{data.headlineTrend}</div>}
        </div>
        <div className="flex gap-1 p-1 bg-revx-surface border border-revx-border rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={[
                'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                period === p.value
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-revx-titanium hover:text-revx-platinum',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-rose-400">{error}</div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Distance', value: data.summary.totalDistanceKm.toFixed(1), unit: 'km' },
              { label: 'Total Trips', value: String(data.summary.tripCount), unit: 'trips' },
              { label: 'Avg Eco Score', value: String(Math.round(data.summary.avgEcoScore)), unit: '/100' },
              { label: 'Avg Safety Score', value: String(Math.round(data.summary.avgSafetyScore)), unit: '/100' },
              { label: 'Fuel Used', value: data.summary.totalFuelUsedLitres.toFixed(2), unit: 'L' },
              { label: 'CO₂ Emitted', value: data.summary.totalCo2Kg.toFixed(2), unit: 'kg' },
            ].map((s, i) => (
              <div key={i} className="bg-revx-surface border border-revx-border rounded-2xl p-4">
                <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">{s.label}</div>
                <div className="text-2xl font-black font-mono text-revx-platinum">
                  {s.value}<span className="text-xs font-normal text-revx-titanium ml-1">{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Eco Trend Chart */}
          <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
            <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Eco Score Trend</div>
            <WeeklyEcoTrendChart data={data.daySeries} />
          </div>

          {/* Fuel Chart */}
          <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
            <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Daily Fuel Usage</div>
            <FuelComparisonBarChart data={data.daySeries} />
          </div>

          {/* Trend comparison */}
          {data.trends && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TrendCard
                label="Eco Score Trend"
                value={data.trends.ecoTrend.currentValue}
                unit="/100"
                pct={data.trends.ecoTrend.percentageChange}
                isImprovement={data.trends.ecoTrend.isImprovement}
                narrative={data.trends.ecoTrend.narrative}
              />
              <TrendCard
                label="Safety Trend"
                value={data.trends.safetyTrend.currentValue}
                unit="/100"
                pct={data.trends.safetyTrend.percentageChange}
                isImprovement={data.trends.safetyTrend.isImprovement}
                narrative={data.trends.safetyTrend.narrative}
              />
              <TrendCard
                label="Efficiency Trend"
                value={data.trends.fuelEfficiencyTrend.currentValue}
                unit="L/100km"
                pct={data.trends.fuelEfficiencyTrend.percentageChange}
                isImprovement={data.trends.fuelEfficiencyTrend.isImprovement}
                narrative={data.trends.fuelEfficiencyTrend.narrative}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
