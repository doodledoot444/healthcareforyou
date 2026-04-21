import type { JournalEntry } from "@/lib/store";

interface JournalListProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => void;
}

export function JournalList({ entries, onDelete }: JournalListProps) {
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
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(entry.createdAt))}
            </p>
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
        </li>
      ))}
    </ul>
  );
}
