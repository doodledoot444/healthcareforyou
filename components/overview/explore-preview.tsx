import type { ExploreSnapshot } from "@/features/explore/types";
import { PreviewCard } from "@/components/shared/preview-card";

interface ExplorePreviewProps {
  snapshot: ExploreSnapshot;
}

export function ExplorePreview({ snapshot }: ExplorePreviewProps) {
  return (
    <PreviewCard
      title="Explore"
      description="Discover your daily article, stories, and guided session."
      actionHref="/dashboard/explore"
      actionLabel="Open"
    >
      <div className="mt-4 space-y-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Article of the day</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{snapshot.articleOfTheDay.title}</p>
          <p className="mt-1 text-sm text-slate-600">{snapshot.articleOfTheDay.summary}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{snapshot.stories[0]?.title ?? "No stories yet"}</p>
          <p className="mt-1 text-sm text-slate-600">{snapshot.stories[0]?.summary ?? "Come back later for fresh stories."}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{snapshot.session.title}</p>
          <p className="mt-1 text-sm text-slate-600">{snapshot.session.summary}</p>
        </article>
      </div>
    </PreviewCard>
  );
}
