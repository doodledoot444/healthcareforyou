import type { Plan, PlanItem } from "@/features/plans/types";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ArticleDto {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  readingTimeMinutes: number;
}

export interface StoryDto {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  readingTimeMinutes: number;
}

export interface PlanSeedItem {
  id: string;
  label: string;
}

export interface PlanSeed {
  id: string;
  title: string;
  category: Plan["category"];
  description: string;
  items: PlanSeedItem[];
}

export interface PlansPayload {
  plans: Plan[];
  activePlan: Plan | null;
}

export interface PlanItemPatchRequest {
  itemId: string;
  completed?: boolean;
}

export interface PlanItemPatchPayload {
  planId: string;
  item: PlanItem;
}

export interface JournalEntryDto {
  id: string;
  content: string;
  createdAt: string;
}

export interface JournalPayload {
  entries: JournalEntryDto[];
}

export interface JournalCreateRequest {
  content: string;
}

export interface JournalCreatePayload {
  entry: JournalEntryDto;
}

export interface JournalDeletePayload {
  id: string;
}

export type JournalPromptTone = "supportive" | "balanced" | "energizing";

export interface JournalPromptPayload {
  prompt: string;
  suggestions: string[];
  reason: string;
  tone: JournalPromptTone;
}

export interface EvaluatedAchievementDto {
  id: string;
  title: string;
  description: string;
  threshold: number;
  unlocked: boolean;
}

export interface AchievementsPayload {
  achievements: EvaluatedAchievementDto[];
  metrics: {
    completedPlanItems: number;
    journalEntries: number;
    sessionParticipations: number;
  };
}

export interface ArticleOfDayPayload {
  article: ArticleDto;
  rotatesInMs: number;
  nextRotationAt: string;
}

export interface ArticlesPayload {
  articles: ArticleDto[];
}

export interface StoriesPayload {
  stories: StoryDto[];
}

export type { HabitMilestoneBadge, HabitMilestone, HabitStreakResult } from "@/lib/habit-streak";

export interface HabitStreakPayload {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  milestones: Array<{
    badge: string;
    label: string;
    description: string;
    threshold: number;
    unlocked: boolean;
  }>;
  nextMilestoneAt: number | null;
}

export type DailyNudgeTiming = "morning" | "afternoon" | "evening" | "night";

export interface DailyNudgePayload {
  timing: DailyNudgeTiming;
  headline: string;
  body: string;
  /** Accent colour token: emerald | amber | sky | slate */
  accent: "emerald" | "amber" | "sky" | "slate";
}

// ---------------------------------------------------------------------------
// Habit Insights (Option 3)
// ---------------------------------------------------------------------------

export interface HabitInsightDto {
  habitId: string;
  habitLabel: string;
  category: string;
  avgMoodOnCompletionDays: number | null;
  avgMoodOnNonCompletionDays: number | null;
  moodLift: number | null;
  completionDays: number;
  strength: "strong" | "moderate" | "weak" | "insufficient_data";
}

export interface CategoryInsightDto {
  category: string;
  avgMoodOnCompletionDays: number | null;
  avgMoodOnNonCompletionDays: number | null;
  moodLift: number | null;
  completionDays: number;
  strength: "strong" | "moderate" | "weak" | "insufficient_data";
}

export interface HabitInsightsPayload {
  topHabits: HabitInsightDto[];
  categoryInsights: CategoryInsightDto[];
  analysisFromDate: string | null;
  moodEntriesAnalysed: number;
  activeDays: number;
}

// ---------------------------------------------------------------------------
// Weekly Wellness Report (Option 4)
// ---------------------------------------------------------------------------

export interface WeeklyReportPayload {
  weekLabel: string;
  mood: {
    avgScore: number | null;
    prevWeekAvgScore: number | null;
    trend: "improving" | "declining" | "stable" | "insufficient_data";
    bestDay: { dateKey: string; score: number; note?: string | null } | null;
    worstDay: { dateKey: string; score: number } | null;
    daysLogged: number;
  };
  habits: {
    completedDays: number;
    topCategory: string | null;
    activeCategories: string[];
    completionConsistency: "great" | "good" | "needs_work" | "no_data";
  };
  journal: {
    entryCount: number;
    estimatedAvgWords: number;
    engagement: "deep" | "moderate" | "light" | "none";
  };
  streaks: {
    moodStreak: number;
    habitStreak: number;
    combined: "excellent" | "good" | "building" | "at_risk";
  };
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Wellness Goals (Phase 12)
// ---------------------------------------------------------------------------

export type { WellnessGoalType, WellnessGoalPeriod, GoalStatus, EvaluatedGoal } from "@/lib/wellness-goals";

export interface WellnessGoalDto {
  id: string;
  goalType: string;
  target: number;
  period: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface EvaluatedGoalDto {
  id: string;
  goalType: string;
  label: string;
  target: number;
  current: number | null;
  period: string;
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "achieved";
  progressLabel: string;
  unit: string;
}

export interface GoalsPayload {
  goals: WellnessGoalDto[];
  evaluated: EvaluatedGoalDto[];
}

export interface GoalCreateRequest {
  goalType: string;
  target: number;
  period: string;
  label?: string;
}

export interface GoalUpdateRequest {
  target?: number;
  label?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Habit Recommendations (Phase 13 Option C)
// ---------------------------------------------------------------------------

export type RecommendationReason =
  | "strong_mood_lift"
  | "moderate_mood_lift"
  | "not_tried_recently"
  | "goal_alignment"
  | "category_gap";

export interface HabitRecommendation {
  habitId: string;
  habitLabel: string;
  category: string;
  planId: string;
  planTitle: string;
  /** Primary reason this habit is recommended. */
  reason: RecommendationReason;
  /** Human-readable rationale string for the UI. */
  rationale: string;
  /** Mood lift estimate from historical data (null = no data). */
  moodLiftEstimate: number | null;
  /** Composite score driving the ranking (not shown in UI). */
  score: number;
}

export interface HabitRecommendationsPayload {
  recommendations: HabitRecommendation[];
  /** ISO date for cache validation. */
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Analytics Overview (Phase 13 Option E)
// ---------------------------------------------------------------------------

export interface AnalyticsOverviewPayload {
  /** 30-day mood entries for sparkline, ordered asc. */
  moodTimeline: { dateKey: string; score: number }[];
  /** avg mood score (1-5) over last 30 days; null = no data. */
  avgMood30d: number | null;
  /** Days with ≥1 habit completion in last 30 days. */
  habitActiveDays30d: number;
  /** Habit completion count per category for last 30 days. */
  habitsByCategory: { category: string; count: number }[];
  /** Current habit streak. */
  currentHabitStreak: number;
  /** All-time habit streak. */
  longestHabitStreak: number;
  /** Journal entries logged in last 30 days. */
  journalCount30d: number;
  /** Total journal entries all-time. */
  journalCountAllTime: number;
  /** Total habit completions all-time. */
  habitCompletionsAllTime: number;
}

export interface ExportMoodRecord {
  id: string;
  score: number;
  note: string | null;
  entryDate: string;
  createdAt: string;
}

export interface ExportJournalRecord {
  id: string;
  content: string;
  moodScore: number | null;
  createdAt: string;
}

export interface ExportCompletionRecord {
  id: string;
  itemId: string;
  itemLabel: string;
  planId: string;
  planTitle: string;
  category: string;
  completedAt: string;
}

export interface ExportGoalRecord {
  id: string;
  goalType: string;
  target: number;
  period: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDataExportPayload {
  generatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  summary: {
    moodEntries: number;
    journalEntries: number;
    habitCompletions: number;
    goals: number;
  };
  data: {
    moods: ExportMoodRecord[];
    journalEntries: ExportJournalRecord[];
    planCompletions: ExportCompletionRecord[];
    goals: ExportGoalRecord[];
  };
}

