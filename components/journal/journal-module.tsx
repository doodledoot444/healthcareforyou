"use client";

import { JournalEditor } from "./journal-editor";
import { JournalList } from "./journal-list";
import { useJournalEntries } from "./use-journal-entries";

export function JournalModule() {
  const { entries, isHydrated, addEntry } = useJournalEntries();

  if (!isHydrated) {
    return <p className="text-sm text-slate-600">Loading journal...</p>;
  }

  return (
    <div className="space-y-4">
      <JournalEditor onSave={addEntry} />
      <JournalList entries={entries} />
    </div>
  );
}
