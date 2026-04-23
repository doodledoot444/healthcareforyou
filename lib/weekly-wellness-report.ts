/**
 * Weekly Wellness Report Engine
 *
 * Pure functions — no React, no hooks, no DB access.
 *
 * Generates a structured weekly summary that can be rendered in the UI.
 * Covers the 7 days ending at the reference date (default: today UTC).
 *
 * Sections:
 * 1. Mood snapshot — avg, trend vs prior week, high/low days
 * 2. Habit summary — completion ratio, best category, missed streaks
 * 3. Journal engagement — entry count, avg words (from char count)
 * 4. Streak health — current mood streak + habit streak
 * 5. Standout moment — best scoring day with note (if any)
 * 6. Recommendation — one actionable insight for the coming week
 */

import type { MoodPattern } from "@/lib/mood-patterns";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface WeeklyMoodRecord {
  dateKey: string; // yyyy-mm-dd UTC
  score: number;
  note?: string | null;
}

export interface WeeklyHabitRecord {
  dateKey: string;
  category: string;
}

export interface WeeklyJournalRecord {
  dateKey: string;
  /** Rough character count used to estimate word count (chars / 5). */
  charCount: number;
}

export interface WeeklyReportInput {
  /** Exactly or up to 14 days of mood data (engine picks last 7 + prior 7). */
  moods: WeeklyMoodRecord[];
  /** Habit completion records for the last 7 days. */
  habitCompletions: WeeklyHabitRecord[];
  /** Journal entries for the last 7 days. */
  journalEntries: WeeklyJournalRecord[];
  currentMoodStreak: number;
  currentHabitStreak: number;
  moodPattern: MoodPattern | null;
  /** Override for "today" (useful for tests). */
  now?: Date;
}

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type WeekTrend = "improving" | "declining" | "stable" | "insufficient_data";

export interface WeeklyMoodSnapshot {
  avgScore: number | null;
  prevWeekAvgScore: number | null;
  trend: WeekTrend;
  bestDay: { dateKey: string; score: number; note?: string | null } | null;
  worstDay: { dateKey: string; score: number } | null;
  daysLogged: number;
}

export interface WeeklyHabitSummary {
  completedDays: number;
  /** Best performing category this week. */
  topCategory: string | null;
  /** Habit categories active this week. */
  activeCategories: string[];
  completionConsistency: "great" | "good" | "needs_work" | "no_data";
}

export interface WeeklyJournalSummary {
  entryCount: number;
  estimatedAvgWords: number;
  engagement: "deep" | "moderate" | "light" | "none";
}

export interface WeeklyStreakHealth {
  moodStreak: number;
  habitStreak: number;
  /** Combined streak health label. */
  combined: "excellent" | "good" | "building" | "at_risk";
}

export interface WeeklyWellnessReport {
  /** ISO week label e.g. "Apr 15 – Apr 22" */
  weekLabel: string;
  mood: WeeklyMoodSnapshot;
  habits: WeeklyHabitSummary;
  journal: WeeklyJournalSummary;
  streaks: WeeklyStreakHealth;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function addUtcDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(startKey: string, endKey: string): string {
  const fmt = (key: string) => {
    const d = new Date(`${key}T00:00:00Z`);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  };
  return `${fmt(startKey)} – ${fmt(endKey)}`;
}

function moodTrend(thisWeek: number | null, lastWeek: number | null): WeekTrend {
  if (thisWeek === null || lastWeek === null) return "insufficient_data";
  const delta = thisWeek - lastWeek;
  if (delta >= 0.3) return "improving";
  if (delta <= -0.3) return "declining";
  return "stable";
}

function completionConsistency(days: number): WeeklyHabitSummary["completionConsistency"] {
  if (days >= 6) return "great";
  if (days >= 4) return "good";
  if (days >= 1) return "needs_work";
  return "no_data";
}

function journalEngagement(count: number, avgWords: number): WeeklyJournalSummary["engagement"] {
  if (count === 0) return "none";
  if (count >= 5 && avgWords >= 70) return "deep";
  if (count >= 3 || avgWords >= 40) return "moderate";
  return "light";
}

function streakCombined(moodStreak: number, habitStreak: number): WeeklyStreakHealth["combined"] {
  const combined = moodStreak + habitStreak;
  if (combined >= 20) return "excellent";
  if (combined >= 10) return "good";
  if (combined >= 3) return "building";
  return "at_risk";
}

function buildRecommendation(
  mood: WeeklyMoodSnapshot,
  habits: WeeklyHabitSummary,
  journal: WeeklyJournalSummary,
  streaks: WeeklyStreakHealth,
  pattern: MoodPattern | null,
): string {
  if (streaks.combined === "at_risk") {
    return "Re-establish your foundation: log one mood entry and complete one habit daily for the next 3 days.";
  }

  if (mood.trend === "declining") {
    if (journal.engagement === "none" || journal.engagement === "light") {
      return "Your mood is dipping this week. Try writing even a one-line journal entry each day — it helps surface what's weighing on you.";
    }
    return "Mood is trending down. Focus on your single highest-impact habit to create a positive anchor for the week ahead.";
  }

  if (habits.completionConsistency === "needs_work" || habits.completionConsistency === "no_data") {
    return `Habit consistency is the lever to pull. Target ${habits.topCategory ?? "your active plan"} — even 4 of 7 days will start building momentum.`;
  }

  if (pattern?.kind === "sustained_high") {
    return "You're in a sustained high — protect your streak by scheduling tomorrow's habits now before the day gets busy.";
  }

  if (journal.engagement === "deep" && mood.trend === "improving") {
    return "Excellent week! Your journaling and improving mood are reinforcing each other. Challenge yourself to introduce one new habit category.";
  }

  if (mood.trend === "improving") {
    return `Great upward trend this week. Keep your ${habits.topCategory ?? "current habits"} consistent to sustain it.`;
  }

  return "Solid week overall. To level up: try journaling on your lowest-mood day next week to understand the pattern.";
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

export function computeWeeklyWellnessReport(input: WeeklyReportInput): WeeklyWellnessReport {
  const now = input.now ?? new Date();
  const todayKey = toDateKey(now);
  const weekStartKey = addUtcDays(todayKey, -6); // 7-day window (today inclusive)
  const prevWeekStartKey = addUtcDays(weekStartKey, -7);

  // Build date key sets for filtering
  const thisWeekDates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    thisWeekDates.add(addUtcDays(weekStartKey, i));
  }

  const prevWeekDates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    prevWeekDates.add(addUtcDays(prevWeekStartKey, i));
  }

  // ---------------------------------------------------------------------------
  // Mood snapshot
  // ---------------------------------------------------------------------------
  const thisWeekMoods = input.moods.filter((m) => thisWeekDates.has(m.dateKey));
  const prevWeekMoods = input.moods.filter((m) => prevWeekDates.has(m.dateKey));

  const thisAvg = mean(thisWeekMoods.map((m) => m.score));
  const prevAvg = mean(prevWeekMoods.map((m) => m.score));

  const bestDay =
    thisWeekMoods.length > 0
      ? thisWeekMoods.reduce((a, b) => (a.score >= b.score ? a : b))
      : null;
  const worstDay =
    thisWeekMoods.length > 0
      ? thisWeekMoods.reduce((a, b) => (a.score <= b.score ? a : b))
      : null;

  const mood: WeeklyMoodSnapshot = {
    avgScore: thisAvg !== null ? Math.round(thisAvg * 10) / 10 : null,
    prevWeekAvgScore: prevAvg !== null ? Math.round(prevAvg * 10) / 10 : null,
    trend: moodTrend(thisAvg, prevAvg),
    bestDay: bestDay ? { dateKey: bestDay.dateKey, score: bestDay.score, note: bestDay.note } : null,
    worstDay: worstDay ? { dateKey: worstDay.dateKey, score: worstDay.score } : null,
    daysLogged: thisWeekMoods.length,
  };

  // ---------------------------------------------------------------------------
  // Habit summary
  // ---------------------------------------------------------------------------
  const thisWeekHabits = input.habitCompletions.filter((h) => thisWeekDates.has(h.dateKey));
  const completedDaysSet = new Set(thisWeekHabits.map((h) => h.dateKey));
  const categoryCount = new Map<string, number>();
  for (const h of thisWeekHabits) {
    categoryCount.set(h.category, (categoryCount.get(h.category) ?? 0) + 1);
  }

  const topCategory =
    categoryCount.size > 0
      ? [...categoryCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null;

  const habits: WeeklyHabitSummary = {
    completedDays: completedDaysSet.size,
    topCategory,
    activeCategories: Array.from(categoryCount.keys()),
    completionConsistency: completionConsistency(completedDaysSet.size),
  };

  // ---------------------------------------------------------------------------
  // Journal summary
  // ---------------------------------------------------------------------------
  const thisWeekJournals = input.journalEntries.filter((j) => thisWeekDates.has(j.dateKey));
  const totalChars = thisWeekJournals.reduce((s, j) => s + j.charCount, 0);
  const estimatedAvgWords =
    thisWeekJournals.length > 0 ? Math.round(totalChars / thisWeekJournals.length / 5) : 0;

  const journal: WeeklyJournalSummary = {
    entryCount: thisWeekJournals.length,
    estimatedAvgWords,
    engagement: journalEngagement(thisWeekJournals.length, estimatedAvgWords),
  };

  // ---------------------------------------------------------------------------
  // Streak health
  // ---------------------------------------------------------------------------
  const streaks: WeeklyStreakHealth = {
    moodStreak: input.currentMoodStreak,
    habitStreak: input.currentHabitStreak,
    combined: streakCombined(input.currentMoodStreak, input.currentHabitStreak),
  };

  // ---------------------------------------------------------------------------
  // Recommendation
  // ---------------------------------------------------------------------------
  const recommendation = buildRecommendation(mood, habits, journal, streaks, input.moodPattern);

  return {
    weekLabel: formatWeekLabel(weekStartKey, todayKey),
    mood,
    habits,
    journal,
    streaks,
    recommendation,
  };
}
