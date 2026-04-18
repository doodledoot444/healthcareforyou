"use client";

import { useEffect, useState } from "react";
import type { CreateMoodEntryResult, MoodEntry, MoodStreakSnapshot } from "@/features/mood/types";

interface MoodApiPayload {
  entries: MoodEntry[];
  latestEntry: MoodEntry | null;
  streak: MoodStreakSnapshot;
}

async function fetchMoodPayload(): Promise<MoodApiPayload> {
  const response = await fetch("/api/mood?days=60", { cache: "no-store" });
  const result = (await response.json()) as { data?: MoodApiPayload; error?: string };

  if (!response.ok || !result.data) {
    throw new Error(result.error ?? "Failed to load mood entries.");
  }

  return result.data;
}

export function useMood() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [latestEntry, setLatestEntry] = useState<MoodEntry | null>(null);
  const [streak, setStreak] = useState<MoodStreakSnapshot>({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const payload = await fetchMoodPayload();
      setEntries(payload.entries);
      setLatestEntry(payload.latestEntry);
      setStreak(payload.streak);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load moods.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitMood(score: number, note?: string): Promise<CreateMoodEntryResult> {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score, note }),
      });

      const result = (await response.json()) as { data?: CreateMoodEntryResult; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "Mood submission failed.");
      }

      setLatestEntry(result.data.entry);
      setStreak(result.data.streak);
      await refresh();

      return result.data;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Mood submission failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const payload = await fetchMoodPayload();

        if (!active) return;
        setEntries(payload.entries);
        setLatestEntry(payload.latestEntry);
        setStreak(payload.streak);
      } catch (requestError) {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Failed to load moods.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return {
    entries,
    latestEntry,
    streak,
    isLoading,
    isSubmitting,
    error,
    refresh,
    submitMood,
  };
}
