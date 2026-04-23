"use client";

import { useMemo, useState } from "react";
import { useJournal } from "@/hooks/use-journal";
import { JournalEditor } from "./journal-editor";
import { JournalList } from "./journal-list";

export function JournalModule() {
  const { entries, isLoading, addEntry, removeEntry, isAdding } = useJournal();
  const [filterDays, setFilterDays] = useState<7 | 30 | 90>(30);
  const [query, setQuery] = useState("");
  const [referenceTime, setReferenceTime] = useState(() => Date.now());

  const filteredEntries = useMemo(() => {
    const threshold = referenceTime - filterDays * 24 * 60 * 60 * 1000;

    return entries.filter((entry) => {
      const createdAt = new Date(entry.createdAt).getTime();
      const matchesWindow = createdAt >= threshold;
      const matchesQuery =
        query.trim().length === 0 || entry.content.toLowerCase().includes(query.toLowerCase());

      return matchesWindow && matchesQuery;
    });
  }, [entries, filterDays, query, referenceTime]);

  const totalWords = filteredEntries.reduce(
    (count, entry) => count + entry.content.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading journal…</p>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reflection pulse</p>
            <p className="text-sm text-slate-700">
              {filteredEntries.length} entries · {totalWords} words in selected window
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {([7, 30, 90] as const).map((window) => (
              <button
                key={window}
                type="button"
                onClick={() => {
                  setFilterDays(window);
                  setReferenceTime(Date.now());
                }}
                className={`rounded-full border px-3 py-1 transition ${
                  filterDays === window
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {window}d
              </button>
            ))}
          </div>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search reflections by keyword..."
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
        />
      </section>
      <JournalEditor onSave={addEntry} isSaving={isAdding} />
      <JournalList entries={filteredEntries} onDelete={removeEntry} />
    </div>
  );
}
