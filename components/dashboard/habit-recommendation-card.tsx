"use client";

import { useHabitRecommendations } from "@/hooks/use-habit-recommendations";
import type { HabitRecommendation, RecommendationReason } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Reason chip config
// ---------------------------------------------------------------------------

const REASON_CONFIG: Record<
  RecommendationReason,
  { label: string; className: string }
> = {
  strong_mood_lift: {
    label: "Mood booster",
    className: "bg-emerald-100 text-emerald-700",
  },
  moderate_mood_lift: {
    label: "Lifts mood",
    className: "bg-teal-100 text-teal-700",
  },
  goal_alignment: {
    label: "Goal aligned",
    className: "bg-sky-100 text-sky-700",
  },
  category_gap: {
    label: "Balance gap",
    className: "bg-amber-100 text-amber-700",
  },
  not_tried_recently: {
    label: "Try again",
    className: "bg-slate-100 text-slate-600",
  },
};

const CATEGORY_BADGE: Record<string, string> = {
  Reading: "bg-violet-100 text-violet-700",
  "Self Improvement": "bg-blue-100 text-blue-700",
  Mindfulness: "bg-emerald-100 text-emerald-700",
};

// ---------------------------------------------------------------------------
// Single recommendation row
// ---------------------------------------------------------------------------

function RecommendationRow({ rec }: { rec: HabitRecommendation }) {
  const reason = REASON_CONFIG[rec.reason];
  const catClass = CATEGORY_BADGE[rec.category] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
      {/* Top row: label + chips */}
      <div className="flex flex-wrap items-start gap-2">
        <p className="flex-1 text-sm font-medium text-slate-800 leading-snug">
          {rec.habitLabel}
        </p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${reason.className}`}>
          {reason.label}
        </span>
      </div>

      {/* Meta row: category + mood lift */}
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${catClass}`}>
          {rec.category}
        </span>
        {rec.moodLiftEstimate !== null && (
          <span className="text-xs text-slate-500">
            +{rec.moodLiftEstimate.toFixed(1)} mood pts
          </span>
        )}
      </div>

      {/* Rationale */}
      <p className="text-xs leading-relaxed text-slate-500">{rec.rationale}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

export function HabitRecommendationCard() {
  const { data, isLoading, error } = useHabitRecommendations();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-5 w-44 animate-pulse rounded bg-slate-100" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return null;

  const recs = data?.recommendations ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Recommended Habits</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Ranked by mood-lift potential and goal alignment
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {recs.length} suggestion{recs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {recs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
          <p className="text-sm text-slate-400">
            Complete a few habits and log moods to unlock personalised recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recs.map((rec) => (
            <RecommendationRow key={rec.habitId} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
