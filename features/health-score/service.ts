import type { MoodEntry } from "@/features/mood/types";
import { buildMoodAnalytics } from "@/features/analytics/service";
import { toPercentage, clampScore } from "./utils";

/** Preserve original API — converts avg mood score to a simple 0-100 percentage. */
export function calculateHealthScore(entries: MoodEntry[]): number {
  const analytics = buildMoodAnalytics(entries);
  return toPercentage(analytics.averageScore);
}

// ---------------------------------------------------------------------------
// 4-pillar Health Score
// ---------------------------------------------------------------------------

export type HealthScoreGrade = "S" | "A" | "B" | "C" | "D";

export interface HealthScorePillar {
  key: string;
  label: string;
  /** Earned points for this pillar. */
  score: number;
  /** Maximum points for this pillar. */
  maxScore: number;
  description: string;
  tip: string;
}

export interface HealthScoreResult {
  /** Total score 0–100. */
  total: number;
  grade: HealthScoreGrade;
  pillars: HealthScorePillar[];
}

export interface HealthScoreInput {
  /** Recent mood entries (up to 90 days). */
  moodEntries: MoodEntry[];
  /** Current streak from MoodStreak table. */
  currentStreak: number;
  /** Journal entries created in the last 30 days. */
  journalCount30d: number;
  /** Fraction of all plan items completed (0–1). */
  planCompletedRatio: number;
}

function gradeFromTotal(total: number): HealthScoreGrade {
  if (total >= 90) return "S";
  if (total >= 75) return "A";
  if (total >= 55) return "B";
  if (total >= 35) return "C";
  return "D";
}

function avgScoreOverDays(entries: MoodEntry[], days: number): number {
  const cutoff = Date.now() - days * 86_400_000;
  const recent = entries.filter((e) => new Date(e.entryDate).getTime() >= cutoff);
  if (recent.length === 0) return 0;
  return recent.reduce((s, e) => s + e.score, 0) / recent.length;
}

function entryCountOverDays(entries: MoodEntry[], days: number): number {
  const cutoff = Date.now() - days * 86_400_000;
  return entries.filter((e) => new Date(e.entryDate).getTime() >= cutoff).length;
}

/**
 * Computes the 4-pillar adaptive health score.
 *
 * Pillars and max points:
 *   Mood Consistency   — 30 pts  (avg score 30d × 4pts + frequency bonus 10pts)
 *   Journal Engagement — 25 pts  (entries last 30d, cap 20 = full)
 *   Plan Progress      — 25 pts  (completion ratio × 25)
 *   Streak Momentum    — 20 pts  (currentStreak, cap 14d = full)
 */
export function computeHealthScore(input: HealthScoreInput): HealthScoreResult {
  const { moodEntries, currentStreak, journalCount30d, planCompletedRatio } = input;

  // --- Pillar 1: Mood Consistency (30 pts) ---
  const avg30 = avgScoreOverDays(moodEntries, 30);
  const moodAvgScore = clampScore((avg30 / 5) * 20, 20); // 0-20 from avg
  const moodFreqRaw = entryCountOverDays(moodEntries, 7);
  const moodFreqScore = clampScore((moodFreqRaw / 7) * 10, 10); // 0-10 from freq
  const moodTotal = moodAvgScore + moodFreqScore;

  // --- Pillar 2: Journal Engagement (25 pts) ---
  const journalTotal = clampScore((journalCount30d / 20) * 25, 25);

  // --- Pillar 3: Plan Progress (25 pts) ---
  const planTotal = clampScore(planCompletedRatio * 25, 25);

  // --- Pillar 4: Streak Momentum (20 pts) ---
  const streakTotal = clampScore((currentStreak / 14) * 20, 20);

  const total = moodTotal + journalTotal + planTotal + streakTotal;

  return {
    total,
    grade: gradeFromTotal(total),
    pillars: [
      {
        key: "mood",
        label: "Mood Consistency",
        score: moodTotal,
        maxScore: 30,
        description: `Avg score ${avg30.toFixed(1)}/5 · ${moodFreqRaw} check-ins this week`,
        tip:
          moodTotal < 20
            ? "Log mood daily and aim for scores above 3 to raise this pillar."
            : "Strong consistency — keep the daily check-in habit going.",
      },
      {
        key: "journal",
        label: "Journal Engagement",
        score: journalTotal,
        maxScore: 25,
        description: `${journalCount30d} entr${journalCount30d === 1 ? "y" : "ies"} in the last 30 days`,
        tip:
          journalTotal < 15
            ? "Aim for at least one journal entry every few days to build this pillar."
            : "Great reflection habit. Keep writing consistently.",
      },
      {
        key: "plan",
        label: "Plan Progress",
        score: planTotal,
        maxScore: 25,
        description: `${Math.round(planCompletedRatio * 100)}% of habits completed`,
        tip:
          planTotal < 15
            ? "Complete more plan habits to raise this pillar — even 50% makes a big difference."
            : "Solid plan follow-through. Target 80%+ to reach the top tier.",
      },
      {
        key: "streak",
        label: "Streak Momentum",
        score: streakTotal,
        maxScore: 20,
        description: `${currentStreak}-day active streak`,
        tip:
          streakTotal < 10
            ? "Build a 7+ day streak by logging mood every day without a gap."
            : "Excellent streak momentum. Protect it by checking in before midnight.",
      },
    ],
  };
}
