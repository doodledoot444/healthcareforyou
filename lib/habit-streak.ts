/**
 * Habit Streak Engine
 *
 * Pure functions — no React, no hooks, no DB access.
 *
 * Computes a consecutive-day habit streak from an array of ISO date strings
 * (UTC yyyy-mm-dd) representing days on which the user completed at least one
 * habit. Also evaluates milestone badges at 1/7/14/30/100 days.
 *
 * Design notes:
 * - "Active" streak: last completion was today or yesterday (UTC).
 * - Milestone badges are cumulative — unlocking 30 also unlocks 7 and 14.
 * - Pure and deterministic; pass `now` for test overrides.
 */

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type HabitMilestoneBadge =
  | "first_habit"   // 1 day
  | "habit_week"    // 7 days
  | "habit_fortnight" // 14 days
  | "habit_month"   // 30 days
  | "habit_century"; // 100 days

export interface HabitMilestone {
  badge: HabitMilestoneBadge;
  label: string;
  description: string;
  threshold: number;
  unlocked: boolean;
}

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // yyyy-mm-dd UTC
  milestones: HabitMilestone[];
  /** Threshold for next milestone; null if all milestones unlocked. */
  nextMilestoneAt: number | null;
}

// ---------------------------------------------------------------------------
// Milestone config
// ---------------------------------------------------------------------------

const MILESTONES: Array<Omit<HabitMilestone, "unlocked">> = [
  {
    badge: "first_habit",
    label: "First Step",
    description: "Complete your first habit day.",
    threshold: 1,
  },
  {
    badge: "habit_week",
    label: "Habit Week",
    description: "7 consecutive days of habit completions.",
    threshold: 7,
  },
  {
    badge: "habit_fortnight",
    label: "Fortnight Strong",
    description: "14 consecutive days of habit completions.",
    threshold: 14,
  },
  {
    badge: "habit_month",
    label: "Monthly Warrior",
    description: "30 consecutive days of habit completions.",
    threshold: 30,
  },
  {
    badge: "habit_century",
    label: "Century Achiever",
    description: "100 consecutive days of habit completions.",
    threshold: 100,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toUtcDateKey(d);
}

// ---------------------------------------------------------------------------
// Core engine
// ---------------------------------------------------------------------------

/**
 * Computes habit streak from a list of completion dates.
 * Dates may be duplicated; deduplication is applied internally.
 *
 * @param completedDateKeys - Array of UTC date strings ("yyyy-mm-dd") where
 *   the user completed at least one habit.
 * @param now - Override for current timestamp (useful for tests).
 */
export function computeHabitStreak(
  completedDateKeys: string[],
  now: Date = new Date(),
): HabitStreakResult {
  // Deduplicate + sort ascending
  const sorted = Array.from(new Set(completedDateKeys)).sort();

  if (sorted.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      milestones: MILESTONES.map((m) => ({ ...m, unlocked: false })),
      nextMilestoneAt: MILESTONES[0].threshold,
    };
  }

  // Compute longest streak (sliding window)
  let longestStreak = 1;
  let runningLongest = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addUtcDays(sorted[i - 1], 1) === sorted[i]) {
      runningLongest++;
    } else {
      runningLongest = 1;
    }
    if (runningLongest > longestStreak) longestStreak = runningLongest;
  }

  // Compute current streak from tail
  const todayKey = toUtcDateKey(now);
  const yesterdayKey = addUtcDays(todayKey, -1);
  const lastKey = sorted[sorted.length - 1];

  let currentStreak = 0;

  if (lastKey === todayKey || lastKey === yesterdayKey) {
    currentStreak = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      if (addUtcDays(sorted[i - 1], 1) === sorted[i]) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Milestone evaluation — based on longestStreak so milestones persist
  const milestones: HabitMilestone[] = MILESTONES.map((m) => ({
    ...m,
    unlocked: longestStreak >= m.threshold,
  }));

  const nextMilestone = MILESTONES.find((m) => longestStreak < m.threshold);
  const nextMilestoneAt = nextMilestone?.threshold ?? null;

  return {
    currentStreak,
    longestStreak,
    lastCompletionDate: lastKey,
    milestones,
    nextMilestoneAt,
  };
}
