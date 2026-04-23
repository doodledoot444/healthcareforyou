"use client";

import { DashboardSectionShell } from "@/components/shared/section-shell";
import { StoriesReadingBoard } from "@/components/stories/stories-reading-board";
import { useStories } from "@/hooks/use-stories";

export default function DashboardStoriesPage() {
  const storiesQuery = useStories();

  return (
    <DashboardSectionShell
      title="Stories"
      description="Read in a chapter-style flow and build a sustainable reflection habit."
    >
      <StoriesReadingBoard
        stories={storiesQuery.data?.stories ?? []}
        isLoading={storiesQuery.isLoading}
      />
    </DashboardSectionShell>
  );
}
