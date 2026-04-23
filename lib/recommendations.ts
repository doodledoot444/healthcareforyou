/**
 * Recommendation Engine
 *
 * Pure functions — no React, no hooks, no side effects.
 * Takes structured snapshot of user health state and returns
 * typed recommendations suitable for contextual surface anywhere in the app.
 *
 * Extensible: add new rules to RECOMMENDATION_RULES without touching consumers.
 */

import type { MoodEntry } from "@/features/mood/types";
import type { StoryDto } from "@/lib/api/contracts";
import type { Plan } from "@/features/plans/types";
import type { MoodPattern } from "@/lib/mood-patterns";
import { pickJournalPromptByScore } from "@/lib/journal-prompts";

export type RecommendationType =
  | "journal_prompt"
  | "story"
  | "plan_habit"
  | "streak_nudge"
  | "celebrate"
  | "pattern_insight";

export interface Recommendation {
  id: string;
  type: RecommendationType;
  headline: string;
  body: string;
  /** Optional CTA label and target href. */
  cta?: { label: string; href: string };
  /** Priority — lower value renders first. */
  priority: number;
}

export interface HealthSnapshot {
  latestMoodEntry: MoodEntry | null;
  moodEntries: MoodEntry[];
  stories: StoryDto[];
  activePlan: Plan | null;
  currentStreak: number;
  journalCountToday: number;
  /** Populated by computeMoodPattern — undefined means not yet computed. */
  moodPattern?: MoodPattern | null;
}

// ---------------------------------------------------------------------------
// Internal rule helpers
// ---------------------------------------------------------------------------

function pickStory(stories: StoryDto[], score: number): StoryDto | null {
  if (stories.length === 0) return null;
  // Low mood → shortest/gentlest stories; high mood → longest for challenge.
  const sorted =
    score <= 2
      ? [...stories].sort((a, b) => a.readingTimeMinutes - b.readingTimeMinutes)
      : [...stories].sort((a, b) => b.readingTimeMinutes - a.readingTimeMinutes);
  return sorted[0] ?? null;
}

function pickIncompleteHabit(plan: Plan | null): string | null {
  if (!plan) return null;
  const incomplete = plan.items.find((item) => !item.completed);
  return incomplete?.label ?? null;
}

// ---------------------------------------------------------------------------
// Rule evaluators — each returns a Recommendation or null
// ---------------------------------------------------------------------------

function ruleLowMoodStory(snapshot: HealthSnapshot): Recommendation | null {
  const score = snapshot.latestMoodEntry?.score ?? null;
  if (score === null || score > 2) return null;

  const story = pickStory(snapshot.stories, score);
  if (!story) return null;

  return {
    id: "low-mood-story",
    type: "story",
    headline: "A short read for moments like this",
    body: `"${story.title}" — ${story.summary}`,
    cta: { label: "Read now", href: "/dashboard/stories" },
    priority: 1,
  };
}

function ruleLowMoodJournalPrompt(snapshot: HealthSnapshot): Recommendation | null {
  const score = snapshot.latestMoodEntry?.score ?? null;
  if (score === null || score > 2) return null;
  if (snapshot.journalCountToday > 0) return null;

  const prompt = pickJournalPromptByScore(score);

  return {
    id: "low-mood-journal-prompt",
    type: "journal_prompt",
    headline: "Try writing one sentence",
    body: prompt,
    cta: { label: "Open journal", href: "/dashboard/journal" },
    priority: 2,
  };
}

function ruleNeutralPlanHabit(snapshot: HealthSnapshot): Recommendation | null {
  const score = snapshot.latestMoodEntry?.score ?? null;
  if (score === null || score !== 3) return null;

  const habit = pickIncompleteHabit(snapshot.activePlan);
  if (!habit) return null;

  return {
    id: "neutral-plan-habit",
    type: "plan_habit",
    headline: "One habit to anchor your day",
    body: `Try completing "${habit}" — small actions compound into big consistency.`,
    cta: { label: "View plan", href: "/dashboard/progress" },
    priority: 1,
  };
}

function ruleNeutralReflection(snapshot: HealthSnapshot): Recommendation | null {
  const score = snapshot.latestMoodEntry?.score ?? null;
  if (score === null || score !== 3) return null;
  if (snapshot.journalCountToday > 0) return null;

  return {
    id: "neutral-reflection",
    type: "journal_prompt",
    headline: "Reflect on the balance",
    body: pickJournalPromptByScore(3),
    cta: { label: "Write a reflection", href: "/dashboard/journal" },
    priority: 2,
  };
}

function ruleHighMoodChallengeStory(snapshot: HealthSnapshot): Recommendation | null {
  const score = snapshot.latestMoodEntry?.score ?? null;
  if (score === null || score < 4) return null;

  const story = pickStory(snapshot.stories, score);
  if (!story) return null;

  return {
    id: "high-mood-story",
    type: "story",
    headline: "Momentum deserves a challenge",
    body: `"${story.title}" — ${story.summary}`,
    cta: { label: "Read it", href: "/dashboard/stories" },
    priority: 3,
  };
}

function ruleCelebrate(snapshot: HealthSnapshot): Recommendation | null {
  const score = snapshot.latestMoodEntry?.score ?? null;
  if (score === null || score < 4) return null;
  if (snapshot.currentStreak < 3) return null;

  return {
    id: "celebrate-streak",
    type: "celebrate",
    headline: `${snapshot.currentStreak}-day streak — you are building something real`,
    body: "Consistency at this level is rare. Whatever you are doing, keep the habit alive.",
    priority: 1,
  };
}

function ruleStreakNudge(snapshot: HealthSnapshot): Recommendation | null {
  if (snapshot.latestMoodEntry !== null) return null;
  if (snapshot.currentStreak < 2) return null;

  return {
    id: "streak-nudge",
    type: "streak_nudge",
    headline: `Don't break your ${snapshot.currentStreak}-day streak`,
    body: "Log today's mood to keep your momentum. It only takes 10 seconds.",
    cta: { label: "Log mood", href: "/dashboard" },
    priority: 1,
  };
}

function rulePatternInsight(snapshot: HealthSnapshot): Recommendation | null {
  const pattern = snapshot.moodPattern;
  if (!pattern) return null;

  // Only surface decline and volatile patterns as top-of-feed recommendations;
  // positive patterns are better shown in the dedicated intelligence panel.
  if (pattern.kind !== "sustained_decline" && pattern.kind !== "volatile") return null;

  return {
    id: `pattern-${pattern.kind}`,
    type: "pattern_insight",
    headline: pattern.headline,
    body: pattern.insight,
    cta:
      pattern.kind === "sustained_decline"
        ? { label: "Write about it", href: "/dashboard/journal" }
        : { label: "View trend", href: "/dashboard" },
    priority: 0, // always render first when present
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const RULES = [
  rulePatternInsight,
  ruleCelebrate,
  ruleLowMoodStory,
  ruleLowMoodJournalPrompt,
  ruleNeutralPlanHabit,
  ruleNeutralReflection,
  ruleHighMoodChallengeStory,
  ruleStreakNudge,
];

export function computeRecommendations(snapshot: HealthSnapshot): Recommendation[] {
  return RULES.flatMap((rule) => {
    const result = rule(snapshot);
    return result ? [result] : [];
  }).sort((a, b) => a.priority - b.priority);
}

export function computeTopRecommendation(snapshot: HealthSnapshot): Recommendation | null {
  const results = computeRecommendations(snapshot);
  return results[0] ?? null;
}
