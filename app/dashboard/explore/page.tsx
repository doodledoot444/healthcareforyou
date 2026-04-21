"use client";

import { useArticleOfDay } from "@/hooks/use-article-of-day";
import { useStories } from "@/hooks/use-stories";
import { DashboardSectionShell } from "@/components/shared/section-shell";

export default function DashboardExplorePage() {
  const articleQuery = useArticleOfDay();
  const storiesQuery = useStories();

  return (
    <DashboardSectionShell
      title="Explore"
      description="Daily discovery content to support your growth and reflection."
    >
      <div className="space-y-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Article of the Day</p>
          {articleQuery.isLoading ? (
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          ) : (
            <>
              <h3 className="mt-1 text-base font-semibold text-slate-900">{articleQuery.data?.article.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{articleQuery.data?.article.summary}</p>
              {articleQuery.data?.article.content ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{articleQuery.data.article.content}</p>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                {articleQuery.data?.article.readingTimeMinutes} min read ·{" "}
                {articleQuery.data?.article.category}
              </p>
            </>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories</p>
          {storiesQuery.isLoading ? (
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          ) : (
            <ul className="mt-2 space-y-4">
              {(storiesQuery.data?.stories ?? []).map((story) => (
                <li key={story.id}>
                  <p className="text-sm font-medium text-slate-900">{story.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{story.summary}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{story.content}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </DashboardSectionShell>
  );
}
