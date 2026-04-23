/**
 * Habit Correlation Engine
 *
 * Pure functions — no React, no hooks, no side effects.
 *
 * Since PlanItem tracks CURRENT completion state (not historical per-day logs),
 * this engine computes the closest honest correlations the data model supports:
 *
 * 1. Plan-Mood Alignment Score — compares plan progressPercentage against the
 *    user's 7-day average mood score to classify each plan as aligned / boosting
 *    / lagging / insufficient_data.
 *
 * 2. Mood-Aware Habit Ranking — scores incomplete habits by estimated mood-lift
 *    potential given the current mood level, detected pattern, and habit category.
 *
 * 3. Summary Stats — avg mood 7d/30d, overall completion ratio across all plans.
 *
 * Compatibility: adding new pattern kinds or plan categories only requires
 * extending the CATEGORY_IMPACT and PATTERN_BOOST lookup tables.
 */

import type { MoodEntry } from "@/features/mood/types";
import type { Plan } from "@/features/plans/types";
import type { MoodPatternKind, MoodPattern } from "@/lib/mood-patterns";

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type HabitMoodImpact = "high" | "medium" | "low";

export interface RankedHabit {
  habitId: string;
  habitLabel: string;
  planId: string;
  planTitle: string;
  planCategory: string;
  /** Estimated mood-lift impact if this habit is completed today. */
  moodImpact: HabitMoodImpact;
  /** Plain-English rationale shown in the UI. */
  rationale: string;
}

export type PlanMoodAlignmentStatus =
  | "aligned"    // progress and mood are in sync
  | "boosting"   // plan completion is ahead of mood — habits may lift it soon
  | "lagging"    // mood is ahead of plan completion — momentum not yet captured
  | "insufficient_data"; // < 3 mood entries to compare against

export interface PlanMoodAlignment {
  planId: string;
  planTitle: string;
  progressPct: number;
  avgMood7d: number | null;
  status: PlanMoodAlignmentStatus;
}

export interface HabitCorrelationResult {
  /** Top incomplete habits ranked by estimated mood-lift potential, max 5. */
  rankedHabits: RankedHabit[];
  /** Per-plan alignment of completion progress vs mood. */
  planAlignments: PlanMoodAlignment[];
  avgMood7d: number | null;
  avgMood30d: number | null;
  /** Fraction of all habit items completed across all plans (0–1). */
  completedRatio: number;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function moodAvgOverDays(entries: MoodEntry[], days: number): number | null {
  const cutoff = Date.now() - days * 86_400_000;
  const recent = entries.filter((e) => new Date(e.entryDate).getTime() >= cutoff);
  return mean(recent.map((e) => e.score));
}

// ---------------------------------------------------------------------------
// Plan-Mood Alignment
//
// Maps plan progressPercentage (0–100) against avgMood7d (scaled 0–100 via
// score×20). Difference > 15 points is considered meaningful.
// ---------------------------------------------------------------------------

function alignmentStatus(
  progressPct: number,
  avgMood7d: number | null,
): PlanMoodAlignmentStatus {
  if (avgMood7d === null) return "insufficient_data";
  // Scale mood 1–5 → 20–100
  const moodScaled = avgMood7d * 20;
  const diff = progressPct - moodScaled;
  if (diff > 15) return "boosting";  // habits ahead of mood
  if (diff < -15) return "lagging";  // mood ahead of habits
  return "aligned";
}

// ---------------------------------------------------------------------------
// Habit ranking
//
// Score = baseCategoryScore (by PlanCategory) + patternBoost (by MoodPatternKind)
//         + moodLevelBoost (by current score bracket)
// ---------------------------------------------------------------------------

// How well each plan category addresses mood regulation
const CATEGORY_BASE: Record<string, number> = {
  Mindfulness: 3,
  "Self Improvement": 2,
  Reading: 1,
};

// Extra boost per active pattern — which categories help most
const PATTERN_BOOST: Partial<
  Record<MoodPatternKind, Partial<Record<string, number>>>
> = {
  sustained_decline: { Mindfulness: 3, "Self Improvement": 2, Reading: 1 },
  volatile: { Mindfulness: 3, Reading: 2, "Self Improvement": 1 },
  consistent_neutral: { "Self Improvement": 3, Reading: 2, Mindfulness: 1 },
  day_of_week_low: { Mindfulness: 2, "Self Improvement": 2, Reading: 1 },
  rebound: { "Self Improvement": 2, Mindfulness: 1, Reading: 1 },
  sustained_high: { "Self Improvement": 3, Reading: 2, Mindfulness: 1 },
};

// Extra boost based on current mood score
function moodLevelBoost(avgMood7d: number | null, category: string): number {
  if (avgMood7d === null) return 0;
  if (avgMood7d <= 2) {
    // Low mood — prioritise calming / grounding
    return category === "Mindfulness" ? 2 : 0;
  }
  if (avgMood7d <= 3) {
    // Neutral — any habit helps, slight preference for self improvement
    return category === "Self Improvement" ? 1 : 0;
  }
  // High mood — challenge and growth habits
  return category === "Self Improvement" ? 2 : 0;
}

function habitScore(
  category: string,
  pattern: MoodPattern | null,
  avgMood7d: number | null,
): number {
  const base = CATEGORY_BASE[category] ?? 1;
  const patBoost = pattern ? (PATTERN_BOOST[pattern.kind]?.[category] ?? 0) : 0;
  const moodBoost = moodLevelBoost(avgMood7d, category);
  return base + patBoost + moodBoost;
}

function scoreToImpact(score: number): HabitMoodImpact {
  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function buildRationale(
  category: string,
  impact: HabitMoodImpact,
  pattern: MoodPattern | null,
  avgMood7d: number | null,
): string {
  const moodDesc =
    avgMood7d === null
      ? "your recent entries"
      : avgMood7d <= 2
      ? "a low mood period"
      : avgMood7d <= 3
      ? "a neutral mood period"
      : "a positive mood period";

  if (pattern && impact === "high") {
    return `${category} habits tend to counteract the "${pattern.headline}" pattern — completing this now is high leverage.`;
  }
  if (impact === "high") {
    return `${category} habits are strongly matched to ${moodDesc}. Completing this is the highest-value action right now.`;
  }
  if (impact === "medium") {
    return `${category} habits support steady progress during ${moodDesc}. Worth completing before lower-priority tasks.`;
  }
  return `Complete when possible — any habit reinforces your routine during ${moodDesc}.`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function computeHabitCorrelation(
  moodEntries: MoodEntry[],
  plans: Plan[],
  moodPattern: MoodPattern | null,
): HabitCorrelationResult {
  const avgMood7d = moodAvgOverDays(moodEntries, 7);
  const avgMood30d = moodAvgOverDays(moodEntries, 30);

  // Overall completion ratio
  let totalItems = 0;
  let completedItems = 0;
  for (const plan of plans) {
    totalItems += plan.items.length;
    completedItems += plan.items.filter((i) => i.completed).length;
  }
  const completedRatio = totalItems === 0 ? 0 : completedItems / totalItems;

  // Plan-mood alignments
  const planAlignments: PlanMoodAlignment[] = plans.map((plan) => ({
    planId: plan.id,
    planTitle: plan.title,
    progressPct: plan.progressPercentage,
    avgMood7d,
    status: alignmentStatus(plan.progressPercentage, avgMood7d),
  }));

  // Ranked incomplete habits
  const ranked: (RankedHabit & { _score: number })[] = [];

  for (const plan of plans) {
    for (const item of plan.items) {
      if (item.completed) continue;
      const score = habitScore(plan.category, moodPattern, avgMood7d);
      const impact = scoreToImpact(score);
      ranked.push({
        habitId: item.id,
        habitLabel: item.label,
        planId: plan.id,
        planTitle: plan.title,
        planCategory: plan.category,
        moodImpact: impact,
        rationale: buildRationale(plan.category, impact, moodPattern, avgMood7d),
        _score: score,
      });
    }
  }

  ranked.sort((a, b) => b._score - a._score);

  const rankedHabits: RankedHabit[] = ranked.slice(0, 5).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ _score, ...rest }) => rest,
  );

  return { rankedHabits, planAlignments, avgMood7d, avgMood30d, completedRatio };
}
