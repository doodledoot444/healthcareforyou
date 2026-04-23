import type { MoodPattern } from "@/lib/mood-patterns";

export type PromptTone = "supportive" | "balanced" | "energizing";

export interface SmartJournalPromptInput {
  userId: string;
  latestMoodScore: number | null;
  moodPattern: MoodPattern | null;
  currentStreak: number;
  journalCountToday: number;
  now?: Date;
}

export interface SmartJournalPromptResult {
  prompt: string;
  suggestions: string[];
  reason: string;
  tone: PromptTone;
}

const LOW_MOOD_PROMPTS = [
  "What's one thing that felt heavy today, and what would lighten it?",
  "Describe what 'okay' would look like for you right now.",
  "Write about one small act of kindness you could do for yourself today.",
  "If you could ask for support in one sentence, what would it be?",
];

const NEUTRAL_MOOD_PROMPTS = [
  "What's one thing you're quietly grateful for today?",
  "Describe a moment from today you want to remember.",
  "What habit, if maintained for 30 days, would change things?",
  "What felt steady today, and what felt uncertain?",
];

const HIGH_MOOD_PROMPTS = [
  "What's driving your momentum right now, and how can you protect it?",
  "Describe one ambitious goal that felt real today.",
  "Who helped your energy today? How could you pay it forward?",
  "What should you lock in while motivation is high?",
];

const PATTERN_PROMPT_OVERRIDES: Partial<Record<NonNullable<MoodPattern>["kind"], string[]>> = {
  sustained_decline: [
    "Your mood has been trending down. What changed 3-5 days ago that may have started this shift?",
    "What is one stabilizing action you can take before tonight ends?",
  ],
  volatile: [
    "Your mood has been swinging a lot. Which triggers showed up on your best vs hardest days?",
    "What one daily routine could make your next week more predictable?",
  ],
  rebound: [
    "You bounced back recently. What exactly helped you recover, and how can you repeat it?",
  ],
  day_of_week_low: [
    "That recurring hard day is coming. What support can you schedule before it arrives?",
  ],
  consistent_neutral: [
    "You've been in a neutral zone. What tiny novelty could shift tomorrow's energy by 1%?",
  ],
  sustained_high: [
    "You are in a strong stretch. Which routines deserve to become non-negotiable?",
  ],
};

function fnv1aHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function stableIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  return fnv1aHash(seed) % length;
}

function scoreBand(score: number | null): "low" | "neutral" | "high" {
  if (score === null || score <= 2) return "low";
  if (score === 3) return "neutral";
  return "high";
}

function promptPoolByScore(score: number | null): string[] {
  const band = scoreBand(score);
  if (band === "low") return LOW_MOOD_PROMPTS;
  if (band === "neutral") return NEUTRAL_MOOD_PROMPTS;
  return HIGH_MOOD_PROMPTS;
}

function toneByScore(score: number | null): PromptTone {
  const band = scoreBand(score);
  if (band === "low") return "supportive";
  if (band === "neutral") return "balanced";
  return "energizing";
}

function reasonByInput(input: SmartJournalPromptInput): string {
  if (input.moodPattern?.kind === "sustained_decline") {
    return "Prompt adapted to your recent declining mood trend.";
  }
  if (input.moodPattern?.kind === "volatile") {
    return "Prompt adapted to recent mood variability.";
  }
  if (input.currentStreak >= 7) {
    return "Prompt tuned to help sustain your current streak momentum.";
  }
  if (input.journalCountToday > 0) {
    return "Prompt tuned as a follow-up reflection for today.";
  }

  const band = scoreBand(input.latestMoodScore);
  if (band === "low") return "Prompt tuned for a low-energy day.";
  if (band === "neutral") return "Prompt tuned for a steady day.";
  return "Prompt tuned for a high-momentum day.";
}

/**
 * Backward-compatible simple picker used by recommendation engine.
 */
export function pickJournalPromptByScore(score: number): string {
  const pool = promptPoolByScore(score);
  const index = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % pool.length;
  return pool[index] ?? pool[0] ?? "";
}

/**
 * Returns a stable smart prompt + alternatives for a user for the current hour.
 */
export function computeSmartJournalPrompt(input: SmartJournalPromptInput): SmartJournalPromptResult {
  const now = input.now ?? new Date();
  const hourBucket = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}`;

  const basePool = promptPoolByScore(input.latestMoodScore);
  const patternPool = input.moodPattern ? (PATTERN_PROMPT_OVERRIDES[input.moodPattern.kind] ?? []) : [];
  const combined = [...patternPool, ...basePool];

  const primaryIdx = stableIndex(`${input.userId}:${hourBucket}:primary`, combined.length);
  const prompt = combined[primaryIdx] ?? basePool[0] ?? "How are you feeling right now?";

  const alternatives = combined.filter((item, idx) => idx !== primaryIdx);
  const suggestions = alternatives.slice(0, 4);

  return {
    prompt,
    suggestions,
    reason: reasonByInput(input),
    tone: toneByScore(input.latestMoodScore),
  };
}
