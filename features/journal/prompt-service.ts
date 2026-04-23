import type { MoodEntry } from "@/features/mood/types";
import type { MoodPattern } from "@/lib/mood-patterns";

export type JournalPromptTone = "supportive" | "reflective" | "growth";

export interface SmartJournalPrompt {
  id: string;
  headline: string;
  prompt: string;
  tone: JournalPromptTone;
  reason: string;
}

export interface SmartJournalPromptInput {
  latestMoodEntry: MoodEntry | null;
  moodPattern: MoodPattern | null;
  currentStreak: number;
  journalCountToday: number;
}

const FOLLOW_UP_PROMPTS = [
  "What changed since your first reflection today, and what does that tell you?",
  "If you were to add one sentence to today's earlier entry, what would it be?",
  "What did you learn between your last check-in and now?",
];

const LOW_SUPPORT_PROMPTS = [
  "Name one thing that felt heavy today, and one thing that made it 1% lighter.",
  "If your closest friend felt exactly like you do now, what would you tell them?",
  "What is one safe, small action you can take in the next hour to care for yourself?",
];

const NEUTRAL_REFLECTION_PROMPTS = [
  "What moment today felt quietly meaningful, even if it was small?",
  "What routine helped you stay steady today, and how can you repeat it tomorrow?",
  "What is one choice today that your future self will thank you for?",
];

const HIGH_GROWTH_PROMPTS = [
  "What is fueling your current momentum, and how can you protect it this week?",
  "What bold next step feels possible because of today's energy?",
  "Who benefited from your energy today, and how could you amplify that tomorrow?",
];

function dailyIndex(length: number): number {
  if (length <= 1) return 0;
  const day = Math.floor(Date.now() / 86_400_000);
  return day % length;
}

function pickByDay(pool: string[]): string {
  return pool[dailyIndex(pool.length)] ?? pool[0] ?? "";
}

function buildLowMoodReason(pattern: MoodPattern | null): string {
  if (!pattern) {
    return "Recent check-ins suggest a low-energy moment. This prompt focuses on self-kindness and tiny wins.";
  }

  if (pattern.kind === "sustained_decline" || pattern.kind === "volatile") {
    return `Detected pattern: ${pattern.headline}. This prompt helps stabilize your day with a concrete next step.`;
  }

  return `Detected pattern: ${pattern.headline}. This prompt is tuned for emotional recovery and support.`;
}

function buildNeutralReason(pattern: MoodPattern | null): string {
  if (!pattern) {
    return "Mood is currently stable. This prompt aims to surface useful insight from an ordinary day.";
  }

  if (pattern.kind === "consistent_neutral" || pattern.kind === "day_of_week_low") {
    return `Detected pattern: ${pattern.headline}. This prompt helps break autopilot with intentional reflection.`;
  }

  return `Detected pattern: ${pattern.headline}. This prompt helps you capture what is working right now.`;
}

function buildHighReason(streak: number, pattern: MoodPattern | null): string {
  if (pattern) {
    return `Detected pattern: ${pattern.headline}. This prompt channels strong energy into sustainable momentum.`;
  }

  if (streak >= 3) {
    return `${streak}-day streak detected. This prompt helps lock in your momentum and extend consistency.`;
  }

  return "Recent mood is positive. This prompt nudges growth while energy is high.";
}

export function computeSmartJournalPrompt(input: SmartJournalPromptInput): SmartJournalPrompt {
  const { latestMoodEntry, moodPattern, currentStreak, journalCountToday } = input;

  if (journalCountToday > 0) {
    return {
      id: "follow-up-reflection",
      headline: "Follow-up reflection",
      prompt: pickByDay(FOLLOW_UP_PROMPTS),
      tone: "reflective",
      reason: "You already wrote today. A short follow-up builds depth without pressure.",
    };
  }

  if (!latestMoodEntry) {
    return {
      id: "baseline-check-in",
      headline: "Start with a quick check-in",
      prompt: "What are you feeling right now, where do you feel it in your body, and what might that feeling need?",
      tone: "reflective",
      reason: "No mood check-in found today. This prompt establishes a baseline for the day.",
    };
  }

  if (latestMoodEntry.score <= 2) {
    return {
      id: "low-mood-support",
      headline: "Gentle support prompt",
      prompt: pickByDay(LOW_SUPPORT_PROMPTS),
      tone: "supportive",
      reason: buildLowMoodReason(moodPattern),
    };
  }

  if (latestMoodEntry.score === 3) {
    return {
      id: "neutral-reflection",
      headline: "Clarity prompt",
      prompt: pickByDay(NEUTRAL_REFLECTION_PROMPTS),
      tone: "reflective",
      reason: buildNeutralReason(moodPattern),
    };
  }

  return {
    id: "high-mood-growth",
    headline: "Momentum prompt",
    prompt: pickByDay(HIGH_GROWTH_PROMPTS),
    tone: "growth",
    reason: buildHighReason(currentStreak, moodPattern),
  };
}
