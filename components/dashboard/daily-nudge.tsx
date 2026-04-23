"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useDashboardData } from "@/providers/dashboard-data-provider";
import { useHabitStreak } from "@/hooks/use-habit-streak";
import { computeDailyNudge } from "@/lib/daily-nudge";
import type { DailyNudgePayload } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Clock sync: re-renders at the top of every hour
// ---------------------------------------------------------------------------

function getUtcHour(): number {
  return new Date().getUTCHours();
}

function subscribeToHourChange(callback: () => void): () => void {
  const msUntilNextHour = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setUTCMinutes(0, 0, 0);
    nextHour.setUTCHours(nextHour.getUTCHours() + 1);
    return nextHour.getTime() - now.getTime();
  };

  let timerId: ReturnType<typeof setTimeout>;

  const scheduleNext = () => {
    timerId = setTimeout(() => {
      callback();
      scheduleNext();
    }, msUntilNextHour());
  };

  scheduleNext();

  return () => clearTimeout(timerId);
}

// ---------------------------------------------------------------------------
// Accent colour map
// ---------------------------------------------------------------------------

const ACCENT_STYLES: Record<
  DailyNudgePayload["accent"],
  { wrapper: string; headline: string; body: string; indicator: string }
> = {
  emerald: {
    wrapper: "border-emerald-200 bg-emerald-50",
    headline: "text-emerald-900",
    body: "text-emerald-700",
    indicator: "bg-emerald-500",
  },
  amber: {
    wrapper: "border-amber-200 bg-amber-50",
    headline: "text-amber-900",
    body: "text-amber-700",
    indicator: "bg-amber-400",
  },
  sky: {
    wrapper: "border-sky-200 bg-sky-50",
    headline: "text-sky-900",
    body: "text-sky-700",
    indicator: "bg-sky-400",
  },
  slate: {
    wrapper: "border-slate-200 bg-slate-50",
    headline: "text-slate-700",
    body: "text-slate-500",
    indicator: "bg-slate-300",
  },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DailyNudge() {
  const { habitCorrelation, plans, isPlansLoading, isMoodLoading } = useDashboardData();
  const { streak, isLoading: isStreakLoading } = useHabitStreak();

  // Re-renders when the hour changes
  const utcHour = useSyncExternalStore(
    subscribeToHourChange,
    getUtcHour,
    // SSR snapshot — will rehydrate on client
    () => 0,
  );

  const nudge = useMemo<DailyNudgePayload>(() => {
    // Derive checked / total from plan data
    const rankedHabits = habitCorrelation.rankedHabits.slice(0, 5);
    let checkedCount = 0;

    for (const habit of rankedHabits) {
      const plan = plans.find((p) => p.id === habit.planId);
      const item = plan?.items.find((i) => i.id === habit.habitId);
      if (item?.completed) checkedCount++;
    }

    const topIncompleteHabit =
      rankedHabits.find((h) => {
        const plan = plans.find((p) => p.id === h.planId);
        const item = plan?.items.find((i) => i.id === h.habitId);
        return !item?.completed;
      })?.habitLabel ?? null;

    return computeDailyNudge({
      utcHour,
      checkedCount,
      totalHabits: rankedHabits.length,
      currentStreak: streak.currentStreak,
      topIncompleteHabit,
    });
  }, [utcHour, habitCorrelation, plans, streak]);

  if (isPlansLoading || isMoodLoading || isStreakLoading) {
    return (
      <div className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
    );
  }

  const style = ACCENT_STYLES[nudge.accent];

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${style.wrapper}`}
      role="status"
      aria-live="polite"
    >
      {/* Accent indicator */}
      <div className={`h-full w-1 shrink-0 self-stretch rounded-full ${style.indicator}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.headline}`}>{nudge.headline}</p>
        <p className={`mt-0.5 text-xs ${style.body}`}>{nudge.body}</p>
      </div>

      {/* Timing chip */}
      <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-500 border border-slate-200">
        {nudge.timing}
      </span>
    </div>
  );
}
