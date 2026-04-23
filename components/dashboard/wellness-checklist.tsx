"use client";

import { useMemo } from "react";
import { useDashboardData } from "@/providers/dashboard-data-provider";
import type { HabitMoodImpact } from "@/lib/habit-correlation";

// ---------------------------------------------------------------------------
// Visual config for mood impact dots
// ---------------------------------------------------------------------------

const IMPACT_CONFIG: Record<
  HabitMoodImpact,
  { label: string; dot: string; ring: string }
> = {
  high: { label: "High impact", dot: "bg-rose-500", ring: "ring-rose-200" },
  medium: { label: "Mid impact", dot: "bg-amber-400", ring: "ring-amber-200" },
  low: { label: "Low impact", dot: "bg-slate-300", ring: "ring-slate-200" },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WellnessChecklist() {
  const { habitCorrelation, togglePlanItem, isPlansLoading, isMoodLoading, plans } =
    useDashboardData();

  const rankedHabits = useMemo(
    () => habitCorrelation.rankedHabits.slice(0, 5),
    [habitCorrelation.rankedHabits],
  );

  const isLoading = isPlansLoading || isMoodLoading;

  // Find which plan items in today's checklist are already completed
  const checkedCount = useMemo(() => {
    return rankedHabits.filter((h) => {
      const plan = plans.find((p) => p.id === h.planId);
      if (!plan) return false;
      const item = plan.items.find((i) => i.id === h.habitId);
      return item?.completed ?? false;
    }).length;
  }, [rankedHabits, plans]);

  const allCompleted = checkedCount === rankedHabits.length && rankedHabits.length > 0;

  const handleToggle = (habitId: string, planId: string) => {
    togglePlanItem({ planId, itemId: habitId });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (rankedHabits.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Daily Wellness Checklist
        </p>
        <p className="mt-2 text-sm text-slate-500">
          No habits yet. Create a plan to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Daily Wellness Checklist
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {checkedCount} of {rankedHabits.length} completed
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${(checkedCount / rankedHabits.length) * 100}%` }}
        />
      </div>

      {/* Streak bonus banner */}
      {allCompleted && rankedHabits.length >= 5 && (
        <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Streak bonus unlocked!</p>
            <p className="text-xs text-amber-700">All daily habits completed — momentum on your side.</p>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="mt-4 space-y-2">
        {rankedHabits.map((habit) => {
          const plan = plans.find((p) => p.id === habit.planId);
          const item = plan?.items.find((i) => i.id === habit.habitId);
          const isChecked = item?.completed ?? false;
          const cfg = IMPACT_CONFIG[habit.moodImpact];

          return (
            <label
              key={habit.habitId}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                isChecked
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(habit.habitId, habit.planId)}
                className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-emerald-600"
              />

              {/* Habit info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isChecked ? "text-slate-500 line-through" : "text-slate-900"
                  }`}
                >
                  {habit.habitLabel}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{habit.planTitle}</p>
              </div>

              {/* Mood impact dot */}
              <span
                className={`shrink-0 h-2.5 w-2.5 rounded-full ring-2 ${cfg.dot} ${cfg.ring}`}
                title={cfg.label}
              />
            </label>
          );
        })}
      </div>

      {/* Motivational footer */}
      {!allCompleted && checkedCount > 0 && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          {rankedHabits.length - checkedCount} habit{rankedHabits.length - checkedCount === 1 ? "" : "s"} left for the day
        </p>
      )}
    </section>
  );
}
