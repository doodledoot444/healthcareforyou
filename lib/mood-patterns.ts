/**
 * Mood Pattern Detection Engine
 *
 * Pure functions — no React, no hooks, no side effects.
 * Detects longitudinal patterns from an array of MoodEntry objects.
 * Patterns are typed structs consumed by the recommendation engine
 * and the MoodTrendIntelligence component.
 *
 * Compatibility: extending patterns only requires adding a new detector
 * function and registering it in DETECTORS. No other files change.
 */

import type { MoodEntry } from "@/features/mood/types";

export type MoodPatternKind =
  | "sustained_decline"  // 3+ consecutive days with falling score
  | "sustained_high"     // 4+ consecutive days scoring ≥ 4
  | "rebound"            // low score followed by 2+ rising days
  | "volatile"           // std dev > 1.2 over last 7 entries
  | "day_of_week_low"    // a consistent weekday scores ≤ 2 (≥ 2 occurrences)
  | "consistent_neutral"; // last 5+ days all exactly score 3

export interface MoodPattern {
  kind: MoodPatternKind;
  headline: string;
  insight: string;
  affectedDays?: number;
  dayOfWeek?: string;
  improvementRate?: number;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function sortAscending(entries: MoodEntry[]): MoodEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Detectors — each returns MoodPattern | null
// ---------------------------------------------------------------------------

function detectSustainedDecline(sorted: MoodEntry[]): MoodPattern | null {
  const tail = sorted.slice(-7);
  if (tail.length < 3) return null;

  let maxStreak = 1;
  let streak = 1;

  for (let i = 1; i < tail.length; i++) {
    if ((tail[i]?.score ?? 0) < (tail[i - 1]?.score ?? 0)) {
      streak += 1;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 1;
    }
  }

  if (maxStreak < 3) return null;

  return {
    kind: "sustained_decline",
    headline: `${maxStreak}-day declining mood`,
    insight:
      "Your scores have been falling for several consecutive days. Small disruptions to sleep, nutrition, or social contact often drive multi-day dips. Naming the cause is the first step toward reversing it.",
    affectedDays: maxStreak,
  };
}

function detectSustainedHigh(sorted: MoodEntry[]): MoodPattern | null {
  const tail = sorted.slice(-7);
  if (tail.length < 4) return null;

  let streak = 0;
  for (let i = tail.length - 1; i >= 0; i--) {
    if ((tail[i]?.score ?? 0) >= 4) {
      streak += 1;
    } else {
      break;
    }
  }

  if (streak < 4) return null;

  return {
    kind: "sustained_high",
    headline: `${streak}-day positive streak`,
    insight:
      "You have maintained strong mood scores for several days in a row. Identify exactly what is working — a routine, a relationship, a habit — and protect it deliberately.",
    affectedDays: streak,
  };
}

function detectRebound(sorted: MoodEntry[]): MoodPattern | null {
  if (sorted.length < 4) return null;

  const tail = sorted.slice(-5);
  const scores = tail.map((e) => e.score);

  for (let i = 0; i < scores.length - 2; i++) {
    const low = scores[i] ?? 5;
    const next = scores[i + 1] ?? 0;
    const afterNext = scores[i + 2] ?? 0;

    if (low <= 2 && next > low && afterNext > next) {
      const rate = Math.round(((afterNext - low) / 4) * 100);
      return {
        kind: "rebound",
        headline: "Resilience pattern detected",
        insight: `You recovered from a score of ${low} to ${afterNext} over ${scores.length - i - 1} days — a ${rate}% recovery. This pattern is a signal of emotional resilience worth recognising and repeating.`,
        improvementRate: rate,
      };
    }
  }

  return null;
}

function detectVolatile(sorted: MoodEntry[]): MoodPattern | null {
  const tail = sorted.slice(-7);
  if (tail.length < 5) return null;

  const scores = tail.map((e) => e.score);
  const sd = stddev(scores);
  if (sd <= 1.2) return null;

  return {
    kind: "volatile",
    headline: "High mood variability this week",
    insight:
      "Your scores have been swinging significantly day to day. High variability often reflects external stressors or inconsistent sleep. Anchoring one stable daily routine tends to reduce the swings over a week.",
  };
}

function detectDayOfWeekLow(sorted: MoodEntry[]): MoodPattern | null {
  const recent = sorted.slice(-28);
  if (recent.length < 6) return null;

  const byDow = new Map<number, number[]>();
  for (const entry of recent) {
    const dow = new Date(entry.entryDate).getUTCDay();
    const arr = byDow.get(dow) ?? [];
    arr.push(entry.score);
    byDow.set(dow, arr);
  }

  for (const [dow, scores] of byDow) {
    if (scores.length < 2) continue;
    const avg = mean(scores);
    if (avg > 2.5) continue;

    // Build the day name from a known reference Sunday (2024-01-07 = Sunday = 0)
    const refSunday = Date.UTC(2024, 0, 7);
    const dayLabel = new Date(refSunday + dow * 86400000).toLocaleDateString("en-US", {
      weekday: "long",
    });

    return {
      kind: "day_of_week_low",
      headline: `${dayLabel}s tend to be harder`,
      insight: `Your average mood on ${dayLabel}s over recent weeks is ${avg.toFixed(1)}/5 — consistently below baseline. Awareness lets you pre-load light support habits before ${dayLabel} arrives.`,
      dayOfWeek: dayLabel,
    };
  }

  return null;
}

function detectConsistentNeutral(sorted: MoodEntry[]): MoodPattern | null {
  const tail = sorted.slice(-7);
  if (tail.length < 5) return null;

  const allNeutral = tail.every((e) => e.score === 3);
  if (!allNeutral) return null;

  return {
    kind: "consistent_neutral",
    headline: "Sustained neutral zone",
    insight:
      "Every recent check-in has landed at 3. Neutral is stable, but a prolonged plateau can signal drift or disconnection. Try adding one small novel element to your day and notice whether your scores shift.",
  };
}

// ---------------------------------------------------------------------------
// Public API — priority ordered, first match wins
// ---------------------------------------------------------------------------

const DETECTORS: ((sorted: MoodEntry[]) => MoodPattern | null)[] = [
  detectSustainedDecline,
  detectRebound,
  detectSustainedHigh,
  detectVolatile,
  detectDayOfWeekLow,
  detectConsistentNeutral,
];

export function computeMoodPattern(entries: MoodEntry[]): MoodPattern | null {
  if (entries.length < 3) return null;
  const sorted = sortAscending(entries);
  for (const detect of DETECTORS) {
    const result = detect(sorted);
    if (result !== null) return result;
  }
  return null;
}

/**
 * Returns all detected patterns sorted by detector priority.
 * Useful when the UI wants to display more than one insight.
 */
export function computeAllMoodPatterns(entries: MoodEntry[]): MoodPattern[] {
  if (entries.length < 3) return [];
  const sorted = sortAscending(entries);
  return DETECTORS.flatMap((detect) => {
    const result = detect(sorted);
    return result !== null ? [result] : [];
  });
}
