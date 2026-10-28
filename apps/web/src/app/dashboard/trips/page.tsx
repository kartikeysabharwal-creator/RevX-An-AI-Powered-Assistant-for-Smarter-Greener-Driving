'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Fuel, ChevronRight, Filter, Leaf } from 'lucide-react';
import {
  getTrips,
  type Trip,
  formatDuration,
  formatDate,
  getScoreColor,
} from '@/lib/api';

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'All', value: 'all' },
];

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color = getScoreColor(score);
  return (
    <div
      className="flex flex-col items-center px-3 py-1.5 rounded-lg border text-center"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
    >
      <div className="text-sm font-black font-mono" style={{ color }}>{score}</div>
      <div className="text-[9px] text-revx-titanium font-semibold tracking-wider">{label}</div>
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTrips({ period: period === 'all' ? undefined : period, limit: 50 })
      .then(({ trips: t, pagination }) => {
        setTrips(t);
        setTotal(pagination.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">History</div>
          <h1 className="text-2xl font-black text-revx-platinum">Trips</h1>
        </div>
        <div className="text-sm text-revx-titanium">{total} trips</div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-revx-titanium" />
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-rose-400">{error}</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-12 h-12 text-revx-titanium mx-auto mb-4 opacity-30" />
          <div className="text-revx-titanium font-medium mb-2">No trips found</div>
          <div className="text-sm text-revx-titanium/60 mb-6">Change the period filter or run a simulation to get started.</div>
          <Link href="/dashboard/simulator" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all">
            Run Simulator
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const eco = trip.ecoScore?.score ?? 0;
            const safety = trip.safetyScore?.score ?? 0;
            const d = trip.metrics?.distanceKm ?? 0;
            const dur = trip.metrics?.durationSeconds ?? 0;
            const fuel = trip.fuelEmissions?.fuelUsedLitres ?? 0;
            const co2 = trip.fuelEmissions?.estimatedCo2Kg ?? 0;
            const saved = trip.fuelEmissions?.moneySaved ?? 0;

            return (
              <Link
                key={trip.id}
                href={`/dashboard/trips/${trip.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-revx-surface border border-revx-border hover:border-emerald-500/30 transition-all"
              >
                {/* Map pin icon */}
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Trip info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-revx-platinum truncate">
                    {trip.routeSummary ?? 'Trip'}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-revx-titanium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{d.toFixed(1)} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatDuration(dur)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-amber-400" />{fuel.toFixed(2)} L
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-teal-400" />{co2.toFixed(2)} kg CO₂
                    </span>
                    {saved > 0 && (
                      <span className="text-emerald-400 font-semibold">₹{saved.toFixed(2)} saved</span>
                    )}
                  </div>
                  <div className="text-[10px] text-revx-titanium/60 mt-1">{formatDate(trip.startTime)}</div>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ScoreBadge score={eco} label="ECO" />
                  <ScoreBadge score={safety} label="SAFE" />
                  <ChevronRight className="w-4 h-4 text-revx-titanium group-hover:text-revx-platinum transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
