"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { HabitRecommendationsPayload } from "@/lib/api/contracts";

const QUERY_KEY = ["habit-recommendations"] as const;

async function fetchRecommendations(): Promise<HabitRecommendationsPayload> {
  return requestApi<HabitRecommendationsPayload>("/api/recommendations/habits");
}

export interface UseHabitRecommendationsResult {
  data: HabitRecommendationsPayload | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useHabitRecommendations(): UseHabitRecommendationsResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<HabitRecommendationsPayload, Error>({
    queryKey: QUERY_KEY,
    queryFn: fetchRecommendations,
    staleTime: 15 * 60 * 1000,
  });

  return {
    data,
    isLoading,
    error,
    refresh: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  };
}
