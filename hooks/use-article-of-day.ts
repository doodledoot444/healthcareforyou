"use client";

import { useQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { ArticleOfDayPayload } from "@/lib/api/contracts";

const REFRESH_MS = 20 * 60 * 1000;

async function fetchArticleOfDay(): Promise<ArticleOfDayPayload> {
  return requestApi<ArticleOfDayPayload>("/api/articles?type=day");
}

/**
 * Returns the article of the day.
 * Refetches automatically when the 20-minute rotation window changes.
 */
export function useArticleOfDay() {
  return useQuery({
    queryKey: ["articleOfDay"],
    queryFn: fetchArticleOfDay,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
  });
}
