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
