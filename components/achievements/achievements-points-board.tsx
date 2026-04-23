"use client";

import { useMemo, useState } from "react";
import type { EvaluatedAchievement } from "@/features/achievements/service";
import type { MoodEntry } from "@/features/mood/types";
import { moodToLabel } from "@/features/mood/utils";

interface AchievementsPointsBoardProps {
  achievements: EvaluatedAchievement[];
  moods: MoodEntry[];
}

function withinDays(entryDate: string, days: number): boolean {
  const now = Date.now();
  const target = new Date(entryDate).getTime();
  const threshold = now - days * 24 * 60 * 60 * 1000;
  return target >= threshold;
}

function calculateStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const keys = new Set(entries.map((entry) => new Date(entry.entryDate).toISOString().slice(0, 10)));
  const cursor = new Date();
  let streak = 0;

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!keys.has(key)) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function AchievementsPointsBoard({ achievements, moods }: AchievementsPointsBoardProps) {
  const [daysFilter, setDaysFilter] = useState<7 | 30 | 60>(30);

  const filteredMoods = useMemo(
    () => moods.filter((entry) => withinDays(entry.entryDate, daysFilter)),
    [moods, daysFilter]
  );

  const points = useMemo(() => {
    const entryPoints = filteredMoods.length * 15;
    const positiveMoodPoints = filteredMoods.filter((entry) => entry.score >= 4).length * 5;
    const streakBonus = calculateStreak(filteredMoods) * 3;
    return {
      total: entryPoints + positiveMoodPoints + streakBonus,
      entryPoints,
      positiveMoodPoints,
      streakBonus,
    };
  }, [filteredMoods]);

  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const nextAchievement = achievements.find((item) => !item.unlocked) ?? null;
  const progressToNext = nextAchievement
    ? Math.min(100, Math.round((filteredMoods.length / nextAchievement.threshold) * 100))
    : 100;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mood impact points</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{points.total}</p>
            <p className="text-sm text-slate-600">{unlockedCount} achievements unlocked</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {([7, 30, 60] as const).map((window) => (
              <button
                key={window}
                type="button"
                onClick={() => setDaysFilter(window)}
                className={`rounded-full border px-3 py-1 transition ${
                  daysFilter === window
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                Last {window}d
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
          <p className="rounded-lg border border-slate-200 bg-white p-2">Mood logs: +{points.entryPoints}</p>
          <p className="rounded-lg border border-slate-200 bg-white p-2">Positive trend: +{points.positiveMoodPoints}</p>
          <p className="rounded-lg border border-slate-200 bg-white p-2">Streak bonus: +{points.streakBonus}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Next milestone</p>
          <p className="text-xs text-slate-500">
            {nextAchievement ? nextAchievement.title : "All milestones unlocked"}
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-600">
          {nextAchievement
            ? `${Math.max(0, nextAchievement.threshold - filteredMoods.length)} more mood logs needed in this window.`
            : "You have completed every current achievement target."}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Achievement ladder</p>
        <ul className="mt-3 space-y-2">
          {achievements.map((item) => (
            <li
              key={item.id}
              className={`rounded-lg border p-3 ${
                item.unlocked
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <span className="text-xs text-slate-600">{item.unlocked ? "Unlocked" : "In progress"}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              <p className="mt-1 text-xs text-slate-500">Target: {item.threshold} engagement points</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Recent mood logs and points</p>
        {filteredMoods.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No mood logs in this timeframe yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {filteredMoods
              .slice()
              .reverse()
              .slice(0, 8)
              .map((entry) => (
                <li key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{moodToLabel(entry.mood)}</p>
                    <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">+{15 + (entry.score >= 4 ? 5 : 0)} pts</p>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
