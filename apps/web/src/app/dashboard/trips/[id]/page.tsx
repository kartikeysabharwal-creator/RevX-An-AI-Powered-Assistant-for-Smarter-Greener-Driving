'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Fuel,
  Leaf,
  AlertTriangle,
  Zap,
  TrendingDown,
  Info,
} from 'lucide-react';
import { ScoreGauge } from '@/components/Gauges';
import { RouteMapViewer } from '@/components/RouteMapViewer';
import { AICoachCard } from '@/components/AICoachCard';
import {
  getTrip,
  analyzeTrip,
  type Trip,
  type AIInsight,
  formatDuration,
  formatDate,
  getScoreColor,
} from '@/lib/api';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  HARSH_ACCELERATION: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  HARSH_BRAKING: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
  SHARP_TURN: <TrendingDown className="w-3.5 h-3.5 text-violet-400" />,
  EXCESSIVE_IDLING: <Clock className="w-3.5 h-3.5 text-orange-400" />,
  OVERSPEED: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
};

const EVENT_SEVERITY_COLORS: Record<string, string> = {
  HIGH: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  LOW: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getTrip(id)
      .then((t) => {
        setTrip(t);
        // Load AI insight (either from trip or fetch separately)
        if (t.aiInsight) {
          setInsight(t.aiInsight);
        } else {
          setAiLoading(true);
          analyzeTrip(id)
            .then(setInsight)
            .catch(() => null)
            .finally(() => setAiLoading(false));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="text-center py-20">
        <div className="text-rose-400 font-semibold mb-2">Trip not found</div>
        <div className="text-sm text-revx-titanium mb-6">{error}</div>
        <Link href="/dashboard/trips" className="text-emerald-400 hover:underline text-sm">← Back to Trips</Link>
      </div>
    );
  }

  const eco = trip.ecoScore?.score ?? 0;
  const safety = trip.safetyScore?.score ?? 0;
  const m = trip.metrics;
  const fe = trip.fuelEmissions;
  const events = trip.events ?? [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/dashboard/trips" className="inline-flex items-center gap-2 text-sm text-revx-titanium hover:text-revx-platinum transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-revx-platinum">
              {trip.routeSummary ?? 'Trip Report'}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-revx-titanium">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{(m?.distanceKm ?? 0).toFixed(2)} km</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(m?.durationSeconds ?? 0)}</span>
              <span>·</span>
              <span>{formatDate(trip.startTime)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-revx-surface border border-revx-border text-revx-titanium">
            {trip.mode === 'OBD_II' ? '🔵 OBD-II Mode' : '📱 Phone Only'}
          </div>
        </div>
      </div>

      {/* Scores + Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6 flex flex-col items-center">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-2">Eco Score</div>
          <ScoreGauge score={eco} label="Eco" size={130} />
          <div className="text-xs font-semibold mt-2" style={{ color: getScoreColor(eco) }}>
            {trip.ecoScore?.band ?? ''}
          </div>
        </div>

        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6 flex flex-col items-center">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-2">Safety Score</div>
          <ScoreGauge score={safety} label="Safety" size={130} color="#06b6d4" />
          <div className="text-xs font-semibold mt-2" style={{ color: getScoreColor(safety) }}>
            {trip.safetyScore?.band ?? ''}
          </div>
        </div>

        {/* Fuel & CO₂ Card */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6 space-y-3">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Fuel & Emissions</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-lg font-black font-mono text-amber-400">
                {(fe?.fuelUsedLitres ?? 0).toFixed(2)}
                <span className="text-xs font-normal text-revx-titanium ml-1">L</span>
              </div>
              <div className="text-[10px] text-revx-titanium">Fuel Used</div>
            </div>
            <div>
              <div className="text-lg font-black font-mono text-teal-400">
                {(fe?.fuelEfficiencyL100km ?? 0).toFixed(1)}
                <span className="text-xs font-normal text-revx-titanium ml-1">L/100</span>
              </div>
              <div className="text-[10px] text-revx-titanium">Efficiency</div>
            </div>
            <div>
              <div className="text-lg font-black font-mono text-sky-400">
                {(fe?.estimatedCo2Kg ?? 0).toFixed(2)}
                <span className="text-xs font-normal text-revx-titanium ml-1">kg CO₂</span>
              </div>
              <div className="text-[10px] text-revx-titanium">Emissions</div>
            </div>
            <div>
              <div className="text-lg font-black font-mono text-emerald-400">
                ₹{(fe?.moneySaved ?? 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-revx-titanium">Money Saved</div>
            </div>
          </div>
          {fe?.fuelSavedLitres != null && fe.fuelSavedLitres > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 rounded-xl px-3 py-2">
              <Leaf className="w-3 h-3" />
              {fe.fuelSavedLitres.toFixed(2)} L saved vs baseline · {(fe.co2AvoidedKg ?? 0).toFixed(2)} kg CO₂ avoided
            </div>
          )}
        </div>
      </div>

      {/* Route Map */}
      {trip.routeCoordinates && trip.routeCoordinates.length > 0 && (
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Route Map</div>
          <RouteMapViewer
            coordinates={trip.routeCoordinates}
            events={trip.events ?? []}
          />
        </div>
      )}

      {/* Trip Metrics */}
      <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
        <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Driving Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Speed', value: `${(m?.avgSpeedKmh ?? 0).toFixed(1)} km/h` },
            { label: 'Max Speed', value: `${(m?.maxSpeedKmh ?? 0).toFixed(1)} km/h` },
            { label: 'Moving Time', value: formatDuration(m?.movingDurationSeconds ?? 0) },
            { label: 'Idle Time', value: formatDuration(m?.idleDurationSeconds ?? 0) },
            { label: 'Stops', value: String(m?.stopCount ?? 0) },
            { label: 'Harsh Accels', value: String(m?.harshAccelCount ?? 0) },
            { label: 'Harsh Brakes', value: String(m?.harshBrakeCount ?? 0) },
            { label: 'Sharp Turns', value: String(m?.sharpTurnCount ?? 0) },
          ].map((stat, i) => (
            <div key={i} className="bg-revx-card border border-revx-border rounded-xl p-3">
              <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">{stat.label}</div>
              <div className="text-base font-bold font-mono text-revx-platinum">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">
            Driving Events ({events.length})
          </div>
          <div className="space-y-2">
            {events.map((ev, i) => {
              const severityClass = EVENT_SEVERITY_COLORS[ev.severity] ?? EVENT_SEVERITY_COLORS.LOW;
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${severityClass}`}>
                  {EVENT_ICONS[ev.eventType] ?? <Info className="w-3.5 h-3.5" />}
                  <div className="flex-1">
                    <div className="text-xs font-semibold">{ev.eventType.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] opacity-70">{ev.description}</div>
                  </div>
                  <div className="text-[10px] opacity-60">{ev.severity}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Coach */}
      <div>
        {aiLoading ? (
          <div className="bg-revx-surface border border-revx-border rounded-2xl p-8 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin mx-auto mb-3" />
            <div className="text-sm text-revx-titanium">Generating AI coaching insights…</div>
          </div>
        ) : insight ? (
          <AICoachCard insight={insight} />
        ) : null}
      </div>
    </div>
  );
}
