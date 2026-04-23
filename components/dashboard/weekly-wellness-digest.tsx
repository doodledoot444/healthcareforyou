"use client";

import { useMemo } from "react";
import { useDashboardData } from "@/providers/dashboard-data-provider";
import type { MoodEntry } from "@/features/mood/types";

function getLast7Days(): string[] {
  const days: string[] = [];
  const cursor = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(cursor);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function buildNarrative(
  avgScore: number,
  moodCount: number,
  journalCount: number,
  planProgress: number,
  streak: number,
): string {
  const parts: string[] = [];

  if (moodCount === 0) {
    parts.push("No mood check-ins this week yet.");
  } else if (avgScore >= 4) {
    parts.push(`Strong week — average mood was ${avgScore.toFixed(1)}/5 across ${moodCount} check-in${moodCount !== 1 ? "s" : ""}.`);
  } else if (avgScore >= 3) {
    parts.push(`Steady week — average mood was ${avgScore.toFixed(1)}/5 across ${moodCount} check-in${moodCount !== 1 ? "s" : ""}.`);
  } else {
    parts.push(`Challenging week — average mood was ${avgScore.toFixed(1)}/5 across ${moodCount} check-in${moodCount !== 1 ? "s" : ""}.`);
  }

  if (journalCount > 0) {
    parts.push(`You reflected ${journalCount} time${journalCount !== 1 ? "s" : ""}.`);
  } else {
    parts.push("No reflections written yet — a few words can shift your perspective.");
  }

  if (planProgress > 60) {
    parts.push(`Plan momentum is strong at ${planProgress}%.`);
  } else if (planProgress > 0) {
    parts.push(`Plan is at ${planProgress}% — consistency will compound it.`);
  } else {
    parts.push("No plan activity recorded yet this week.");
  }

  if (streak >= 5) {
    parts.push(`${streak}-day check-in streak — exceptional consistency.`);
  } else if (streak >= 2) {
    parts.push(`${streak}-day streak in progress — keep it going.`);
  }

  return parts.join(" ");
}

function SparkBar({ entry }: { entry: MoodEntry | null; dayLabel: string }) {
  const score = entry?.score ?? 0;
  const heightPercent = score > 0 ? Math.round((score / 5) * 100) : 0;
  const filled = score > 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-10 w-5 items-end overflow-hidden rounded-sm bg-slate-200">
        {filled ? (
          <div
            className="w-full rounded-sm bg-emerald-500 transition-all"
            style={{ height: `${heightPercent}%` }}
          />
        ) : null}
      </div>
      <span className="text-[10px] text-slate-500">{score > 0 ? score : "–"}</span>
    </div>
  );
}

export function WeeklyWellnessDigest() {
  const {
    moodEntries,
    moodStreak,
    isMoodLoading,
    journalEntries,
    isJournalLoading,
    activePlan,
    isPlansLoading,
  } = useDashboardData();

  const isLoading = isMoodLoading || isJournalLoading || isPlansLoading;

  const last7Days = useMemo(() => getLast7Days(), []);

  const weekMoods = useMemo(() => {
    const byDay = new Map<string, MoodEntry>();
    moodEntries.forEach((entry) => {
      const day = entry.entryDate.slice(0, 10);
      byDay.set(day, entry);
    });
    return last7Days.map((day) => ({ day, entry: byDay.get(day) ?? null }));
  }, [moodEntries, last7Days]);

  const weeklyStats = useMemo(() => {
    const thisWeekStart = last7Days[0];
    const weekEntries = moodEntries.filter((e) => e.entryDate.slice(0, 10) >= thisWeekStart);
    const avgScore =
      weekEntries.length > 0
        ? weekEntries.reduce((sum, e) => sum + e.score, 0) / weekEntries.length
        : 0;

    const weekJournals = journalEntries.filter(
      (e) => new Date(e.createdAt).toISOString().slice(0, 10) >= thisWeekStart,
    );

    return {
      moodCount: weekEntries.length,
      avgScore,
      journalCount: weekJournals.length,
      planProgress: activePlan?.progressPercentage ?? 0,
    };
  }, [moodEntries, journalEntries, activePlan, last7Days]);

  const narrative = useMemo(
    () =>
      buildNarrative(
        weeklyStats.avgScore,
        weeklyStats.moodCount,
        weeklyStats.journalCount,
        weeklyStats.planProgress,
        moodStreak.currentStreak,
      ),
    [weeklyStats, moodStreak.currentStreak],
  );

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Generating your weekly digest…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Weekly Wellness Digest
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Your week in health</h2>
        </div>
        <p className="text-xs text-slate-500">Last 7 days</p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">{narrative}</p>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mood sparkline</p>
        <div className="mt-3 flex items-end gap-2">
          {weekMoods.map(({ day, entry }) => (
            <SparkBar key={day} entry={entry} dayLabel={day} />
          ))}
        </div>
        <div className="mt-1 flex gap-2">
          {last7Days.map((day) => (
            <span key={day} className="w-5 text-center text-[10px] text-slate-400">
              {new Date(day).toLocaleDateString("en-US", { weekday: "narrow" })}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{weeklyStats.moodCount}</p>
          <p className="text-xs text-slate-500">Mood logs</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{weeklyStats.journalCount}</p>
          <p className="text-xs text-slate-500">Reflections</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{weeklyStats.planProgress}%</p>
          <p className="text-xs text-slate-500">Plan progress</p>
        </div>
      </div>
    </section>
  );
}
