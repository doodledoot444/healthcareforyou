"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GoalsPayload, GoalCreateRequest, GoalUpdateRequest } from "@/lib/api/contracts";

const QUERY_KEY = ["wellness-goals"] as const;

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchGoals(): Promise<GoalsPayload> {
  const res = await fetch("/api/goals");
  if (!res.ok) throw new Error("Failed to load goals");
  const json = await res.json();
  return json.data as GoalsPayload;
}

async function createGoal(body: GoalCreateRequest): Promise<void> {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? "Failed to create goal");
  }
}

async function updateGoal(id: string, body: GoalUpdateRequest): Promise<void> {
  const res = await fetch(`/api/goals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update goal");
}

async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete goal");
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseWellnessGoalsReturn {
  data: GoalsPayload | undefined;
  isLoading: boolean;
  error: Error | null;
  addGoal: (body: GoalCreateRequest) => Promise<void>;
  editGoal: (id: string, body: GoalUpdateRequest) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  refresh: () => void;
}

export function useWellnessGoals(): UseWellnessGoalsReturn {
  const queryClient = useQueryClient();

  const query = useQuery<GoalsPayload, Error>({
    queryKey: QUERY_KEY,
    queryFn: fetchGoals,
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const addMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: invalidate,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: GoalUpdateRequest }) => updateGoal(id, body),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: invalidate,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    addGoal: (body) => addMutation.mutateAsync(body),
    editGoal: (id, body) => editMutation.mutateAsync({ id, body }),
    removeGoal: (id) => removeMutation.mutateAsync(id),
    refresh: invalidate,
  };
}
