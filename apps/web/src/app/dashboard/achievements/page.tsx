'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Lock, Flame, CheckCircle2, Star } from 'lucide-react';
import {
  getAchievements,
  getChallenges,
  getStreaks,
  type AchievementsData,
  type ChallengesData,
  type StreakData,
} from '@/lib/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StreakGrid({ streak }: { streak: StreakData }) {
  const progress = streak.weeklyProgress ?? DAYS.map((d) => ({ day: d, active: false }));
  return (
    <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">Streak</div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-3xl font-black font-mono text-revx-platinum">{streak.currentStreakDays}</span>
            <span className="text-sm text-revx-titanium">days</span>
          </div>
          <div className="text-xs text-revx-titanium mt-0.5">{streak.headline}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-revx-titanium mb-1">Longest</div>
          <div className="text-xl font-black font-mono text-amber-400">{streak.longestStreakDays}d</div>
        </div>
      </div>
      {/* 7-day grid */}
      <div className="flex gap-2 mt-4">
        {DAYS.map((day, i) => {
          const entry = progress.find((p) => p.day?.startsWith(day)) ?? progress[i];
          const active = entry?.active ?? false;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={[
                  'w-full h-10 rounded-xl border flex items-center justify-center transition-all',
                  active
                    ? 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-revx-card border-revx-border opacity-40',
                ].join(' ')}
              >
                {active && <Flame className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[9px] text-revx-titanium">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [challenges, setChallenges] = useState<ChallengesData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAchievements(), getChallenges(), getStreaks()])
      .then(([a, c, s]) => {
        setAchievements(a);
        setChallenges(c);
        setStreak(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-revx-border border-t-emerald-400 animate-spin" />
    </div>
  );
  if (error) return <div className="text-center py-20 text-rose-400">{error}</div>;

  const unlockedIds = new Set((achievements?.unlocked ?? []).map((u) => u.achievementId));
  const catalog = achievements?.catalog ?? [];
  const unlocked = catalog.filter((a) => unlockedIds.has(a.id));
  const locked = catalog.filter((a) => !unlockedIds.has(a.id));
  const activeChallenges = (challenges?.userChallenges ?? []).filter((c) => !c.isCompleted);
  const completedChallenges = (challenges?.userChallenges ?? []).filter((c) => c.isCompleted);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-1">Gamification</div>
        <h1 className="text-2xl font-black text-revx-platinum">Achievements</h1>
      </div>

      {/* Streak */}
      {streak && <StreakGrid streak={streak} />}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">
            Active Challenges
          </div>
          <div className="space-y-4">
            {activeChallenges.map((uc) => {
              const ch = uc.challenge;
              const pct = Math.min(100, (uc.currentValue / ch.targetValue) * 100);
              return (
                <div key={uc.id} className="bg-revx-card border border-revx-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ch.icon}</span>
                      <div>
                        <div className="font-semibold text-revx-platinum text-sm">{ch.title}</div>
                        <div className="text-[10px] text-revx-titanium">{ch.description}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-xs font-bold text-emerald-400">+{ch.rewardPoints} pts</div>
                      <div className="text-[10px] text-revx-titanium">{ch.durationDays}d challenge</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-revx-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${pct}%`, boxShadow: pct > 20 ? '0 0 6px #10b981' : 'none' }}
                      />
                    </div>
                    <div className="text-xs text-revx-titanium flex-shrink-0">
                      {uc.currentValue.toFixed(1)} / {ch.targetValue}
                    </div>
                    <div className="text-xs font-bold text-emerald-400 flex-shrink-0">{pct.toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="bg-revx-surface border border-revx-border rounded-2xl p-6">
          <div className="text-[10px] text-revx-titanium font-semibold tracking-widest uppercase mb-4">Completed Challenges</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedChallenges.map((uc) => (
              <div key={uc.id} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <span className="text-xl">{uc.challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-revx-platinum truncate">{uc.challenge.title}</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-sm font-bold text-revx-platinum">Unlocked — {unlocked.length}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((a) => {
              const ua = achievements?.unlocked.find((u) => u.achievementId === a.id);
              return (
                <div
                  key={a.id}
                  className="relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-revx-surface border border-amber-500/30 rounded-2xl p-5"
                >
                  <div className="absolute top-3 right-3 opacity-20">
                    <Star className="w-12 h-12 text-amber-400" />
                  </div>
                  <div className="text-3xl mb-3">{a.icon}</div>
                  <div className="font-bold text-revx-platinum text-sm mb-1">{a.name}</div>
                  <div className="text-[10px] text-revx-titanium leading-relaxed">{a.description}</div>
                  {ua && (
                    <div className="text-[9px] text-amber-400/70 mt-2">
                      Unlocked {new Date(ua.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-revx-titanium" />
            <div className="text-sm font-bold text-revx-titanium">Locked — {locked.length} to unlock</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((a) => (
              <div
                key={a.id}
                className="relative overflow-hidden bg-revx-surface border border-revx-border rounded-2xl p-5 opacity-60"
              >
                <div className="text-3xl mb-3 grayscale">{a.icon}</div>
                <div className="font-bold text-revx-platinum text-sm mb-1">{a.name}</div>
                <div className="text-[10px] text-revx-titanium leading-relaxed">{a.description}</div>
                <div className="text-[10px] text-revx-titanium/50 mt-2">Requirement: {a.requirement}</div>
                <div className="absolute top-3 right-3">
                  <Lock className="w-3.5 h-3.5 text-revx-titanium" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
