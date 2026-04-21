"use client";

import Link from "next/link";
import { useArticleOfDay } from "@/hooks/use-article-of-day";
import { useStories } from "@/hooks/use-stories";
import { PreviewCard } from "@/components/shared/preview-card";

export function ExplorePreview() {
  const articleQuery = useArticleOfDay();
  const storiesQuery = useStories();

  const article = articleQuery.data?.article;
  const firstStory = storiesQuery.data?.stories[0];

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
          {articleQuery.isLoading ? (
            <p className="mt-1 text-sm text-slate-500">Loading…</p>
          ) : (
            <>
              <p className="mt-1 text-sm font-medium text-slate-900">{article?.title ?? "—"}</p>
              <p className="mt-1 text-sm text-slate-600">{article?.summary ?? ""}</p>
            </>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories</p>
          <p className="mt-1 text-sm text-slate-600">
            {storiesQuery.isLoading
              ? "Loading stories…"
              : firstStory
                ? `${storiesQuery.data?.stories.length ?? 0} stories available today.`
                : "No stories yet."}
          </p>
          <Link
            href="/dashboard/stories"
            className="mt-3 inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            Open Stories Feed
          </Link>
        </article>
      </div>
    </PreviewCard>
  );
}

