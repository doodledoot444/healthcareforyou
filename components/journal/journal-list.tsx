import type { JournalEntry } from "./types";

interface JournalListProps {
  entries: JournalEntry[];
}

export function JournalList({ entries }: JournalListProps) {
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
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{entry.content}</p>
          <p className="mt-2 text-xs text-slate-500">
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(entry.createdAt))}
          </p>
        </li>
      ))}
    </ul>
  );
}
