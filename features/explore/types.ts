export interface ExploreItem {
  id: string;
  title: string;
  summary: string;
  type: "Article" | "Story" | "Session";
}

export interface ExploreSnapshot {
  articleOfTheDay: ExploreItem;
  stories: ExploreItem[];
  session: ExploreItem;
}
