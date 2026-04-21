"use client";

import { FormEvent, useState } from "react";

interface JournalEditorProps {
  onSave: (content: string) => void;
  isSaving?: boolean;
}

export function JournalEditor({ onSave, isSaving = false }: JournalEditorProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    onSave(trimmedContent);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <label htmlFor="journal-entry" className="text-sm font-medium text-slate-700">
        New Journal Entry
      </label>
      <textarea
        id="journal-entry"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
        placeholder="Write about your day, mood, or small wins..."
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
        disabled={isSaving}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
