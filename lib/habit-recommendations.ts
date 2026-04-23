/**
 * Habit Recommendations Engine
 *
 * Pure functions — no React, no hooks, no DB access.
 *
 * Answers: "Which habits should the user try today?"
 *
 * Scoring model (higher = more recommended):
 *   moodLiftScore   — based on historical moodLift (strong=3, moderate=2, weak/none=0.5)
 *   recencyScore    — penalises recently-completed habits (never=2, >3days=1, ≤3days=0)
 *   goalBonus       — +1 if user is behind on a habit_days goal
 *   categoryGap     — +0.5 if this category has fewest completions this period
 *
 * Returns top N recommendations, deduped by habitId.
 */

import type { HabitInsight } from "@/lib/habit-insights";
import type { HabitRecommendation, RecommendationReason } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface PlanItemSeed {
  id: string;
  label: string;
  planId: string;
  planTitle: string;
  category: string;
}

export interface RecommendationInput {
  /** All available habit items across all plan templates. */
  allItems: PlanItemSeed[];
  /** Completion dateKeys for each habitId in the last 7 days. */
  recentCompletionsByHabit: Map<string, string[]>;
  /** Habit insight records from computeHabitInsights (may be empty). */
  habitInsights: HabitInsight[];
  /** Whether the user is behind on a habit_days wellness goal. */
  isBehindHabitGoal: boolean;
  /** Category completion counts for the current period (e.g. last 7 days). */
  categoryCompletionCounts: Map<string, number>;
  /** Max number of recommendations to return. */
  maxResults?: number;
}

// ---------------------------------------------------------------------------
// Internal scoring
// ---------------------------------------------------------------------------

const TODAY_KEY = new Date().toISOString().slice(0, 10);

function daysSince(dateKeys: string[]): number {
  if (dateKeys.length === 0) return Infinity;
  const latest = dateKeys.sort().at(-1)!;
  const diff =
    (new Date(TODAY_KEY).getTime() - new Date(latest).getTime()) / 86_400_000;
  return Math.max(0, diff);
}

function moodLiftScore(insight: HabitInsight | undefined): number {
  if (!insight || insight.moodLift === null) return 0;
  if (insight.strength === "strong") return 3;
  if (insight.strength === "moderate") return 2;
  if (insight.strength === "weak") return 0.5;
  return 0;
}

function recencyScore(dateKeys: string[]): number {
  const days = daysSince(dateKeys);
  if (days === Infinity) return 2; // never tried → highest recency bonus
  if (days > 3) return 1;
  return 0; // completed ≤3 days ago → no bonus (already doing it)
}

function primaryReason(
  insight: HabitInsight | undefined,
  isBehindGoal: boolean,
  isLowestCategory: boolean,
  dateKeys: string[],
): RecommendationReason {
  if (insight?.strength === "strong") return "strong_mood_lift";
  if (insight?.strength === "moderate") return "moderate_mood_lift";
  if (isBehindGoal) return "goal_alignment";
  if (isLowestCategory) return "category_gap";
  if (daysSince(dateKeys) === Infinity) return "not_tried_recently";
  return "not_tried_recently";
}

function buildRationale(
  reason: RecommendationReason,
  label: string,
  lift: number | null,
): string {
  switch (reason) {
    case "strong_mood_lift":
      return `"${label}" consistently lifts your mood by ~${lift?.toFixed(1)} pts on completion days.`;
    case "moderate_mood_lift":
      return `Your mood tends to be higher on days you complete "${label}".`;
    case "goal_alignment":
      return `You\'re behind on your habit-day goal — adding "${label}" helps close the gap.`;
    case "category_gap":
      return `You haven\'t logged much in this category recently. "${label}" can round out your routine.`;
    case "not_tried_recently":
      return `You haven\'t tried "${label}" in a while — now\'s a good time to revisit it.`;
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function computeHabitRecommendations(
  input: RecommendationInput,
): HabitRecommendation[] {
  const {
    allItems,
    recentCompletionsByHabit,
    habitInsights,
    isBehindHabitGoal,
    categoryCompletionCounts,
    maxResults = 5,
  } = input;

  const insightByHabitId = new Map<string, HabitInsight>(
    habitInsights.map((h) => [h.habitId, h]),
  );

  // Find category with fewest completions (used for gap detection)
  const minCategoryCount =
    categoryCompletionCounts.size > 0
      ? Math.min(...Array.from(categoryCompletionCounts.values()))
      : 0;

  const scoredItems = allItems.map((item) => {
    const dateKeys = recentCompletionsByHabit.get(item.id) ?? [];
    const insight = insightByHabitId.get(item.id);
    const catCount = categoryCompletionCounts.get(item.category) ?? 0;
    const isLowestCategory = catCount <= minCategoryCount;

    const score =
      moodLiftScore(insight) +
      recencyScore(dateKeys) +
      (isBehindHabitGoal ? 1 : 0) +
      (isLowestCategory ? 0.5 : 0);

    const reason = primaryReason(insight, isBehindHabitGoal, isLowestCategory, dateKeys);

    const recommendation: HabitRecommendation = {
      habitId: item.id,
      habitLabel: item.label,
      category: item.category,
      planId: item.planId,
      planTitle: item.planTitle,
      reason,
      rationale: buildRationale(reason, item.label, insight?.moodLift ?? null),
      moodLiftEstimate: insight?.moodLift ?? null,
      score,
    };

    return recommendation;
  });

  // Sort by score desc, deduplicate habit IDs, take top N
  const seen = new Set<string>();
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .filter((r) => {
      if (seen.has(r.habitId)) return false;
      seen.add(r.habitId);
      return true;
    })
    .slice(0, maxResults);
}
