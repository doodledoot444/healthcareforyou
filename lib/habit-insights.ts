/**
 * Habit Insights Engine
 *
 * Pure functions — no React, no hooks, no DB access.
 *
 * Answers: "Which habits correlate most strongly with mood improvements?"
 *
 * Method:
 * 1. For each habit category, partition mood entries into two groups:
 *    - Days where the user had ≥1 completion in that category
 *    - Days where they had 0 completions in that category
 * 2. Compute average mood score for each group.
 * 3. The lift = (completion-day avg) - (non-completion-day avg).
 * 4. Rank categories by lift descending.
 * 5. Also produce per-habit lift scores using the same logic (within a category).
 *
 * Data model constraint: PlanCompletion records a completion timestamp; we
 * join by UTC date key to the daily mood entry.
 *
 * Exported types are reused by the API route and UI component.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface CompletionRecord {
  /** UTC date string yyyy-mm-dd */
  dateKey: string;
  habitId: string;
  habitLabel: string;
  category: string;
}

export interface DailyMoodRecord {
  /** UTC date string yyyy-mm-dd */
  dateKey: string;
  score: number;
}

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export interface HabitInsight {
  habitId: string;
  habitLabel: string;
  category: string;
  /** Average mood score on days this habit was completed. */
  avgMoodOnCompletionDays: number | null;
  /** Average mood score on days this habit was NOT completed. */
  avgMoodOnNonCompletionDays: number | null;
  /** Lift = completionAvg - nonCompletionAvg. Positive = helpful, negative = neutral/reactive. */
  moodLift: number | null;
  /** Number of days the habit was completed (sample size). */
  completionDays: number;
  /** Qualitative strength label. */
  strength: "strong" | "moderate" | "weak" | "insufficient_data";
}

export interface CategoryInsight {
  category: string;
  avgMoodOnCompletionDays: number | null;
  avgMoodOnNonCompletionDays: number | null;
  moodLift: number | null;
  completionDays: number;
  strength: "strong" | "moderate" | "weak" | "insufficient_data";
}

export interface HabitInsightsResult {
  /** Top insights by habit, ranked by lift descending. */
  topHabits: HabitInsight[];
  /** Category-level roll-up ranked by lift. */
  categoryInsights: CategoryInsight[];
  /** UTC date of the oldest mood entry used. */
  analysisFromDate: string | null;
  /** How many mood entries were analysed. */
  moodEntriesAnalysed: number;
  /** Calendar days with at least one habit completion. */
  activeDays: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function strengthLabel(lift: number | null, sampleSize: number): HabitInsight["strength"] {
  if (sampleSize < 3 || lift === null) return "insufficient_data";
  const abs = Math.abs(lift);
  if (abs >= 0.8) return "strong";
  if (abs >= 0.4) return "moderate";
  return "weak";
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

export function computeHabitInsights(
  completions: CompletionRecord[],
  dailyMoods: DailyMoodRecord[],
): HabitInsightsResult {
  // Build date→score map for O(1) lookup
  const moodByDate = new Map<string, number>();
  for (const dm of dailyMoods) {
    moodByDate.set(dm.dateKey, dm.score);
  }

  if (moodByDate.size === 0 || completions.length === 0) {
    return {
      topHabits: [],
      categoryInsights: [],
      analysisFromDate: null,
      moodEntriesAnalysed: 0,
      activeDays: 0,
    };
  }

  // All date keys where mood was logged
  const allMoodDates = Array.from(moodByDate.keys());
  const analysisFromDate = allMoodDates.sort()[0] ?? null;

  // Unique habit defs: habitId → {habitLabel, category}
  const habitDefs = new Map<string, { habitLabel: string; category: string }>();
  for (const c of completions) {
    if (!habitDefs.has(c.habitId)) {
      habitDefs.set(c.habitId, { habitLabel: c.habitLabel, category: c.category });
    }
  }

  // Per-habit completion dates
  const completionDatesByHabit = new Map<string, Set<string>>();
  for (const c of completions) {
    if (!completionDatesByHabit.has(c.habitId)) {
      completionDatesByHabit.set(c.habitId, new Set());
    }
    completionDatesByHabit.get(c.habitId)!.add(c.dateKey);
  }

  // Compute per-habit insight
  const habitInsights: HabitInsight[] = [];

  for (const [habitId, def] of habitDefs.entries()) {
    const completionDates = completionDatesByHabit.get(habitId) ?? new Set();

    const completionMoods: number[] = [];
    const nonCompletionMoods: number[] = [];

    for (const dateKey of allMoodDates) {
      const score = moodByDate.get(dateKey);
      if (score === undefined) continue;

      if (completionDates.has(dateKey)) {
        completionMoods.push(score);
      } else {
        nonCompletionMoods.push(score);
      }
    }

    const avgOn = mean(completionMoods);
    const avgOff = mean(nonCompletionMoods);
    const lift = avgOn !== null && avgOff !== null ? avgOn - avgOff : null;

    habitInsights.push({
      habitId,
      habitLabel: def.habitLabel,
      category: def.category,
      avgMoodOnCompletionDays: avgOn,
      avgMoodOnNonCompletionDays: avgOff,
      moodLift: lift,
      completionDays: completionDates.size,
      strength: strengthLabel(lift, completionDates.size),
    });
  }

  // Sort by lift desc (null last)
  habitInsights.sort((a, b) => {
    if (a.moodLift === null && b.moodLift === null) return 0;
    if (a.moodLift === null) return 1;
    if (b.moodLift === null) return -1;
    return b.moodLift - a.moodLift;
  });

  // Category roll-up
  const categoryCompletionDates = new Map<string, Set<string>>();
  for (const c of completions) {
    if (!categoryCompletionDates.has(c.category)) {
      categoryCompletionDates.set(c.category, new Set());
    }
    categoryCompletionDates.get(c.category)!.add(c.dateKey);
  }

  const categoryInsights: CategoryInsight[] = [];
  for (const [category, dates] of categoryCompletionDates.entries()) {
    const completionMoods: number[] = [];
    const nonCompletionMoods: number[] = [];

    for (const dateKey of allMoodDates) {
      const score = moodByDate.get(dateKey);
      if (score === undefined) continue;
      if (dates.has(dateKey)) {
        completionMoods.push(score);
      } else {
        nonCompletionMoods.push(score);
      }
    }

    const avgOn = mean(completionMoods);
    const avgOff = mean(nonCompletionMoods);
    const lift = avgOn !== null && avgOff !== null ? avgOn - avgOff : null;

    categoryInsights.push({
      category,
      avgMoodOnCompletionDays: avgOn,
      avgMoodOnNonCompletionDays: avgOff,
      moodLift: lift,
      completionDays: dates.size,
      strength: strengthLabel(lift, dates.size),
    });
  }

  categoryInsights.sort((a, b) => {
    if (a.moodLift === null && b.moodLift === null) return 0;
    if (a.moodLift === null) return 1;
    if (b.moodLift === null) return -1;
    return b.moodLift - a.moodLift;
  });

  const activeDays = new Set(completions.map((c) => c.dateKey)).size;

  return {
    topHabits: habitInsights.slice(0, 5),
    categoryInsights,
    analysisFromDate,
    moodEntriesAnalysed: moodByDate.size,
    activeDays,
  };
}
