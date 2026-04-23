"use client";

/**
 * DashboardDataProvider
 *
 * Single shared context for all dashboard data. Prevents multiple components
 * from each independently fetching the same endpoints (notably useMood which
 * uses plain useState/useEffect and does not deduplicate via TanStack Query).
 *
 * Components inside the dashboard tree should consume data via
 * useDashboardData() rather than calling useMood/useJournal/usePlans directly.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMood } from "@/hooks/use-mood";
import { useJournal } from "@/hooks/use-journal";
import { usePlans } from "@/hooks/use-plans";
import { useStories } from "@/hooks/use-stories";
import { computeMoodPattern } from "@/lib/mood-patterns";
import { computeHabitCorrelation } from "@/lib/habit-correlation";
import type { MoodEntry, MoodStreakSnapshot, CreateMoodEntryResult } from "@/features/mood/types";
import type { JournalEntryDto } from "@/lib/api/contracts";
import type { Plan } from "@/features/plans/types";
import type { StoryDto } from "@/lib/api/contracts";
import type { MoodPattern } from "@/lib/mood-patterns";
import type { HabitCorrelationResult } from "@/lib/habit-correlation";

export interface DashboardDataContextValue {
  // Mood
  moodEntries: MoodEntry[];
  latestMoodEntry: MoodEntry | null;
  moodStreak: MoodStreakSnapshot;
  isMoodLoading: boolean;
  moodError: string | null;
  isMoodSubmitting: boolean;
  submitMood: (score: number, note?: string) => Promise<CreateMoodEntryResult>;

  // Journal
  journalEntries: JournalEntryDto[];
  isJournalLoading: boolean;
  isJournalAdding: boolean;
  addJournalEntry: (content: string) => void;
  removeJournalEntry: (id: string) => void;

  // Plans
  plans: Plan[];
  activePlan: Plan | null;
  isPlansLoading: boolean;
  togglePlanItem: (params: { planId: string; itemId: string }) => void;

  // Stories (used by recommendation engine)
  stories: StoryDto[];
  isStoriesLoading: boolean;

  // Mood Trend Intelligence
  moodPattern: MoodPattern | null;

  // Habit Correlation Engine
  habitCorrelation: HabitCorrelationResult;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function useDashboardData(): DashboardDataContextValue {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used inside DashboardDataProvider.");
  }
  return ctx;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const mood = useMood();
  const journal = useJournal();
  const plans = usePlans();
  const storiesQuery = useStories();

  const moodPattern = useMemo(
    () => computeMoodPattern(mood.entries),
    [mood.entries],
  );

  const habitCorrelation = useMemo(
    () => computeHabitCorrelation(mood.entries, plans.plans, moodPattern),
    [mood.entries, plans.plans, moodPattern],
  );

  const value: DashboardDataContextValue = {
    // Mood
    moodEntries: mood.entries,
    latestMoodEntry: mood.latestEntry,
    moodStreak: mood.streak,
    isMoodLoading: mood.isLoading,
    moodError: mood.error,
    isMoodSubmitting: mood.isSubmitting,
    submitMood: mood.submitMood,

    // Journal
    journalEntries: journal.entries,
    isJournalLoading: journal.isLoading,
    isJournalAdding: journal.isAdding,
    addJournalEntry: journal.addEntry,
    removeJournalEntry: journal.removeEntry,

    // Plans
    plans: plans.plans,
    activePlan: plans.activePlan,
    isPlansLoading: plans.isLoading,
    togglePlanItem: plans.toggleItem,

    // Stories
    stories: storiesQuery.data?.stories ?? [],
    isStoriesLoading: storiesQuery.isLoading,

    // Mood Trend Intelligence
    moodPattern,

    // Habit Correlation Engine
    habitCorrelation,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}
