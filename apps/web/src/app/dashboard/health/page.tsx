'use client';

import React, { useEffect, useState } from 'react';
import { Thermometer, BatteryCharging, Activity, AlertTriangle, CheckCircle2, Wrench, Info } from 'lucide-react';
import { getVehicleHealth, type VehicleHealth } from '@/lib/api';

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NORMAL: 'bg-emerald-400',
    GOOD: 'bg-emerald-400',
    OK: 'bg-emerald-400',
    HIGH: 'bg-amber-400',
    LOW: 'bg-amber-400',
    CRITICAL: 'bg-rose-500',
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[status] ?? 'bg-revx-titanium'}`}
      style={{ boxShadow: status === 'NORMAL' || status === 'GOOD' ? '0 0 6px currentColor' : undefined }}
    />
  );
}

function Meter({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2.5 bg-revx-card rounded-full overflow-hidden border border-revx-border">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}55` }}
      />
    </div>
  );
}

export default function VehicleHealthPage() {
  const [data, setData] = useState<VehicleHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVehicleHealth()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin" />
    </div>
  );
  if (error) return <div className="text-center py-20 text-rose-400">{error}</div>;
  if (!data) return null;

  const dtcs = data.activeDtcs ?? [];
  const maintenance = data.maintenanceReminders ?? [];
  const dueSoon = maintenance.filter((m) => m.status !== 'OK');
  const healthy = dtcs.length === 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">OBD-II Diagnostics</div>
          <h1 className="text-2xl font-black text-revx-platinum">Vehicle Health</h1>
          <div className="text-sm text-revx-titanium mt-0.5">{data.vehicleName}</div>
        </div>
        <div className={[
          'flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold',
          healthy
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-400',
        ].join(' ')}>
          {healthy
            ? <><CheckCircle2 className="w-4 h-4" /> All Systems Nominal</>
            : <><AlertTriangle className="w-4 h-4" /> {dtcs.length} DTC{dtcs.length !== 1 ? 's' : ''} Active</>}
        </div>
      </div>

      {/* Sensor indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engine Temp */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Coolant Temp</div>
            </div>
            <StatusDot status={data.coolantStatus} />
          </div>
          <div className="text-3xl font-black font-mono text-revx-platinum mb-3">
            {data.coolantTempC.toFixed(0)}
            <span className="text-sm font-normal text-revx-titanium ml-1">°C</span>
          </div>
          <Meter value={data.coolantTempC} max={130} color="#f97316" />
          <div className="text-[10px] text-revx-titanium mt-1.5">
            {data.coolantStatus} · Normal: 80–100°C
          </div>
        </div>

        {/* Battery */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-sky-400" />
              <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Battery</div>
            </div>
            <StatusDot status={data.batteryStatus} />
          </div>
          <div className="text-3xl font-black font-mono text-revx-platinum mb-3">
            {data.batteryVoltage.toFixed(1)}
            <span className="text-sm font-normal text-revx-titanium ml-1">V</span>
          </div>
          <Meter value={data.batteryVoltage - 11} max={3} color="#06b6d4" />
          <div className="text-[10px] text-revx-titanium mt-1.5">
            {data.batteryStatus} · Normal: 12.6–14.7V
          </div>
        </div>

        {/* Engine Load */}
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Engine Load</div>
            </div>
            <StatusDot status={data.engineLoadStatus} />
          </div>
          <div className="text-3xl font-black font-mono text-revx-platinum mb-3">
            {data.engineLoadPercent.toFixed(0)}
            <span className="text-sm font-normal text-revx-titanium ml-1">%</span>
          </div>
          <Meter value={data.engineLoadPercent} max={100} color="#a78bfa" />
          <div className="text-[10px] text-revx-titanium mt-1.5">
            {data.engineLoadStatus} · Idle: 20–30%
          </div>
        </div>
      </div>

      {/* DTC Panel */}
      <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Diagnostic Codes</div>
        </div>
        {dtcs.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-emerald-400">Clean Bill of Health</div>
              <div className="text-[10px] text-revx-titanium">No active DTC codes detected</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {dtcs.map((dtc, i) => {
              const sevColor = dtc.severity === 'HIGH' ? 'border-rose-500/30 bg-rose-500/5 text-rose-400' :
                dtc.severity === 'MEDIUM' ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' :
                'border-yellow-500/30 bg-yellow-500/5 text-yellow-400';
              return (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${sevColor}`}>
                  <div className="font-black font-mono text-sm">{dtc.code}</div>
                  <div className="flex-1 text-xs">{dtc.description}</div>
                  <div className="text-[10px] font-semibold">{dtc.severity}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Maintenance Reminders */}
      {maintenance.length > 0 && (
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-amber-400" />
            <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Maintenance Reminders</div>
            {dueSoon.length > 0 && (
              <span className="ml-auto text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                {dueSoon.length} upcoming
              </span>
            )}
          </div>
          <div className="space-y-2">
            {maintenance.map((item, i) => {
              const isDue = item.status !== 'OK';
              return (
                <div
                  key={i}
                  className={[
                    'flex items-center gap-4 p-4 rounded-xl border transition-all',
                    isDue
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-revx-border bg-revx-card',
                  ].join(' ')}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDue ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-revx-platinum">{item.title}</div>
                    <div className="text-[10px] text-revx-titanium mt-0.5">
                      {item.dueOdometerKm && `Due at ${item.dueOdometerKm.toLocaleString()} km`}
                      {item.dueDate && ` · ${new Date(item.dueDate).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className={`text-[10px] font-semibold ${isDue ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {item.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-revx-surface border border-revx-border text-xs text-revx-titanium">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-revx-titanium/60" />
        <span>{data.disclaimer}</span>
      </div>
    </div>
  );
}
