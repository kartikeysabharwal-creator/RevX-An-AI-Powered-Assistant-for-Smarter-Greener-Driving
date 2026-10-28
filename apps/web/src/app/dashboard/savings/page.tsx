'use client';

import React, { useEffect, useState } from 'react';
import { Leaf, Fuel, PiggyBank, Info } from 'lucide-react';
import { getSavings, type SavingsData } from '@/lib/api';

export default function SavingsPage() {
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSavings()
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

  const m = data.thisMonth;
  const l = data.lifetime;

  const monthProgress = Math.min(100, (m.estimatedMoneySaved / Math.max(l.estimatedMoneySaved, 1)) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">Financial Impact</div>
        <h1 className="text-2xl font-black text-revx-platinum">Savings Dashboard</h1>
      </div>

      {/* Hero money saved card */}
      <div className="relative overflow-hidden bg-revx-surface border border-emerald-500/30 rounded-3xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-4">This Month's Savings</div>
          <div className="flex items-end gap-3 mb-6">
            <div className="text-6xl font-black font-mono text-revx-platinum" style={{ textShadow: '0 0 30px #10b98133' }}>
              {m.currency ?? '₹'}{m.estimatedMoneySaved.toFixed(2)}
            </div>
            <div className="text-sm text-emerald-400 font-semibold mb-2 pb-0.5">money saved</div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-revx-titanium mb-1.5">
              <span>Month progress</span>
              <span>{monthProgress.toFixed(0)}% of lifetime</span>
            </div>
            <div className="h-2 bg-revx-card rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${monthProgress}%`, boxShadow: '0 0 8px #10b981' }}
              />
            </div>
          </div>

          {/* Month stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-revx-card border border-revx-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">Fuel Avoided</div>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {m.estimatedFuelAvoidedLitres.toFixed(2)}
                <span className="text-sm font-normal text-revx-titanium ml-1">litres</span>
              </div>
            </div>
            <div className="bg-revx-card border border-revx-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-teal-400" />
                <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase">CO₂ Avoided</div>
              </div>
              <div className="text-2xl font-black font-mono text-teal-400">
                {m.estimatedCo2AvoidedKg.toFixed(2)}
                <span className="text-sm font-normal text-revx-titanium ml-1">kg CO₂</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime totals */}
      <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
        <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Lifetime Totals</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-revx-card border border-revx-border rounded-xl">
            <PiggyBank className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xl font-black font-mono text-emerald-400">
                {m.currency ?? '₹'}{l.estimatedMoneySaved.toFixed(2)}
              </div>
              <div className="text-[10px] text-revx-titanium">Total Money Saved</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-revx-card border border-revx-border rounded-xl">
            <Fuel className="w-8 h-8 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-xl font-black font-mono text-amber-400">
                {l.estimatedFuelAvoidedLitres.toFixed(2)} L
              </div>
              <div className="text-[10px] text-revx-titanium">Total Fuel Avoided</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-revx-card border border-revx-border rounded-xl">
            <Leaf className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <div className="text-xl font-black font-mono text-teal-400">
                {l.estimatedCo2AvoidedKg.toFixed(2)} kg
              </div>
              <div className="text-[10px] text-revx-titanium">Total CO₂ Avoided</div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-revx-surface border border-revx-border text-xs text-revx-titanium">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-revx-titanium/60" />
        <span>{data.disclaimer}</span>
      </div>
    </div>
  );
}
