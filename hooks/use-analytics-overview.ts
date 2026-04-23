"use client";

import { useQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type { AnalyticsOverviewPayload } from "@/lib/api/contracts";

async function fetchAnalyticsOverview(): Promise<AnalyticsOverviewPayload> {
  return requestApi<AnalyticsOverviewPayload>("/api/analytics/overview");
}

export interface UseAnalyticsOverviewResult {
  data: AnalyticsOverviewPayload | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useAnalyticsOverview(): UseAnalyticsOverviewResult {
  const query = useQuery<AnalyticsOverviewPayload, Error>({
    queryKey: ["analytics-overview"],
    queryFn: fetchAnalyticsOverview,
    staleTime: 10 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
