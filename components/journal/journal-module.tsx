"use client";

import { useJournal } from "@/hooks/use-journal";
import { JournalEditor } from "./journal-editor";
import { JournalList } from "./journal-list";

export function JournalModule() {
  const { entries, isLoading, addEntry, removeEntry, isAdding } = useJournal();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading journal…</p>;
  }

  return (
    <div className="space-y-4">
      <JournalEditor onSave={addEntry} isSaving={isAdding} />
      <JournalList entries={entries} onDelete={removeEntry} />
    </div>
  );
}
