"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDashboardData } from "@/providers/dashboard-data-provider";
import type { PlanMoodAlignmentStatus, HabitMoodImpact, RankedHabit } from "@/lib/habit-correlation";

// ---------------------------------------------------------------------------
// Visual config
// ---------------------------------------------------------------------------

const ALIGNMENT_CONFIG: Record<
  PlanMoodAlignmentStatus,
  { label: string; badge: string; icon: string; tip: string }
> = {
  aligned: {
    label: "Aligned",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "✓",
    tip: "Plan progress and mood are in sync.",
  },
  boosting: {
    label: "Boosting",
    badge: "bg-sky-100 text-sky-700",
    icon: "↑",
    tip: "Your habits are ahead of your mood — keep going, a lift is likely soon.",
  },
  lagging: {
    label: "Lagging",
    badge: "bg-amber-100 text-amber-700",
    icon: "↓",
    tip: "Your mood is ahead of your habit completion — capture the momentum.",
  },
  insufficient_data: {
    label: "No data",
    badge: "bg-slate-100 text-slate-500",
    icon: "–",
    tip: "Log at least 3 mood entries to see alignment.",
  },
};

const IMPACT_CONFIG: Record<
  HabitMoodImpact,
  { label: string; dot: string; ring: string }
> = {
  high: { label: "High impact", dot: "bg-rose-500", ring: "ring-rose-200" },
  medium: { label: "Mid impact", dot: "bg-amber-400", ring: "ring-amber-200" },
  low: { label: "Low impact", dot: "bg-slate-300", ring: "ring-slate-200" },
};

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function AlignmentPill({ status }: { status: PlanMoodAlignmentStatus }) {
  const cfg = ALIGNMENT_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
      title={cfg.tip}
    >
      <span aria-hidden>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function HabitCard({
  habit,
  rank,
  onComplete,
}: {
  habit: RankedHabit;
  rank: number;
  onComplete: (habitId: string, planId: string) => void;
}) {
  const cfg = IMPACT_CONFIG[habit.moodImpact];
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={`flex gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm`}
    >
      {/* Rank + impact dot */}
      <div className="flex flex-col items-center gap-1.5 pt-0.5">
        <span className="text-[11px] font-bold text-slate-400">#{rank}</span>
        <span
          className={`h-2.5 w-2.5 rounded-full ring-2 ${cfg.dot} ${cfg.ring}`}
          title={cfg.label}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {habit.habitLabel}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.dot === "bg-rose-500" ? "bg-rose-50 text-rose-600" : cfg.dot === "bg-amber-400" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"}`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-400">{habit.planTitle} · {habit.planCategory}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{habit.rationale}</p>

        {/* Complete action */}
        <div className="mt-3">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Mark as done?</span>
              <button
                onClick={() => {
                  onComplete(habit.habitId, habit.planId);
                  setConfirming(false);
                }}
                className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                Yes, done
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
            >
              Mark complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary bar
// ---------------------------------------------------------------------------

function SummaryBar({
  avgMood7d,
  avgMood30d,
  completedRatio,
}: {
  avgMood7d: number | null;
  avgMood30d: number | null;
  completedRatio: number;
}) {
  const fmt = (v: number | null) => (v === null ? "–" : v.toFixed(1));
  const pct = Math.round(completedRatio * 100);

  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
      {[
        { label: "7-day mood avg", value: fmt(avgMood7d) + (avgMood7d !== null ? " / 5" : "") },
        { label: "30-day mood avg", value: fmt(avgMood30d) + (avgMood30d !== null ? " / 5" : "") },
        { label: "Habits complete", value: `${pct}%` },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-base font-bold text-slate-900">{s.value}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function HabitCorrelationBoard() {
  const { habitCorrelation, togglePlanItem, isPlansLoading, isMoodLoading } =
    useDashboardData();

  const [showAll, setShowAll] = useState(false);

  const { rankedHabits, planAlignments, avgMood7d, avgMood30d, completedRatio } =
    habitCorrelation;

  const displayedHabits = useMemo(
    () => (showAll ? rankedHabits : rankedHabits.slice(0, 3)),
    [rankedHabits, showAll],
  );

  const isLoading = isPlansLoading || isMoodLoading;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Habit Correlation
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            Mood-aware habit prioritisation
          </p>
        </div>
        <Link
          href="/dashboard/progress"
          className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          View plan →
        </Link>
      </div>

      {/* Summary stats */}
      <div className="mt-4">
        <SummaryBar
          avgMood7d={avgMood7d}
          avgMood30d={avgMood30d}
          completedRatio={completedRatio}
        />
      </div>

      {/* Plan alignments */}
      {planAlignments.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Plan vs mood alignment
          </p>
          <div className="flex flex-wrap gap-2">
            {planAlignments.map((a) => (
              <div
                key={a.planId}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]">
                  {a.planTitle}
                </span>
                <AlignmentPill status={a.status} />
                <span className="text-[10px] text-slate-400">{a.progressPct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranked habits */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {rankedHabits.length === 0
            ? "All habits complete"
            : `Top ${displayedHabits.length} habits by mood impact`}
        </p>

        {rankedHabits.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-sm font-semibold text-emerald-700">All habits complete 🎉</p>
            <p className="mt-1 text-xs text-emerald-600">
              Every habit in your plan is done. Your completion is fully captured.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedHabits.map((habit, idx) => (
              <HabitCard
                key={habit.habitId}
                habit={habit}
                rank={idx + 1}
                onComplete={(habitId, planId) =>
                  togglePlanItem({ planId, itemId: habitId })
                }
              />
            ))}
          </div>
        )}

        {rankedHabits.length > 3 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            {showAll
              ? "Show fewer"
              : `Show ${rankedHabits.length - 3} more habit${rankedHabits.length - 3 > 1 ? "s" : ""}`}
          </button>
        )}
      </div>
    </section>
  );
}
