/**
 * Wellness Goals Engine
 *
 * Pure functions — no React, no hooks, no DB access.
 *
 * Evaluates a set of user-defined wellness goals against their current metrics
 * and returns progress data ready for rendering.
 *
 * Supported goal types:
 *   mood_avg        — average mood score over the period (1–5 scale)
 *   habit_days      — days with ≥1 habit completion this period
 *   journal_entries — number of journal entries this period
 *   streak_days     — current consecutive-day streak (mood or habit combined)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WellnessGoalType =
  | "mood_avg"
  | "habit_days"
  | "journal_entries"
  | "streak_days";

export type WellnessGoalPeriod = "weekly" | "monthly";

export type GoalStatus = "on_track" | "at_risk" | "behind" | "achieved";

export interface WellnessGoalRecord {
  id: string;
  goalType: WellnessGoalType;
  target: number;
  period: WellnessGoalPeriod;
  label: string | null;
  isActive: boolean;
}

export interface GoalMetrics {
  /** Average mood score for the current period (null if no entries). */
  moodAvg: number | null;
  /** Number of days with ≥1 habit completion this period. */
  habitDays: number;
  /** Journal entry count this period. */
  journalEntries: number;
  /** Current streak (whichever is higher: mood or habit). */
  streakDays: number;
}

export interface EvaluatedGoal {
  id: string;
  goalType: WellnessGoalType;
  label: string;
  target: number;
  current: number | null;
  period: WellnessGoalPeriod;
  /** Progress 0–1; capped at 1. */
  progress: number;
  status: GoalStatus;
  /** Human-readable progress string e.g. "3.2 / 4.0" */
  progressLabel: string;
  /** Unit suffix e.g. "/ 5", "days", "entries" */
  unit: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_LABELS: Record<WellnessGoalType, string> = {
  mood_avg: "Average mood score",
  habit_days: "Active habit days",
  journal_entries: "Journal entries",
  streak_days: "Streak days",
};

const UNITS: Record<WellnessGoalType, string> = {
  mood_avg: "/ 5",
  habit_days: "days",
  journal_entries: "entries",
  streak_days: "days",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveCurrentValue(goalType: WellnessGoalType, metrics: GoalMetrics): number | null {
  switch (goalType) {
    case "mood_avg":
      return metrics.moodAvg;
    case "habit_days":
      return metrics.habitDays;
    case "journal_entries":
      return metrics.journalEntries;
    case "streak_days":
      return metrics.streakDays;
  }
}

function classifyStatus(progress: number, current: number | null): GoalStatus {
  if (current === null) return "behind";
  if (progress >= 1) return "achieved";
  if (progress >= 0.75) return "on_track";
  if (progress >= 0.4) return "at_risk";
  return "behind";
}

function formatProgressLabel(
  goalType: WellnessGoalType,
  current: number | null,
  target: number,
): string {
  const fmt = (v: number) =>
    goalType === "mood_avg" ? v.toFixed(1) : String(Math.round(v));

  const currentStr = current === null ? "–" : fmt(current);
  return `${currentStr} / ${fmt(target)}`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Evaluates all active goals against current metrics.
 * Pass only active goals — inactive ones are excluded by the caller.
 */
export function evaluateWellnessGoals(
  goals: WellnessGoalRecord[],
  metrics: GoalMetrics,
): EvaluatedGoal[] {
  return goals
    .filter((g) => g.isActive)
    .map((goal) => {
      const current = resolveCurrentValue(goal.goalType, metrics);
      const progress =
        current === null || goal.target === 0
          ? 0
          : Math.min(1, current / goal.target);

      return {
        id: goal.id,
        goalType: goal.goalType,
        label: goal.label ?? DEFAULT_LABELS[goal.goalType],
        target: goal.target,
        current,
        period: goal.period,
        progress,
        status: classifyStatus(progress, current),
        progressLabel: formatProgressLabel(goal.goalType, current, goal.target),
        unit: UNITS[goal.goalType],
      };
    });
}

/**
 * Returns default targets per goal type and period.
 * Used to pre-fill the goal creation form.
 */
export function defaultTarget(type: WellnessGoalType, period: WellnessGoalPeriod): number {
  const defaults: Record<WellnessGoalType, Record<WellnessGoalPeriod, number>> = {
    mood_avg: { weekly: 3.5, monthly: 3.5 },
    habit_days: { weekly: 5, monthly: 20 },
    journal_entries: { weekly: 3, monthly: 12 },
    streak_days: { weekly: 7, monthly: 30 },
  };
  return defaults[type][period];
}
