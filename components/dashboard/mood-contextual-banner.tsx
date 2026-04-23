"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDashboardData } from "@/providers/dashboard-data-provider";
import { computeTopRecommendation } from "@/lib/recommendations";
import type { RecommendationType } from "@/lib/recommendations";

const TYPE_ACCENT: Record<RecommendationType, string> = {
  journal_prompt: "border-violet-200 bg-violet-50",
  story: "border-sky-200 bg-sky-50",
  plan_habit: "border-emerald-200 bg-emerald-50",
  streak_nudge: "border-amber-200 bg-amber-50",
  celebrate: "border-emerald-200 bg-emerald-50",
  pattern_insight: "border-rose-200 bg-rose-50",
};

const TYPE_LABEL: Record<RecommendationType, string> = {
  journal_prompt: "Reflection prompt",
  story: "Suggested read",
  plan_habit: "Habit focus",
  streak_nudge: "Streak alert",
  celebrate: "Milestone",
  pattern_insight: "Trend insight",
};

const TYPE_CTA_STYLE: Record<RecommendationType, string> = {
  journal_prompt: "bg-violet-600 hover:bg-violet-500",
  story: "bg-sky-600 hover:bg-sky-500",
  plan_habit: "bg-emerald-600 hover:bg-emerald-500",
  streak_nudge: "bg-amber-600 hover:bg-amber-500",
  celebrate: "bg-emerald-600 hover:bg-emerald-500",
  pattern_insight: "bg-rose-600 hover:bg-rose-500",
};

function isTodayUtc(dateString: string): boolean {
  return dateString.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function MoodContextualBanner() {
  const {
    latestMoodEntry,
    moodEntries,
    stories,
    activePlan,
    moodStreak,
    journalEntries,
    isMoodLoading,
    moodPattern,
  } = useDashboardData();

  const journalCountToday = useMemo(
    () => journalEntries.filter((e) => isTodayUtc(e.createdAt)).length,
    [journalEntries],
  );

  const recommendation = useMemo(
    () =>
      computeTopRecommendation({
        latestMoodEntry,
        moodEntries,
        stories,
        activePlan,
        currentStreak: moodStreak.currentStreak,
        journalCountToday,
        moodPattern,
      }),
    [latestMoodEntry, moodEntries, stories, activePlan, moodStreak.currentStreak, journalCountToday, moodPattern],
  );

  if (isMoodLoading || recommendation === null) return null;

  const accent = TYPE_ACCENT[recommendation.type];
  const ctaStyle = TYPE_CTA_STYLE[recommendation.type];
  const label = TYPE_LABEL[recommendation.type];

  return (
    <div className={`rounded-2xl border p-4 transition-all ${accent}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{recommendation.headline}</p>
          <p className="mt-1 text-sm text-slate-700">{recommendation.body}</p>
        </div>
        {recommendation.cta ? (
          <Link
            href={recommendation.cta.href}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${ctaStyle}`}
          >
            {recommendation.cta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
