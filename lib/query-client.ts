import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a QueryClient with sensible defaults for dashboard data:
 * - staleTime: 60s for most data (prevents redundant refetches on tab focus)
 * - retry: 1 (fail fast for auth-gated routes)
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}
