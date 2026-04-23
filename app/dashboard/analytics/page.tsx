"use client";

import { DashboardSectionShell } from "@/components/shared/section-shell";
import { useAnalyticsOverview } from "@/hooks/use-analytics-overview";
import { MoodSparklineCard } from "@/components/analytics/mood-sparkline-card";
import { HabitCategoryBarsCard } from "@/components/analytics/habit-category-bars-card";
import { AnalyticsKpiGrid } from "@/components/analytics/analytics-kpi-grid";

function ExportButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/api/export?format=json"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Export JSON
      </a>
      <a
        href="/api/export?format=csv"
        className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
      >
        Export CSV
      </a>
    </div>
  );
}

export default function DashboardAnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsOverview();

  return (
    <DashboardSectionShell
      title="Analytics"
      description="Your all-time and 30-day wellness analytics with export options."
    >
      <ExportButtons />

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : error || !data ? (
        <p className="text-sm text-slate-500">Could not load analytics right now.</p>
      ) : (
        <div className="space-y-4">
          <AnalyticsKpiGrid
            habitActiveDays30d={data.habitActiveDays30d}
            currentHabitStreak={data.currentHabitStreak}
            longestHabitStreak={data.longestHabitStreak}
            journalCount30d={data.journalCount30d}
            journalCountAllTime={data.journalCountAllTime}
            habitCompletionsAllTime={data.habitCompletionsAllTime}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <MoodSparklineCard timeline={data.moodTimeline} avgMood30d={data.avgMood30d} />
            <HabitCategoryBarsCard categories={data.habitsByCategory} />
          </div>
        </div>
      )}
    </DashboardSectionShell>
  );
}
