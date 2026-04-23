"use client";

import { MoodCard } from "@/components/mood/mood-card";
import { MoodChart } from "@/components/mood/mood-chart";
import { MoodSelector } from "@/components/mood/mood-selector";
import { PreviewCard } from "@/components/shared/preview-card";
import { useDashboardData } from "@/providers/dashboard-data-provider";

export function MoodOverview() {
  const {
    moodEntries,
    latestMoodEntry,
    moodStreak,
    isMoodLoading,
    moodError,
    isMoodSubmitting,
    submitMood,
  } = useDashboardData();

  return (
    <PreviewCard
      title="Mood"
      description="Track your latest check-in and recent mood trend."
      actionHref="/dashboard"
      actionLabel="Refresh"
    >
      <div className="mt-4 space-y-4">
        <MoodSelector
          latestEntry={latestMoodEntry}
          streak={moodStreak}
          isSubmitting={isMoodSubmitting}
          error={moodError}
          onSubmitMood={submitMood}
        />
        {latestMoodEntry ? <MoodCard entry={latestMoodEntry} /> : null}
        <MoodChart entries={moodEntries} isLoading={isMoodLoading} />
      </div>
    </PreviewCard>
  );
}