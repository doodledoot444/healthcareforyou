"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMood } from "@/hooks/use-mood";
import { MOOD_OPTIONS } from "@/lib/constants";
import { moodToLabel, scoreToMood } from "@/features/mood/utils";
import type { CreateMoodEntryResult, MoodEntry, MoodStreakSnapshot } from "@/features/mood/types";

interface MoodSelectorProps {
  latestEntry?: MoodEntry | null;
  streak?: MoodStreakSnapshot;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmitMood?: (score: number, note?: string) => Promise<CreateMoodEntryResult>;
}

export function MoodSelector(props: MoodSelectorProps = {}) {
  const router = useRouter();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mood = useMood();
  const latestEntry = props.latestEntry ?? mood.latestEntry;
  const streak = props.streak ?? mood.streak;
  const isSubmitting = props.isSubmitting ?? mood.isSubmitting;
  const error = props.error ?? mood.error;
  const submitMood = props.onSubmitMood ?? mood.submitMood;

  async function handleSubmit() {
    if (selectedScore === null) return;

    try {
      const result = await submitMood(selectedScore);
      setSuccessMessage(
        result.wasUpdated
          ? "Updated today's mood entry successfully."
          : "Logged today's mood entry successfully."
      );
      router.refresh();
    } catch {
      setSuccessMessage(null);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-zinc-700">
          How are you feeling today?
        </p>
      </div>

      {/* Mood Options */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {MOOD_OPTIONS.map((option) => {
          const isActive = selectedScore === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isSubmitting}
              onClick={() => setSelectedScore(option.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition
                ${
                  isActive
                    ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                }
                ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={selectedScore === null || isSubmitting}
        onClick={handleSubmit}
        className="mt-5 w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save Today's Mood"}
      </button>

      {/* Feedback */}
      <div className="mt-4 space-y-2 text-sm">
        <p className="text-zinc-600">
          {selectedScore !== null
            ? `Selected mood: ${scoreToMood(selectedScore)}`
            : "Choose a mood to submit your daily check-in."}
        </p>

        {successMessage && (
          <p className="text-emerald-700">{successMessage}</p>
        )}

        {error && <p className="text-rose-700">{error}</p>}

        {latestEntry && (
          <p className="text-zinc-700">
            Latest: {moodToLabel(latestEntry.mood)} (score {latestEntry.score})
          </p>
        )}

        <p className="text-xs text-zinc-500">
          Current streak {streak.currentStreak} days, longest{" "}
          {streak.longestStreak} days.
        </p>
      </div>
    </div>
  );
}