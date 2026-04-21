"use client";

import { useQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { StoriesPayload } from "@/lib/api/contracts";

async function fetchStories(): Promise<StoriesPayload> {
  return requestApi<StoriesPayload>("/api/stories");
}

/**
 * Returns all stories. Stories are static content; staleTime is long to avoid refetches.
 */
export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: fetchStories,
    staleTime: 5 * 60 * 1000,
  });
}
