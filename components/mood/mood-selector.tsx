"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMood } from "@/hooks/use-mood";
import { MOOD_OPTIONS } from "@/lib/constants";
import { moodToLabel, scoreToMood } from "@/features/mood/utils";

export function MoodSelector() {
  const router = useRouter();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { latestEntry, streak, isSubmitting, error, submitMood } = useMood();

  async function handleSubmit() {
    if (selectedScore === null) return;

    const result = await submitMood(selectedScore);
    setSuccessMessage(
      result.wasUpdated
        ? "Updated today's mood entry successfully."
        : "Logged today's mood entry successfully.",
    );
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-zinc-700">How are you feeling today?</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isSubmitting}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              selectedScore === option.value
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
            onClick={() => setSelectedScore(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={selectedScore === null || isSubmitting}
        onClick={handleSubmit}
        className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save Today\'s Mood"}
      </button>
      <p className="mt-4 text-sm text-zinc-600">
        {selectedScore !== null
          ? `Selected mood: ${scoreToMood(selectedScore)}`
          : "Choose a mood to submit your daily check-in."}
      </p>
      {successMessage ? <p className="mt-2 text-sm text-emerald-700">{successMessage}</p> : null}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      {latestEntry ? (
        <p className="mt-2 text-sm text-zinc-700">
          Latest: {moodToLabel(latestEntry.mood)} (score {latestEntry.score})
        </p>
      ) : null}
      <p className="mt-1 text-xs text-zinc-500">
        Current streak {streak.currentStreak} days, longest {streak.longestStreak} days.
      </p>
    </div>
  );
}
