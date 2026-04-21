"use client";

import { useQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { AchievementsPayload } from "@/lib/api/contracts";

async function fetchAchievements(): Promise<AchievementsPayload> {
  return requestApi<AchievementsPayload>("/api/achievements");
}

/**
 * Returns achievements derived from plan completions and journal activity.
 * Automatically refetches when plans or journal are mutated (they invalidate this key).
 */
export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });
}
