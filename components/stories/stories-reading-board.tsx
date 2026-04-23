"use client";

import { useMemo, useState } from "react";
import type { StoryDto } from "@/lib/api/contracts";

interface StoriesReadingBoardProps {
  stories: StoryDto[];
  isLoading?: boolean;
}

function estimateEnergy(score: number): "low" | "balanced" | "high" {
  if (score <= 2) return "low";
  if (score === 3) return "balanced";
  return "high";
}

export function StoriesReadingBoard({ stories, isLoading = false }: StoriesReadingBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(stories[0]?.id ?? null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [preferredEnergy, setPreferredEnergy] = useState<"low" | "balanced" | "high">("balanced");

  const selectedStory = useMemo(
    () => stories.find((story) => story.id === selectedId) ?? stories[0] ?? null,
    [stories, selectedId]
  );

  const orderedStories = useMemo(() => {
    const normalizedStories = stories.map((story) => ({
      ...story,
      energy: estimateEnergy(story.readingTimeMinutes),
    }));

    const preferred = normalizedStories.filter((story) => story.energy === preferredEnergy);
    const others = normalizedStories.filter((story) => story.energy !== preferredEnergy);
    return [...preferred, ...others];
  }, [stories, preferredEnergy]);

  function toggleRead(storyId: string) {
    setReadIds((current) => {
      const next = new Set(current);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading stories...</p>;
  }

  if (stories.length === 0) {
    return <p className="text-sm text-slate-600">No stories available yet. Check back soon.</p>;
  }

  const completionPercent = Math.round((readIds.size / stories.length) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reading progress</p>
            <p className="text-sm text-slate-700">
              {readIds.size} of {stories.length} stories marked as read ({completionPercent}%)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Pace</span>
            {(["low", "balanced", "high"] as const).map((energy) => (
              <button
                key={energy}
                type="button"
                onClick={() => setPreferredEnergy(energy)}
                className={`rounded-full border px-3 py-1 transition ${
                  preferredEnergy === energy
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {energy}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Story shelf</p>
          <ul className="mt-3 space-y-2">
            {orderedStories.map((story, index) => {
              const isActive = selectedStory?.id === story.id;
              const isRead = readIds.has(story.id);

              return (
                <li key={story.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(story.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      isActive
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Chapter {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{story.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{story.summary}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {story.readingTimeMinutes} min read {isRead ? "• Completed" : "• Not read"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          {selectedStory ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Now reading</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedStory.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleRead(selectedStory.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    readIds.has(selectedStory.id)
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {readIds.has(selectedStory.id) ? "Mark as unread" : "Mark as read"}
                </button>
              </div>

              <p className="mt-3 text-sm text-slate-600">{selectedStory.summary}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">{selectedStory.content}</p>
              <p className="mt-4 text-xs text-slate-500">
                By {selectedStory.author} • {selectedStory.readingTimeMinutes} min read
              </p>
            </>
          ) : null}
        </article>
      </div>
    </div>
  );
}
