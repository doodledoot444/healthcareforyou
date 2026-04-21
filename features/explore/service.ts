import type { ExploreSnapshot } from "./types";

const exploreSnapshot: ExploreSnapshot = {
  articleOfTheDay: {
    id: "article-breathing-basics",
    title: "Breathing Basics for Calm Days",
    summary: "A short read on using breathwork to reset mood and focus.",
    type: "Article",
  },
  stories: [
    {
      id: "story-small-wins",
      title: "Small Wins Matter",
      summary: "How tiny daily wins can compound into big emotional progress.",
      type: "Story",
    },
    {
      id: "story-slow-growth",
      title: "Slow Growth Is Still Growth",
      summary: "A reminder that consistency beats intensity over time.",
      type: "Story",
    },
  ],
  session: {
    id: "session-evening-reset",
    title: "Evening Reset (10 min)",
    summary: "A guided wind-down session to close your day with clarity.",
    type: "Session",
  },
};

export function getExploreSnapshot(): ExploreSnapshot {
  return exploreSnapshot;
}
