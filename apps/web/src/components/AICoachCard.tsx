'use client';

import React from 'react';
import { AICoachingInsight } from '@revx/shared';
import { Sparkles, CheckCircle2, AlertOctagon, Lightbulb, Zap, ShieldCheck } from 'lucide-react';

interface AICoachCardProps {
  insight?: AICoachingInsight;
  isProcessing?: boolean;
}

export function AICoachCard({ insight, isProcessing = false }: AICoachCardProps) {
  if (isProcessing) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
          <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
            RevX AI Coach Synthesizing Telemetry...
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Analyzing throttle transients, braking kinetics, and speed consistency against your historical profile...
        </p>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="glass-panel-glow p-6 rounded-2xl border border-emerald-500/30 flex flex-col gap-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-revx-platinum uppercase">
              RevX AI Coach
            </h3>
            <span className="text-[11px] text-slate-400">
              Personalized behavioural debrief • {insight.isCached ? 'Green Cached' : 'Live Analysis'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          {insight.model}
        </span>
      </div>

      {/* Summary Narrative */}
      <div>
        <p className="text-sm leading-relaxed text-slate-200 font-medium">
          {insight.summary}
        </p>
      </div>

      {/* Priority Action Callout */}
      {insight.priorityRecommendation && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/60 border-l-4 border-emerald-400 p-3.5 rounded-r-xl">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Priority Coaching Focus
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {insight.priorityRecommendation}
          </p>
        </div>
      )}

      {/* Dual Column: What Went Well & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positives */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              What Went Well
            </span>
          </div>
          <ul className="space-y-2">
            {insight.positivePoints.map((pt, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              How to Improve Next Time
            </span>
          </div>
          <ul className="space-y-2">
            {insight.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Historical baseline note */}
      {insight.historicalComparison && (
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{insight.historicalComparison}</span>
        </div>
      )}
    </div>
  );
}
