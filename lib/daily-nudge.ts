/**
 * Daily Nudge Engine
 *
 * Pure functions — no React, no hooks, no side effects.
 *
 * Produces a time-aware wellness nudge based on:
 * - Current UTC hour (0-23)
 * - How many habits are checked vs total
 * - The user's current habit streak
 * - The top habit label (highest ranked incomplete habit)
 *
 * Time bands:
 *   Morning   06:00–11:59  → motivate with the top habit for the day
 *   Afternoon 12:00–17:59  → remind if < 2 habits complete; praise if ≥ half done
 *   Evening   18:00–21:59  → celebrate completions or gentle wrap-up nudge
 *   Night     22:00–05:59  → streak summary / prepare for tomorrow
 */

import type { DailyNudgeTiming, DailyNudgePayload } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyNudgeInput {
  /** UTC hour 0-23 */
  utcHour: number;
  checkedCount: number;
  totalHabits: number;
  currentStreak: number;
  /** Label of the top-ranked incomplete habit, or null if all done */
  topIncompleteHabit: string | null;
}

// ---------------------------------------------------------------------------
// Timing classifier
// ---------------------------------------------------------------------------

function classifyTiming(utcHour: number): DailyNudgeTiming {
  if (utcHour >= 6 && utcHour < 12) return "morning";
  if (utcHour >= 12 && utcHour < 18) return "afternoon";
  if (utcHour >= 18 && utcHour < 22) return "evening";
  return "night";
}

// ---------------------------------------------------------------------------
// Nudge builders per band
// ---------------------------------------------------------------------------

function morningNudge(input: DailyNudgeInput): DailyNudgePayload {
  const { topIncompleteHabit, currentStreak, totalHabits } = input;

  if (currentStreak >= 7) {
    return {
      timing: "morning",
      headline: `🔥 Day ${currentStreak} — keep it going!`,
      body: topIncompleteHabit
        ? `Start with: "${topIncompleteHabit}"`
        : `All ${totalHabits} habits ready for today.`,
      accent: "amber",
    };
  }

  if (topIncompleteHabit) {
    return {
      timing: "morning",
      headline: "Good morning — your habits await",
      body: `Top priority today: "${topIncompleteHabit}"`,
      accent: "emerald",
    };
  }

  return {
    timing: "morning",
    headline: "Good morning!",
    body: `You have ${totalHabits} habit${totalHabits === 1 ? "" : "s"} lined up today.`,
    accent: "emerald",
  };
}

function afternoonNudge(input: DailyNudgeInput): DailyNudgePayload {
  const { checkedCount, totalHabits, topIncompleteHabit } = input;

  if (totalHabits === 0) {
    return {
      timing: "afternoon",
      headline: "Afternoon check-in",
      body: "Add a plan to start tracking your habits.",
      accent: "slate",
    };
  }

  const doneRatio = checkedCount / totalHabits;

  if (doneRatio >= 1) {
    return {
      timing: "afternoon",
      headline: "All habits done! ✅",
      body: "Incredible discipline — you completed everything before noon.",
      accent: "emerald",
    };
  }

  if (doneRatio >= 0.5) {
    return {
      timing: "afternoon",
      headline: `Halfway there — ${checkedCount}/${totalHabits} done`,
      body: topIncompleteHabit
        ? `Next up: "${topIncompleteHabit}"`
        : "Keep the momentum going!",
      accent: "sky",
    };
  }

  return {
    timing: "afternoon",
    headline: `${totalHabits - checkedCount} habit${totalHabits - checkedCount === 1 ? "" : "s"} still to go`,
    body: topIncompleteHabit
      ? `Best next action: "${topIncompleteHabit}"`
      : "Check off your habits before the day slips away.",
    accent: "amber",
  };
}

function eveningNudge(input: DailyNudgeInput): DailyNudgePayload {
  const { checkedCount, totalHabits, currentStreak } = input;

  if (totalHabits > 0 && checkedCount >= totalHabits) {
    return {
      timing: "evening",
      headline: `🎉 Full house — all ${totalHabits} habits complete!`,
      body: currentStreak > 0
        ? `Streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"} 🔥`
        : "First complete day — great start!",
      accent: "emerald",
    };
  }

  const remaining = totalHabits - checkedCount;

  if (remaining > 0) {
    return {
      timing: "evening",
      headline: `Evening wind-down — ${checkedCount}/${totalHabits} done`,
      body: `${remaining} habit${remaining === 1 ? "" : "s"} left. Every check matters for your streak.`,
      accent: "sky",
    };
  }

  return {
    timing: "evening",
    headline: "Evening check-in",
    body: "Add habits to your plan to track daily consistency.",
    accent: "slate",
  };
}

function nightNudge(input: DailyNudgeInput): DailyNudgePayload {
  const { currentStreak, checkedCount, totalHabits } = input;

  if (currentStreak >= 7) {
    return {
      timing: "night",
      headline: `🔥 ${currentStreak}-day streak — rest well`,
      body: "Your consistency is building something real. See you tomorrow.",
      accent: "amber",
    };
  }

  if (totalHabits > 0 && checkedCount >= totalHabits) {
    return {
      timing: "night",
      headline: "Full day complete — well done",
      body: "Reset tomorrow. Your streak continues.",
      accent: "emerald",
    };
  }

  return {
    timing: "night",
    headline: "Day wrapping up",
    body: "Prepare tomorrow's intentions before you sleep.",
    accent: "slate",
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function computeDailyNudge(input: DailyNudgeInput): DailyNudgePayload {
  const timing = classifyTiming(input.utcHour);

  switch (timing) {
    case "morning":
      return morningNudge(input);
    case "afternoon":
      return afternoonNudge(input);
    case "evening":
      return eveningNudge(input);
    case "night":
      return nightNudge(input);
  }
}
