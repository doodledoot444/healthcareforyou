"use client";

import { useMemo } from "react";
import { useDashboardData } from "@/providers/dashboard-data-provider";
import { computeAllMoodPatterns } from "@/lib/mood-patterns";
import type { MoodPattern, MoodPatternKind } from "@/lib/mood-patterns";

// ---------------------------------------------------------------------------
// Visual config
// ---------------------------------------------------------------------------

const KIND_ICON: Record<MoodPatternKind, string> = {
  sustained_decline: "↘",
  sustained_high: "↗",
  rebound: "⤴",
  volatile: "⇅",
  day_of_week_low: "📅",
  consistent_neutral: "→",
};

const KIND_ACCENT: Record<MoodPatternKind, { card: string; badge: string; icon: string }> = {
  sustained_decline: {
    card: "border-rose-200 bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    icon: "text-rose-500",
  },
  sustained_high: {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "text-emerald-500",
  },
  rebound: {
    card: "border-sky-200 bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    icon: "text-sky-500",
  },
  volatile: {
    card: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    icon: "text-amber-500",
  },
  day_of_week_low: {
    card: "border-violet-200 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    icon: "text-violet-500",
  },
  consistent_neutral: {
    card: "border-slate-200 bg-slate-50",
    badge: "bg-slate-100 text-slate-600",
    icon: "text-slate-400",
  },
};

// ---------------------------------------------------------------------------
// Mini heatmap — 28-day calendar row
// ---------------------------------------------------------------------------

function scoreColor(score: number | undefined): string {
  if (score === undefined || score === 0) return "bg-slate-100";
  if (score === 1) return "bg-rose-400";
  if (score === 2) return "bg-orange-300";
  if (score === 3) return "bg-amber-300";
  if (score === 4) return "bg-emerald-300";
  return "bg-emerald-500";
}

function scoreLabel(score: number | undefined): string {
  if (score === undefined || score === 0) return "No entry";
  const labels = ["", "Very low", "Low", "Neutral", "Good", "Great"];
  return labels[score] ?? "Unknown";
}

function MoodHeatmap({ entries }: { entries: { date: string; score: number }[] }) {
  const cells = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const e of entries) {
      byDate.set(e.date.slice(0, 10), e.score);
    }

    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (27 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, score: byDate.get(key) };
    });
  }, [entries]);

  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        28-day mood map
      </p>
      <div className="flex gap-0.5">
        {cells.map((cell) => (
          <div
            key={cell.key}
            title={`${cell.key}: ${scoreLabel(cell.score)}`}
            className={`h-5 flex-1 rounded-sm ${scoreColor(cell.score)} transition-opacity hover:opacity-80`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" />
          Low
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-300" />
          Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          High
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-100" />
          No entry
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single pattern card
// ---------------------------------------------------------------------------

function PatternCard({ pattern, primary }: { pattern: MoodPattern; primary: boolean }) {
  const accent = KIND_ACCENT[pattern.kind];
  const icon = KIND_ICON[pattern.kind];

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${accent.card} ${
        primary ? "col-span-2 sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 text-xl leading-none ${accent.icon}`} aria-hidden>
          {icon}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{pattern.headline}</p>
            {pattern.affectedDays !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${accent.badge}`}>
                {pattern.affectedDays}d
              </span>
            )}
            {pattern.improvementRate !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${accent.badge}`}>
                +{pattern.improvementRate}% recovery
              </span>
            )}
            {pattern.dayOfWeek !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${accent.badge}`}>
                {pattern.dayOfWeek}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{pattern.insight}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick stat strip
// ---------------------------------------------------------------------------

function StatStrip({
  entries,
}: {
  entries: { date: string; score: number }[];
}) {
  const stats = useMemo(() => {
    const last7 = entries.slice(-7);
    const last30 = entries.slice(-30);
    const avg7 = last7.length
      ? (last7.reduce((s, e) => s + e.score, 0) / last7.length).toFixed(1)
      : "–";
    const avg30 = last30.length
      ? (last30.reduce((s, e) => s + e.score, 0) / last30.length).toFixed(1)
      : "–";
    const highDays = last30.filter((e) => e.score >= 4).length;
    const lowDays = last30.filter((e) => e.score <= 2).length;
    return { avg7, avg30, highDays, lowDays, total: entries.length };
  }, [entries]);

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: "7-day avg", value: stats.avg7 },
        { label: "30-day avg", value: stats.avg30 },
        { label: "High days (30d)", value: String(stats.highDays) },
        { label: "Low days (30d)", value: String(stats.lowDays) },
      ].map((item) => (
        <div key={item.label} className="rounded-lg bg-white/60 px-3 py-2.5 text-center">
          <p className="text-base font-bold text-slate-900">{item.value}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function MoodTrendIntelligence() {
  const { moodEntries, moodPattern, isMoodLoading } = useDashboardData();

  const allPatterns = useMemo(() => computeAllMoodPatterns(moodEntries), [moodEntries]);

  const heatmapData = useMemo(
    () =>
      moodEntries.map((e) => ({
        date: e.entryDate,
        score: e.score,
      })),
    [moodEntries],
  );

  if (isMoodLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (moodEntries.length < 3) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Mood Trend Intelligence
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Log at least 3 mood entries to unlock pattern detection and longitudinal insights.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Mood Trend Intelligence
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {moodPattern !== null
              ? `Pattern detected across ${moodEntries.length} entries`
              : `${moodEntries.length} entries logged — no dominant pattern yet`}
          </p>
        </div>
        <span className="text-xl" aria-hidden>
          🧠
        </span>
      </div>

      {/* Stat strip */}
      <StatStrip entries={heatmapData} />

      {/* 28-day heatmap */}
      <MoodHeatmap entries={heatmapData} />

      {/* Pattern cards */}
      {allPatterns.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Detected patterns
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allPatterns.map((p, idx) => (
              <PatternCard key={p.kind} pattern={p} primary={idx === 0} />
            ))}
          </div>
        </div>
      )}

      {allPatterns.length === 0 && (
        <p className="mt-4 text-xs text-slate-500">
          No strong pattern detected in recent entries. Keep logging — patterns emerge over 5–7
          consecutive days.
        </p>
      )}
    </section>
  );
}
