"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/store";

interface JournalListProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => void;
}

function deriveTone(content: string): "Heavy" | "Neutral" | "Uplifting" {
  const positiveHits = (content.match(/good|grateful|win|better|calm|great|hope/gi) ?? []).length;
  const negativeHits = (content.match(/stress|tired|low|hard|anxious|sad|overwhelmed/gi) ?? []).length;

  if (positiveHits > negativeHits) return "Uplifting";
  if (negativeHits > positiveHits) return "Heavy";
  return "Neutral";
}

function summarize(content: string, max = 140) {
  if (content.length <= max) return content;
  return `${content.slice(0, max).trimEnd()}...`;
}

export function JournalList({ entries, onDelete }: JournalListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No journal entries yet. Start by writing your first reflection.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tone: {deriveTone(entry.content)}
            </p>
            <p className="text-xs text-slate-500">
              {entry.content.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {expandedIds.has(entry.id) ? entry.content : summarize(entry.content)}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(entry.createdAt))}
            </p>
            <div className="flex items-center gap-3">
              {entry.content.length > 140 ? (
                <button
                  type="button"
                  onClick={() => toggleExpanded(entry.id)}
                  className="text-xs text-emerald-700 transition hover:text-emerald-600"
                >
                  {expandedIds.has(entry.id) ? "Show less" : "Read more"}
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-red-500 transition hover:text-red-400"
                  aria-label="Delete entry"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
