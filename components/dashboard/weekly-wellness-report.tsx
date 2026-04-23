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
// Visual config
// ---------------------------------------------------------------------------

type Trend = WeeklyReportPayload["mood"]["trend"];
type Consistency = WeeklyReportPayload["habits"]["completionConsistency"];
type Engagement = WeeklyReportPayload["journal"]["engagement"];
type Combined = WeeklyReportPayload["streaks"]["combined"];

const TREND_CONFIG: Record<Trend, { icon: string; label: string; colour: string }> = {
  improving: { icon: "↑", label: "Improving", colour: "text-emerald-600" },
  declining: { icon: "↓", label: "Declining", colour: "text-rose-500" },
  stable: { icon: "→", label: "Stable", colour: "text-sky-600" },
  insufficient_data: { icon: "–", label: "Not enough data", colour: "text-slate-400" },
};

const CONSISTENCY_CONFIG: Record<
  Consistency,
  { label: string; badge: string; bar: string; pct: number }
> = {
  great: { label: "Great", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", pct: 95 },
  good: { label: "Good", badge: "bg-sky-100 text-sky-700", bar: "bg-sky-400", pct: 70 },
  needs_work: { label: "Needs work", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400", pct: 35 },
  no_data: { label: "No habits", badge: "bg-slate-100 text-slate-400", bar: "bg-slate-200", pct: 0 },
};

const ENGAGEMENT_CONFIG: Record<
  Engagement,
  { label: string; badge: string }
> = {
  deep: { label: "Deep", badge: "bg-emerald-100 text-emerald-700" },
  moderate: { label: "Moderate", badge: "bg-sky-100 text-sky-700" },
  light: { label: "Light", badge: "bg-amber-100 text-amber-700" },
  none: { label: "None", badge: "bg-slate-100 text-slate-400" },
};

const COMBINED_CONFIG: Record<
  Combined,
  { label: string; icon: string; colour: string }
> = {
  excellent: { label: "Excellent", icon: "🌟", colour: "text-amber-600" },
  good: { label: "Good", icon: "💪", colour: "text-emerald-600" },
  building: { label: "Building", icon: "🔥", colour: "text-sky-600" },
  at_risk: { label: "At risk", icon: "⚠️", colour: "text-rose-500" },
};

// ---------------------------------------------------------------------------
// Section sub-components
// ---------------------------------------------------------------------------

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-base font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function MoodSection({ mood }: { mood: WeeklyReportPayload["mood"] }) {
  const trend = TREND_CONFIG[mood.trend];
  const fmt = (v: number | null) => (v === null ? "–" : v.toFixed(1));

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Mood
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <StatChip label="This week" value={mood.avgScore !== null ? `${fmt(mood.avgScore)} / 5` : "–"} />
        <StatChip label="Last week" value={mood.prevWeekAvgScore !== null ? `${fmt(mood.prevWeekAvgScore)} / 5` : "–"} />
        <StatChip label="Days logged" value={mood.daysLogged} />
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${trend.colour}`}>{trend.icon}</span>
        <span className={`text-xs font-semibold ${trend.colour}`}>{trend.label}</span>
        {mood.bestDay && (
          <span className="ml-auto text-[10px] text-slate-400">
            Best: <span className="font-semibold text-slate-600">{mood.bestDay.score}/5</span> on {mood.bestDay.dateKey}
          </span>
        )}
      </div>
      {mood.bestDay?.note && (
        <p className="mt-1 text-[11px] italic text-slate-500 truncate">
          &ldquo;{mood.bestDay.note}&rdquo;
        </p>
      )}
    </div>
  );
}

function HabitsSection({ habits }: { habits: WeeklyReportPayload["habits"] }) {
  const cfg = CONSISTENCY_CONFIG[habits.completionConsistency];

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Habits
      </p>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-slate-500">{habits.completedDays} / 7 days active</span>
        </div>
        {habits.topCategory && (
          <span className="text-[10px] text-slate-400">
            Best: <span className="font-semibold text-slate-600">{habits.topCategory}</span>
          </span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${cfg.bar}`}
          style={{ width: `${cfg.pct}%` }}
        />
      </div>
      {habits.activeCategories.length > 1 && (
        <p className="mt-1 text-[10px] text-slate-400">
          Active: {habits.activeCategories.join(", ")}
        </p>
      )}
    </div>
  );
}

function JournalSection({ journal }: { journal: WeeklyReportPayload["journal"] }) {
  const cfg = ENGAGEMENT_CONFIG[journal.engagement];

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Journal
      </p>
      <div className="flex items-center gap-3">
        <StatChip label="Entries" value={journal.entryCount} />
        <StatChip label="Avg words" value={journal.estimatedAvgWords > 0 ? `~${journal.estimatedAvgWords}` : "–"} />
        <div className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 px-4 py-3">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Engagement</p>
        </div>
      </div>
    </div>
  );
}

function StreaksSection({ streaks }: { streaks: WeeklyReportPayload["streaks"] }) {
  const cfg = COMBINED_CONFIG[streaks.combined];

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Streaks
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <StatChip label="Mood streak" value={`${streaks.moodStreak}d`} />
        <StatChip label="Habit streak" value={`${streaks.habitStreak}d`} />
        <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-base">{cfg.icon}</span>
          <div>
            <p className={`text-sm font-bold ${cfg.colour}`}>{cfg.label}</p>
            <p className="text-[10px] text-slate-400">Combined health</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function WeeklyWellnessReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weekly-wellness-report"],
    queryFn: fetchWeeklyReport,
    staleTime: 60 * 60 * 1000, // 1 hour — matches route cache
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

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
      </div>

      {/* Sections */}
      <div className="mt-5 space-y-5 divide-y divide-slate-100">
        <MoodSection mood={data.mood} />

        <div className="pt-5">
          <HabitsSection habits={data.habits} />
        </div>

        <div className="pt-5">
          <JournalSection journal={data.journal} />
        </div>

        <div className="pt-5">
          <StreaksSection streaks={data.streaks} />
        </div>

        {/* Recommendation */}
        <div className="pt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            This week&#39;s insight
          </p>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-emerald-800">{data.recommendation}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
