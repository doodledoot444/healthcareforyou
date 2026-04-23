"use client";

import { FormEvent, useEffect, useState } from "react";
import { requestApi } from "@/lib/api/client";
import type { JournalPromptPayload } from "@/lib/api/contracts";

interface JournalEditorProps {
  onSave: (content: string) => void;
  isSaving?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "What shifted my mood most today?",
  "One small win I want to remember",
  "What drained my energy and why?",
  "What would make tomorrow 1% better?",
];

function getReflectionIntensity(wordCount: number): "Light" | "Focused" | "Deep" {
  if (wordCount < 20) return "Light";
  if (wordCount < 70) return "Focused";
  return "Deep";
}

function tonePillClass(tone: JournalPromptPayload["tone"] | null): string {
  if (tone === "supportive") return "bg-rose-100 text-rose-700";
  if (tone === "energizing") return "bg-amber-100 text-amber-700";
  if (tone === "balanced") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-600";
}

function toneLabel(tone: JournalPromptPayload["tone"] | null): string {
  if (tone === "supportive") return "Supportive";
  if (tone === "energizing") return "Energizing";
  if (tone === "balanced") return "Balanced";
  return "Default";
}

function toneBorderClass(tone: JournalPromptPayload["tone"] | null): string {
  if (tone === "supportive") return "border-rose-300 focus:border-rose-400";
  if (tone === "energizing") return "border-amber-300 focus:border-amber-400";
  if (tone === "balanced") return "border-sky-300 focus:border-sky-400";
  return "border-slate-200";
}

export function JournalEditor({ onSave, isSaving = false }: JournalEditorProps) {
  const [content, setContent] = useState("");
  const [prompts, setPrompts] = useState<string[]>(PROMPT_SUGGESTIONS);
  const [promptReason, setPromptReason] = useState<string | null>(null);
  const [promptTone, setPromptTone] = useState<JournalPromptPayload["tone"] | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [promptRefreshToken, setPromptRefreshToken] = useState(0);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characterCount = content.length;
  const intensity = getReflectionIntensity(wordCount);

  useEffect(() => {
    let cancelled = false;

    const loadPrompt = async () => {
      setIsPromptLoading(true);
      setPromptError(null);

      try {
        const data = await requestApi<JournalPromptPayload>("/api/journal/prompt", {
          method: "GET",
          cache: "no-store",
        });

        if (cancelled) return;

        const merged = [data.prompt, ...data.suggestions].filter((item, idx, arr) => {
          return item.trim().length > 0 && arr.indexOf(item) === idx;
        });

        setPrompts(merged.slice(0, 4).length > 0 ? merged.slice(0, 4) : PROMPT_SUGGESTIONS);
        setPromptReason(data.reason);
        setPromptTone(data.tone);
      } catch {
        if (!cancelled) {
          setPrompts(PROMPT_SUGGESTIONS);
          setPromptReason(null);
          setPromptTone(null);
          setPromptError("Could not load smart prompt. Showing defaults.");
        }
      } finally {
        if (!cancelled) {
          setIsPromptLoading(false);
        }
      }
    };

    void loadPrompt();

    return () => {
      cancelled = true;
    };
  }, [promptRefreshToken]);

  function applyPrompt(prompt: string) {
    setContent((current) => {
      if (current.trim().length === 0) {
        return `${prompt}\n\n`;
      }

      return `${current.trimEnd()}\n\n${prompt}\n`;
    });
  }

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
      <div className="space-y-2">
        <label htmlFor="journal-entry" className="text-sm font-medium text-slate-700">
          New Journal Entry
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {promptReason ? <p className="text-xs text-slate-500">{promptReason}</p> : null}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tonePillClass(promptTone)}`}>
            {toneLabel(promptTone)} tone
          </span>
          {promptError ? (
            <button
              type="button"
              onClick={() => setPromptRefreshToken((value) => value + 1)}
              disabled={isPromptLoading || isSaving}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry
            </button>
          ) : null}
        </div>
        {promptError ? <p className="text-[11px] text-amber-700">{promptError}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          {isPromptLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={`prompt-skeleton-${index}`}
                  className="h-7 w-40 animate-pulse rounded-full border border-slate-200 bg-white"
                />
              ))
            : prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => applyPrompt(prompt)}
                  disabled={isSaving}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
        </div>
      </div>
      <textarea
        id="journal-entry"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
        placeholder="Write about your day, mood, or small wins..."
        className={`w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-2 ${toneBorderClass(promptTone)} disabled:opacity-60`}
        disabled={isSaving}
      />
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
        <div className="flex items-center justify-between gap-2">
          <p>
            Reflection depth: <span className="font-semibold text-slate-700">{intensity}</span>
          </p>
          <p>
            {wordCount} words · {characterCount} chars
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.round((wordCount / 120) * 100))}%` }}
          />
        </div>
      </div>
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
