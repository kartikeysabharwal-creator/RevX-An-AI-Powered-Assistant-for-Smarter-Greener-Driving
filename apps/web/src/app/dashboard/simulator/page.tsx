'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Loader2, CheckCircle2, MapPin, Clock, Fuel, Leaf, ChevronRight, AlertTriangle } from 'lucide-react';
import { runSimulator, type SimulatorResult, formatDuration, getScoreColor } from '@/lib/api';
import { ScoreGauge } from '@/components/Gauges';

const SCENARIOS = [
  {
    value: 'SMOOTH_ECO',
    label: 'Smooth Eco Drive',
    desc: 'Gentle acceleration, steady cruising, minimal braking. Ideal eco reference.',
    emoji: '🌿',
    expectedEco: '85–95',
  },
  {
    value: 'AGGRESSIVE_SPEED',
    label: 'Aggressive Speed',
    desc: 'Hard acceleration, high speeds, sharp braking incidents throughout.',
    emoji: '🔴',
    expectedEco: '10–40',
  },
  {
    value: 'STOP_AND_GO_CITY',
    label: 'Stop & Go City',
    desc: 'Urban traffic pattern with frequent stops, short runs, moderate driving.',
    emoji: '🏙️',
    expectedEco: '55–75',
  },
  {
    value: 'HARSH_BRAKING_INCIDENTS',
    label: 'Harsh Braking',
    desc: 'Multiple sudden braking events to test safety score penalty calculation.',
    emoji: '⚠️',
    expectedEco: '40–65',
  },
  {
    value: 'EXCESSIVE_IDLING',
    label: 'Excessive Idling',
    desc: 'Long idle periods with minimal movement — tests idle penalty factor.',
    emoji: '⏱️',
    expectedEco: '50–70',
  },
];

const MODES = [
  { value: 'OBD_II', label: 'OBD-II Mode', desc: 'MAF sensor fuel calculation. High fidelity.', emoji: '🔵' },
  { value: 'PHONE_ONLY', label: 'Phone Only', desc: 'Kinematic fuel estimation from GPS + IMU.', emoji: '📱' },
];

export default function SimulatorPage() {
  const [scenario, setScenario] = useState('SMOOTH_ECO');
  const [mode, setMode] = useState('OBD_II');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const r = await runSimulator(scenario, mode);
      setResult(r);
    } catch (e: any) {
      setError(e.message ?? 'Simulator failed');
    } finally {
      setRunning(false);
    }
  }

  const trip = result?.trip;
  const eco = trip?.ecoScore?.score ?? 0;
  const safety = trip?.safetyScore?.score ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">Dev Tool</div>
        <h1 className="text-2xl font-black text-revx-platinum">Drive Simulator</h1>
        <p className="text-sm text-revx-titanium mt-1">
          Generate realistic synthetic trips with physics-based telemetry to test all RevX scoring engines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Panel */}
        <div className="space-y-5">
          {/* Scenario */}
          <div className="bg-revx-surface border border-revx-border rounded-2xl p-5">
            <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Select Scenario</div>
            <div className="space-y-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setScenario(s.value)}
                  className={[
                    'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                    scenario === s.value
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-revx-border bg-revx-card hover:border-revx-border/80',
                  ].join(' ')}
                >
                  <span className="text-xl flex-shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${scenario === s.value ? 'text-emerald-400' : 'text-revx-platinum'}`}>
                      {s.label}
                    </div>
                    <div className="text-[10px] text-revx-titanium mt-0.5 truncate">{s.desc}</div>
                  </div>
                  <div className="text-[9px] text-revx-titanium flex-shrink-0 text-right">
                    Eco<br />
                    <span className="font-mono font-bold text-revx-titanium">{s.expectedEco}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="bg-revx-surface border border-revx-border rounded-2xl p-5">
            <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Sensor Mode</div>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={[
                    'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
                    mode === m.value
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-revx-border bg-revx-card hover:border-revx-border/80',
                  ].join(' ')}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <div className={`text-xs font-bold ${mode === m.value ? 'text-emerald-400' : 'text-revx-platinum'}`}>
                    {m.label}
                  </div>
                  <div className="text-[9px] text-revx-titanium">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={running}
            className={[
              'w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all',
              running
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                : 'bg-revx-emerald text-black hover:bg-emerald-400 shadow-glow-emerald',
            ].join(' ')}
          >
            {running ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Simulating drive…
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Simulation
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Simulation Failed</div>
                <div className="text-xs mt-0.5 text-rose-300">{error}</div>
                <div className="text-xs mt-1 text-rose-300/60">Make sure the API server is running: npm run dev:api</div>
              </div>
            </div>
          )}

          {!result && !error && !running && (
            <div className="flex flex-col items-center justify-center h-80 text-center bg-revx-surface border border-revx-border rounded-2xl p-6">
              <Play className="w-12 h-12 text-revx-titanium opacity-20 mb-4" />
              <div className="text-revx-titanium font-medium">Configure and run a simulation</div>
              <div className="text-sm text-revx-titanium/60 mt-1">Results will appear here after the drive completes</div>
            </div>
          )}

          {running && (
            <div className="flex flex-col items-center justify-center h-80 text-center bg-revx-surface border border-revx-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin mb-4" />
              <div className="text-revx-platinum font-semibold">Driving…</div>
              <div className="text-sm text-revx-titanium mt-1">Processing telemetry, detecting events, calculating scores</div>
            </div>
          )}

          {result && trip && (
            <div className="space-y-4 animate-fade-in">
              {/* Success badge */}
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Simulation complete · {result.pointsSampled} telemetry points processed
              </div>

              {/* Scenario header */}
              <div className="bg-revx-surface border border-emerald-500/30 rounded-2xl p-4">
                <div className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase mb-1">
                  {result.scenario} · {result.mode}
                </div>
                <div className="flex items-center gap-4 text-sm text-revx-titanium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />{(trip.metrics?.distanceKm ?? 0).toFixed(2)} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{formatDuration(trip.metrics?.durationSeconds ?? 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />{(trip.fuelEmissions?.fuelUsedLitres ?? 0).toFixed(2)} L
                  </span>
                  <span className="flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-teal-400" />{(trip.fuelEmissions?.estimatedCo2Kg ?? 0).toFixed(2)} kg CO₂
                  </span>
                </div>
              </div>

              {/* Score Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-revx-surface border border-revx-border rounded-2xl p-5 flex flex-col items-center">
                  <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-2">Eco Score</div>
                  <ScoreGauge score={eco} label="Eco" size={110} />
                  <div className="text-xs font-semibold mt-2" style={{ color: getScoreColor(eco) }}>
                    {trip.ecoScore?.band}
                  </div>
                </div>
                <div className="bg-revx-surface border border-revx-border rounded-2xl p-5 flex flex-col items-center">
                  <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-2">Safety Score</div>
                  <ScoreGauge score={safety} label="Safety" size={110} color="#06b6d4" />
                  <div className="text-xs font-semibold mt-2" style={{ color: getScoreColor(safety) }}>
                    {trip.safetyScore?.band}
                  </div>
                </div>
              </div>

              {/* Events */}
              {(trip.events ?? []).length > 0 && (
                <div className="bg-revx-surface border border-revx-border rounded-2xl p-4">
                  <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-3">
                    Events Detected ({trip.events!.length})
                  </div>
                  <div className="space-y-1.5">
                    {trip.events!.slice(0, 5).map((ev, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-revx-titanium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {ev.eventType.replace(/_/g, ' ')} — {ev.severity}
                      </div>
                    ))}
                    {trip.events!.length > 5 && (
                      <div className="text-[10px] text-revx-titanium/60">
                        +{trip.events!.length - 5} more events
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View in Trips */}
              <Link
                href={`/dashboard/trips/${trip.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all"
              >
                View Full Trip Report <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
