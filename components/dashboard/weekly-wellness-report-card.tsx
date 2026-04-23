"use client";

import { useQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { WeeklyReportPayload } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchWeeklyReport(): Promise<WeeklyReportPayload> {
  return requestApi<WeeklyReportPayload>("/api/analytics/weekly-report");
}

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

const TREND_CONFIG = {
  improving: { icon: "↑", label: "Improving", class: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  declining: { icon: "↓", label: "Declining", class: "text-rose-600 bg-rose-50 border-rose-200" },
  stable: { icon: "→", label: "Stable", class: "text-sky-600 bg-sky-50 border-sky-200" },
  insufficient_data: { icon: "–", label: "Not enough data", class: "text-slate-400 bg-slate-50 border-slate-200" },
} as const;

const CONSISTENCY_CONFIG = {
  great: { label: "Great", dot: "bg-emerald-500", text: "text-emerald-700" },
  good: { label: "Good", dot: "bg-sky-400", text: "text-sky-700" },
  needs_work: { label: "Needs work", dot: "bg-amber-400", text: "text-amber-700" },
  no_data: { label: "No data", dot: "bg-slate-300", text: "text-slate-400" },
} as const;

const ENGAGEMENT_CONFIG = {
  deep: { label: "Deep", color: "text-emerald-700" },
  moderate: { label: "Moderate", color: "text-sky-700" },
  light: { label: "Light", color: "text-amber-700" },
  none: { label: "None", color: "text-slate-400" },
} as const;

const COMBINED_CONFIG = {
  excellent: { label: "Excellent", bar: "bg-emerald-500", pct: 100 },
  good: { label: "Good", bar: "bg-sky-400", pct: 72 },
  building: { label: "Building", bar: "bg-amber-400", pct: 44 },
  at_risk: { label: "At risk", bar: "bg-rose-400", pct: 18 },
} as const;

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {sub ? <p className="text-[10px] text-slate-400">{sub}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function WeeklyWellnessReportCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weekly-report"],
    queryFn: fetchWeeklyReport,
    staleTime: 60 * 60 * 1000, // 1 hour — matches route cache
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 h-4 w-44 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const trend = TREND_CONFIG[data.mood.trend];
  const consistency = CONSISTENCY_CONFIG[data.habits.completionConsistency];
  const engagement = ENGAGEMENT_CONFIG[data.journal.engagement];
  const combined = COMBINED_CONFIG[data.streaks.combined];

  const moodDelta =
    data.mood.avgScore !== null && data.mood.prevWeekAvgScore !== null
      ? data.mood.avgScore - data.mood.prevWeekAvgScore
      : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Weekly Wellness Report
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{data.weekLabel}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${trend.class}`}
        >
          <span aria-hidden>{trend.icon}</span>
          {trend.label}
        </span>
      </div>

      {/* Key stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 py-4">
        <StatBlock
          label="Mood avg"
          value={data.mood.avgScore !== null ? `${data.mood.avgScore}/5` : "–"}
          sub={moodDelta !== null ? `${moodDelta >= 0 ? "+" : ""}${moodDelta.toFixed(1)} vs last wk` : undefined}
        />
        <div className="h-full w-px bg-slate-200 mx-auto" />
        <StatBlock
          label="Mood days"
          value={String(data.mood.daysLogged)}
          sub="this week"
        />
        <div className="col-span-3 h-px bg-slate-200 my-1" />
        <StatBlock
          label="Habit days"
          value={String(data.habits.completedDays)}
          sub="of 7"
        />
        <div className="h-full w-px bg-slate-200 mx-auto" />
        <StatBlock
          label="Journal entries"
          value={String(data.journal.entryCount)}
          sub={data.journal.entryCount > 0 ? `~${data.journal.estimatedAvgWords} words avg` : undefined}
        />
      </div>

      {/* Section pills */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Habits */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Habits</p>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full shrink-0 ${consistency.dot}`} />
            <span className={`text-sm font-semibold ${consistency.text}`}>{consistency.label}</span>
          </div>
          {data.habits.topCategory && (
            <p className="mt-1 text-xs text-slate-500">
              Best category: <span className="font-medium text-slate-700">{data.habits.topCategory}</span>
            </p>
          )}
        </div>

        {/* Journal */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Journal</p>
          <span className={`text-sm font-semibold ${engagement.color}`}>{engagement.label}</span>
          <p className="mt-1 text-xs text-slate-500">
            {data.journal.entryCount} entr{data.journal.entryCount === 1 ? "y" : "ies"} this week
          </p>
        </div>

        {/* Streak health */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Streak health</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-slate-400">Mood</p>
                <p className="text-base font-bold text-slate-900">{data.streaks.moodStreak}d</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-xs text-slate-400">Habits</p>
                <p className="text-base font-bold text-slate-900">{data.streaks.habitStreak}d</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-700">{combined.label}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${combined.bar}`}
              style={{ width: `${combined.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Best day callout */}
      {data.mood.bestDay && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500 mb-1">
            Best day — {data.mood.bestDay.dateKey}
          </p>
          <p className="text-sm font-semibold text-emerald-900">
            Mood score: {data.mood.bestDay.score}/5
          </p>
          {data.mood.bestDay.note && (
            <p className="mt-1 text-xs text-emerald-700 italic">&ldquo;{data.mood.bestDay.note}&rdquo;</p>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-500 mb-1">
          This week&#39;s recommendation
        </p>
        <p className="text-sm text-amber-900 leading-relaxed">{data.recommendation}</p>
      </div>
    </section>
  );
}
