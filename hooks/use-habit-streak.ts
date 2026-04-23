"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { HabitStreakPayload } from "@/lib/api/contracts";

const EMPTY_STREAK: HabitStreakPayload = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  milestones: [],
  nextMilestoneAt: 1,
};

async function fetchHabitStreak(): Promise<HabitStreakPayload> {
  return requestApi<HabitStreakPayload>("/api/streak/habits");
}

export interface UseHabitStreakResult {
  streak: HabitStreakPayload;
  isLoading: boolean;
  error: Error | null;
  /** Call after a habit is toggled to keep streak fresh. */
  refresh: () => Promise<void>;
}

export function useHabitStreak(): UseHabitStreakResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["habit-streak"],
    queryFn: fetchHabitStreak,
    // Refetch every 5 minutes in the background
    staleTime: 5 * 60 * 1000,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["habit-streak"] });
  };

  return {
    streak: data ?? EMPTY_STREAK,
    isLoading,
    error: error as Error | null,
    refresh,
  };
}
