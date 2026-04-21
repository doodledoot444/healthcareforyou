"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/client";
import type {
  JournalCreatePayload,
  JournalDeletePayload,
  JournalPayload,
} from "@/lib/api/contracts";

async function fetchJournalEntries(): Promise<JournalPayload> {
  return requestApi<JournalPayload>("/api/journal");
}

async function createJournalEntry(content: string): Promise<JournalCreatePayload> {
  return requestApi<JournalCreatePayload>("/api/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

async function deleteJournalEntry(id: string): Promise<JournalDeletePayload> {
  return requestApi<JournalDeletePayload>(`/api/journal/${id}`, { method: "DELETE" });
}

/**
 * Full CRUD for journal entries via TanStack Query.
 * - `entries`: current list (newest first)
 * - `recentEntries`: first 3 for preview use
 * - `addEntry` / `removeEntry`: mutations with cache invalidation
 */
export function useJournal() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["journal"],
    queryFn: fetchJournalEntries,
  });

  const addMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: ({ entry }) => {
      // Prepend the new entry immediately for instant UI update.
      queryClient.setQueryData<JournalPayload>(["journal"], (old) => ({
        entries: [entry, ...(old?.entries ?? [])],
      }));
      void queryClient.invalidateQueries({ queryKey: ["journal"] });
      void queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["journal"] });
      const previous = queryClient.getQueryData<JournalPayload>(["journal"]);

      queryClient.setQueryData<JournalPayload>(["journal"], (old) => ({
        entries: (old?.entries ?? []).filter((e) => e.id !== id),
      }));

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["journal"], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["journal"] });
      void queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const entries = data?.entries ?? [];

  return {
    entries,
    recentEntries: entries.slice(0, 3),
    isLoading,
    error: error as Error | null,
    addEntry: (content: string) => addMutation.mutate(content),
    removeEntry: (id: string) => removeMutation.mutate(id),
    isAdding: addMutation.isPending,
  };
}
