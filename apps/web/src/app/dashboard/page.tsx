'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Fuel, Leaf, MapPin, Clock, ChevronRight, Zap } from 'lucide-react';
import { ScoreGauge } from '@/components/Gauges';
import { WeeklyEcoTrendChart } from '@/components/Charts';
import {
  getDashboard,
  getWeeklyAnalytics,
  type DashboardData,
  type WeeklyAnalytics,
  type Trip,
  formatDuration,
  formatDate,
  getScoreColor,
  getScoreBand,
} from '@/lib/api';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin" />
    </div>
  );
}

function QuickStatCard({ label, value, sub, trend }: { label: string; value: string; sub: string; trend?: 'up' | 'down' | null }) {
  return (
    <div className="bg-revx-card border border-revx-border rounded-2xl p-4">
      <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">{label}</div>
      <div className="text-2xl font-black font-mono text-revx-platinum">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
        <span className="text-xs text-revx-titanium">{sub}</span>
      </div>
    </div>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const eco = trip.ecoScore?.score ?? 0;
  const safety = trip.safetyScore?.score ?? 0;
  const d = trip.metrics?.distanceKm ?? 0;
  const dur = trip.metrics?.durationSeconds ?? 0;

  return (
    <Link
      href={`/dashboard/trips/${trip.id}`}
      className="flex items-center gap-4 p-3 rounded-xl bg-revx-card border border-revx-border hover:border-emerald-500/30 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-revx-surface border border-revx-border flex items-center justify-center flex-shrink-0">
        <MapPin className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-revx-platinum truncate">
          {trip.routeSummary ?? 'Trip'}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-revx-titanium">
          <span>{d.toFixed(1)} km</span>
          <span>•</span>
          <span>{formatDuration(dur)}</span>
          <span>•</span>
          <span>{formatDate(trip.startTime)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-center">
          <div className="text-xs font-black font-mono" style={{ color: getScoreColor(eco) }}>{eco}</div>
          <div className="text-[9px] text-revx-titanium">ECO</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-black font-mono" style={{ color: getScoreColor(safety) }}>{safety}</div>
          <div className="text-[9px] text-revx-titanium">SAFE</div>
        </div>
        <ChevronRight className="w-3 h-3 text-revx-titanium group-hover:text-revx-platinum transition-colors" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboard(), getWeeklyAnalytics()])
      .then(([d, w]) => {
        setDashboard(d);
        setWeekly(w);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-rose-400 font-semibold mb-2">Failed to load dashboard</div>
        <div className="text-sm text-revx-titanium">{error}</div>
        <div className="text-xs text-revx-titanium mt-2">Make sure the API is running: npm run dev:api</div>
      </div>
    </div>
  );
  if (!dashboard) return null;

  const eco = dashboard.currentEcoScore ?? dashboard.quickCards?.ecoScore ?? 0;
  const safety = dashboard.currentSafetyScore ?? dashboard.quickCards?.safetyScore ?? 0;
  const today = dashboard.todayDriving;
  const v = dashboard.activeVehicle;
  const s = dashboard.savings;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-1">Command Center</div>
          <h1 className="text-2xl font-black text-revx-platinum">
            {dashboard.greeting ?? `Good ${new Date().getHours() < 12 ? 'Morning' : 'Evening'}`}
          </h1>
          {v && (
            <div className="flex items-center gap-2 mt-1 text-sm text-revx-titanium">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {v.nickname ?? `${v.year} ${v.make} ${v.model}`}
              <span className="text-revx-border">·</span>
              <span className="text-xs">{v.fuelType?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <Link
          href="/dashboard/simulator"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all"
        >
          Run Simulator
        </Link>
      </div>

      {/* Score Gauges + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Eco Score */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6 flex flex-col items-center">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-2">Eco Score</div>
          <ScoreGauge score={eco} label="Eco" size={140} />
          <div className="text-xs text-emerald-400 font-semibold mt-2">{getScoreBand(eco)}</div>
        </div>

        {/* Safety Score */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6 flex flex-col items-center">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-2">Safety Score</div>
          <ScoreGauge score={safety} label="Safety" size={140} color="#06b6d4" />
          <div className="text-xs text-sky-400 font-semibold mt-2">{getScoreBand(safety)}</div>
        </div>

        {/* Today Stats */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6 space-y-3">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Today's Drive</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xl font-black font-mono text-revx-platinum">
                {(today?.distanceKm ?? 0).toFixed(1)}
                <span className="text-xs font-normal text-revx-titanium ml-1">km</span>
              </div>
              <div className="text-[10px] text-revx-titanium">Distance</div>
            </div>
            <div>
              <div className="text-xl font-black font-mono text-amber-400">
                {(today?.estimatedFuelUsedLitres ?? 0).toFixed(2)}
                <span className="text-xs font-normal text-revx-titanium ml-1">L</span>
              </div>
              <div className="text-[10px] text-revx-titanium">Fuel Used</div>
            </div>
            <div>
              <div className="text-xl font-black font-mono text-teal-400">
                {(today?.estimatedCo2Kg ?? 0).toFixed(2)}
                <span className="text-xs font-normal text-revx-titanium ml-1">kg CO₂</span>
              </div>
              <div className="text-[10px] text-revx-titanium">Emissions</div>
            </div>
            <div>
              <div className="text-xl font-black font-mono text-emerald-400">
                ₹{(s?.estimatedMoneySaved ?? 0).toFixed(0)}
              </div>
              <div className="text-[10px] text-revx-titanium">Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          label="Efficiency"
          value={`${(dashboard.quickCards?.efficiencyL100km ?? 0).toFixed(1)}`}
          sub="L/100km"
          trend="down"
        />
        <QuickStatCard
          label="CO₂"
          value={`${(dashboard.quickCards?.co2Kg ?? 0).toFixed(2)}`}
          sub="kg today"
          trend={null}
        />
        <QuickStatCard
          label="Fuel Saved"
          value={`${(s?.estimatedFuelSavingsLitres ?? 0).toFixed(1)}`}
          sub="litres saved"
          trend="up"
        />
        <QuickStatCard
          label="CO₂ Avoided"
          value={`${(s?.estimatedCo2AvoidedKg ?? 0).toFixed(2)}`}
          sub="kg avoided"
          trend="up"
        />
      </div>

      {/* Weekly Trend Chart */}
      {weekly && (
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">7-Day Eco Trend</div>
              <div className="text-sm text-revx-titanium mt-0.5">{weekly.headlineTrend}</div>
            </div>
            <Link href="/dashboard/analytics" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Full Analytics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <WeeklyEcoTrendChart data={weekly.daySeries} />
        </div>
      )}

      {/* Recent Trips */}
      <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Recent Trips</div>
          <Link href="/dashboard/trips" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
            All Trips <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {dashboard.recentTrips?.length ? (
            dashboard.recentTrips.slice(0, 5).map((trip) => (
              <TripRow key={trip.id} trip={trip} />
            ))
          ) : (
            <div className="text-center py-8 text-revx-titanium text-sm">
              No trips yet. <Link href="/dashboard/simulator" className="text-emerald-400 hover:underline">Run the simulator</Link> to generate data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
