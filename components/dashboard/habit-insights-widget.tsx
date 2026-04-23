"use client";

import { useQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { HabitInsightsPayload, HabitInsightDto, CategoryInsightDto } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchHabitInsights(): Promise<HabitInsightsPayload> {
  return requestApi<HabitInsightsPayload>("/api/analytics/habits");
}

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

type Strength = HabitInsightDto["strength"];

const STRENGTH_CONFIG: Record<
  Strength,
  { label: string; bar: string; badge: string; text: string }
> = {
  strong: {
    label: "Strong",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
  },
  moderate: {
    label: "Moderate",
    bar: "bg-sky-400",
    badge: "bg-sky-100 text-sky-700",
    text: "text-sky-700",
  },
  weak: {
    label: "Weak",
    bar: "bg-amber-300",
    badge: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
  },
  insufficient_data: {
    label: "Too little data",
    bar: "bg-slate-200",
    badge: "bg-slate-100 text-slate-400",
    text: "text-slate-400",
  },
};

function fmt(v: number | null): string {
  if (v === null) return "–";
  return v.toFixed(1);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HabitRow({ habit, rank }: { habit: HabitInsightDto; rank: number }) {
  const cfg = STRENGTH_CONFIG[habit.strength];
  const positive = (habit.moodLift ?? 0) > 0;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="mt-0.5 text-[11px] font-bold text-slate-300 tabular-nums w-4 shrink-0">
        #{rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{habit.habitLabel}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">{habit.category}</p>

        {/* Mood lift bar */}
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>
              On days: <span className="font-semibold text-slate-700">{fmt(habit.avgMoodOnCompletionDays)}</span>
              {" "}vs off: <span className="font-semibold text-slate-700">{fmt(habit.avgMoodOnNonCompletionDays)}</span>
            </span>
            <span className={`font-semibold ${positive ? "text-emerald-600" : "text-rose-500"}`}>
              {habit.moodLift !== null ? `${positive ? "+" : ""}${habit.moodLift.toFixed(2)}` : "–"}
            </span>
          </div>
          <div className="relative h-1.5 rounded-full bg-slate-200 overflow-hidden">
            {/* Center marker */}
            <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
            <div
              className={`absolute top-0 h-full rounded-full ${cfg.bar} transition-all`}
              style={{ left: "50%", width: `${Math.abs((habit.moodLift ?? 0) * 50)}%`, transform: positive ? "none" : "translateX(-100%)" }}
            />
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">{habit.completionDays} completion day{habit.completionDays === 1 ? "" : "s"}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ insight }: { insight: CategoryInsightDto }) {
  const cfg = STRENGTH_CONFIG[insight.strength];
  const positive = (insight.moodLift ?? 0) > 0;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className={`h-2 w-2 rounded-full shrink-0 ${cfg.bar}`} />
      <span className="text-xs font-medium text-slate-700">{insight.category}</span>
      <span className={`ml-auto text-[10px] font-semibold ${positive ? "text-emerald-600" : "text-rose-500"}`}>
        {insight.moodLift !== null ? `${positive ? "+" : ""}${insight.moodLift.toFixed(2)}` : "–"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function HabitInsightsWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["habit-insights"],
    queryFn: fetchHabitInsights,
    staleTime: 10 * 60 * 1000, // 10 min — matches route cache
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-52 animate-pulse rounded bg-slate-100" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Graceful degradation — widget simply disappears on error
  }

  if (data.topHabits.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Habit Insights
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Complete habits on days you log mood to build correlation data.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Habit Insights
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            Which habits lift your mood most
          </p>
        </div>
        <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-400 border border-slate-100">
          {data.moodEntriesAnalysed} mood days · {data.activeDays} active habit days
        </span>
      </div>

      {/* Category roll-up */}
      {data.categoryInsights.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            By category
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.categoryInsights.map((c) => (
              <CategoryPill key={c.category} insight={c} />
            ))}
          </div>
        </div>
      )}

      {/* Per-habit breakdown */}
      <div className="mt-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Top habits by mood lift
        </p>
        <div>
          {data.topHabits.map((habit, i) => (
            <HabitRow key={habit.habitId} habit={habit} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-3 text-[10px] text-slate-400">
        Lift = average mood on completion days minus non-completion days (scale 1–5).
        {data.analysisFromDate ? ` Analysis from ${data.analysisFromDate}.` : ""}
      </p>
    </section>
  );
}
