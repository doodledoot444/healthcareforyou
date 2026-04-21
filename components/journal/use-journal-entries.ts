"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { JournalEntry } from "./types";

const JOURNAL_STORAGE_KEY = "jh-tracker:journal-entries";

interface JournalState {
  entries: JournalEntry[];
  isHydrated: boolean;
}

type JournalAction =
  | { type: "hydrate"; entries: JournalEntry[] }
  | { type: "add"; content: string };

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  if (action.type === "hydrate") {
    return {
      entries: action.entries,
      isHydrated: true,
    };
  }

  const trimmedContent = action.content.trim();

  if (!trimmedContent) {
    return state;
  }

  const newEntry: JournalEntry = {
    id: `${Date.now()}`,
    content: trimmedContent,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    entries: [newEntry, ...state.entries],
  };
}

function parseJournalEntries(raw: string | null): JournalEntry[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as JournalEntry[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.id === "string" &&
        typeof entry.content === "string" &&
        typeof entry.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function useJournalEntries() {
  const [state, dispatch] = useReducer(journalReducer, {
    entries: [],
    isHydrated: false,
  });
  const { entries, isHydrated } = state;

  useEffect(() => {
    const initialEntries = parseJournalEntries(window.localStorage.getItem(JOURNAL_STORAGE_KEY));
    dispatch({ type: "hydrate", entries: initialEntries });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries, isHydrated]);

  const addEntry = useCallback((content: string) => {
    dispatch({ type: "add", content });
  }, []);

  const recentEntries = useMemo(() => entries.slice(0, 3), [entries]);

  return {
    entries,
    recentEntries,
    isHydrated,
    addEntry,
  };
}
