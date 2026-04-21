"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlansSnapshot } from "@/features/plans/types";
import { requestApi } from "@/lib/api/client";
import type { PlanItemPatchPayload, PlansPayload } from "@/lib/api/contracts";

async function fetchPlans(): Promise<PlansPayload> {
  return requestApi<PlansPayload>("/api/plans");
}

interface ToggleItemParams {
  planId: string;
  itemId: string;
}

async function togglePlanItem({ planId, itemId }: ToggleItemParams): Promise<PlanItemPatchPayload> {
  return requestApi<PlanItemPatchPayload>(`/api/plans/${planId}/item`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
}

/**
 * Queries and mutates plan data.
 * - `plans` / `activePlan`: current state with item completions
 * - `toggleItem`: mutation that optimistically updates the item and invalidates the cache
 */
export function usePlans(): PlansSnapshot & {
  isLoading: boolean;
  error: Error | null;
  toggleItem: (params: ToggleItemParams) => void;
} {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  const mutation = useMutation({
    mutationFn: togglePlanItem,
    // Optimistic update: flip the item immediately before server confirms.
    onMutate: async ({ planId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ["plans"] });
      const previous = queryClient.getQueryData<PlansPayload>(["plans"]);

      queryClient.setQueryData<PlansPayload>(["plans"], (old) => {
        if (!old) return old;

        const plans = old.plans.map((plan) => {
          if (plan.id !== planId) return plan;

          const items = plan.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          );

          const completedCount = items.filter((i) => i.completed).length;
          const progressPercentage =
            items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

          return { ...plan, items, progressPercentage };
        });

        const activePlan = plans.find((p) => p.progressPercentage < 100) ?? plans[0] ?? null;
        return { plans, activePlan };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure.
      if (context?.previous) {
        queryClient.setQueryData(["plans"], context.previous);
      }
    },
    onSettled: () => {
      // Sync with server after mutation completes.
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      void queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  return {
    plans: data?.plans ?? [],
    activePlan: data?.activePlan ?? null,
    isLoading,
    error: error as Error | null,
    toggleItem: (params) => mutation.mutate(params),
  };
}
