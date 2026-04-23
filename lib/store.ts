/**
 * Compatibility layer preserving legacy store function names while delegating
 * to persistent Prisma-backed services.
 */

import {
  getCompletedPlanItems,
  getSessionParticipationTotal,
  markParticipation,
  setPlanItemCompletionState,
  togglePlanItemCompletionState,
} from "@/services/plan.service";
import { createJournalEntry, listJournalEntries, removeJournalEntry } from "@/services/journal.service";

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

type PersistenceMode = "database" | "hybrid" | "memory";

const inMemoryJournalEntries = new Map<string, JournalEntry[]>();
const inMemoryCompletedItems = new Map<string, Set<string>>();
const inMemoryParticipationByDay = new Map<string, Set<string>>();
let hybridBackoffUntil = 0;

const DEFAULT_DB_OPERATION_TIMEOUT_MS = 1200;
const DEFAULT_HYBRID_BACKOFF_MS = 30_000;

function getPersistenceMode(): PersistenceMode {
  const mode = process.env.PERSISTENCE_MODE?.toLowerCase();

  if (mode === "database" || mode === "memory" || mode === "hybrid") {
    return mode;
  }

  return "hybrid";
}

function getDbOperationTimeoutMs() {
  const value = Number(process.env.DB_OPERATION_TIMEOUT_MS ?? DEFAULT_DB_OPERATION_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DB_OPERATION_TIMEOUT_MS;
}

function getHybridBackoffMs() {
  const value = Number(process.env.HYBRID_DB_BACKOFF_MS ?? DEFAULT_HYBRID_BACKOFF_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_HYBRID_BACKOFF_MS;
}

function isHybridBackoffActive() {
  return Date.now() < hybridBackoffUntil;
}

function markHybridFailure() {
  hybridBackoffUntil = Date.now() + getHybridBackoffMs();
}

async function shouldUseDatabase(): Promise<boolean> {
  const mode = getPersistenceMode();

  if (mode === "memory") {
    return false;
  }

  if (mode === "database") {
    return true;
  }

  if (isHybridBackoffActive()) {
    return false;
  }

  return true;
}

async function runWithTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("Database operation timed out."));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function toUtcDateKey(at: Date): string {
  return at.toISOString().slice(0, 10);
}

function getOrCreateSet(map: Map<string, Set<string>>, key: string): Set<string> {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }

  const created = new Set<string>();
  map.set(key, created);
  return created;
}

function touchInMemoryParticipation(userId: string, at = new Date()) {
  const dayKey = toUtcDateKey(at);
  const days = getOrCreateSet(inMemoryParticipationByDay, userId);
  days.add(dayKey);
}

export async function markSessionParticipation(userId: string, at = new Date()): Promise<void> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        await runWithTimeout(markParticipation(userId, at), getDbOperationTimeoutMs());
      } else {
        await markParticipation(userId, at);
      }

      return;
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  touchInMemoryParticipation(userId, at);
}

export async function getSessionParticipationCount(userId: string): Promise<number> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(getSessionParticipationTotal(userId), getDbOperationTimeoutMs());
      }

      return await getSessionParticipationTotal(userId);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  return inMemoryParticipationByDay.get(userId)?.size ?? 0;
}

// --- Plan completions ---

export async function getCompletedItems(userId: string): Promise<Set<string>> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(getCompletedPlanItems(userId), getDbOperationTimeoutMs());
      }

      return await getCompletedPlanItems(userId);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  return new Set(inMemoryCompletedItems.get(userId) ?? []);
}

export async function togglePlanItem(userId: string, itemId: string): Promise<boolean> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(
          togglePlanItemCompletionState(userId, itemId),
          getDbOperationTimeoutMs(),
        );
      }

      return await togglePlanItemCompletionState(userId, itemId);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  const completed = getOrCreateSet(inMemoryCompletedItems, userId);
  const nextValue = !completed.has(itemId);

  if (nextValue) {
    completed.add(itemId);
  } else {
    completed.delete(itemId);
  }

  touchInMemoryParticipation(userId);
  return nextValue;
}

export async function setPlanItemCompletion(
  userId: string,
  itemId: string,
  completed: boolean,
): Promise<boolean> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(
          setPlanItemCompletionState(userId, itemId, completed),
          getDbOperationTimeoutMs(),
        );
      }

      return await setPlanItemCompletionState(userId, itemId, completed);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  const current = getOrCreateSet(inMemoryCompletedItems, userId);

  if (completed) {
    current.add(itemId);
  } else {
    current.delete(itemId);
  }

  touchInMemoryParticipation(userId);
  return completed;
}

// --- Journal ---

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(listJournalEntries(userId), getDbOperationTimeoutMs());
      }

      return await listJournalEntries(userId);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  return inMemoryJournalEntries.get(userId) ?? [];
}

export async function addJournalEntry(userId: string, content: string): Promise<JournalEntry> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(createJournalEntry(userId, content), getDbOperationTimeoutMs());
      }

      return await createJournalEntry(userId, content);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  const nextEntry: JournalEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  const userEntries = inMemoryJournalEntries.get(userId) ?? [];
  inMemoryJournalEntries.set(userId, [nextEntry, ...userEntries]);
  touchInMemoryParticipation(userId);
  return nextEntry;
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<boolean> {
  if (await shouldUseDatabase()) {
    try {
      const mode = getPersistenceMode();
      if (mode === "hybrid") {
        return await runWithTimeout(removeJournalEntry(userId, entryId), getDbOperationTimeoutMs());
      }

      return await removeJournalEntry(userId, entryId);
    } catch {
      if (getPersistenceMode() === "database") {
        throw new Error("Database persistence is required but unavailable.");
      }

      markHybridFailure();
    }
  }

  const current = inMemoryJournalEntries.get(userId) ?? [];
  const next = current.filter((entry) => entry.id !== entryId);
  const removed = next.length !== current.length;

  if (removed) {
    inMemoryJournalEntries.set(userId, next);
    touchInMemoryParticipation(userId);
  }

  return removed;
}
