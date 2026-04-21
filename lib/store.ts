/**
 * Ephemeral in-memory store for plan item completions and journal entries.
 * Keys are userId strings. Data resets on server restart.
 * Swap the backing maps for database calls when ready to persist.
 */

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

// userId → Set of completed item IDs
const planCompletions = new Map<string, Set<string>>();

// userId → journal entries (newest first)
const journalEntries = new Map<string, JournalEntry[]>();

// userId -> unique session day stamps (YYYY-MM-DD)
const sessionParticipations = new Map<string, Set<string>>();

function dayStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function markSessionParticipation(userId: string, at = new Date()): void {
  const existing = sessionParticipations.get(userId) ?? new Set<string>();
  existing.add(dayStamp(at));
  sessionParticipations.set(userId, existing);
}

export function getSessionParticipationCount(userId: string): number {
  return sessionParticipations.get(userId)?.size ?? 0;
}

// --- Plan completions ---

export function getCompletedItems(userId: string): Set<string> {
  if (!planCompletions.has(userId)) {
    planCompletions.set(userId, new Set());
  }
  return planCompletions.get(userId)!;
}

export function togglePlanItem(userId: string, itemId: string): boolean {
  const completed = getCompletedItems(userId);
  if (completed.has(itemId)) {
    completed.delete(itemId);
    markSessionParticipation(userId);
    return false;
  } else {
    completed.add(itemId);
    markSessionParticipation(userId);
    return true;
  }
}

export function setPlanItemCompletion(userId: string, itemId: string, completed: boolean): boolean {
  const existing = getCompletedItems(userId);
  if (completed) {
    existing.add(itemId);
  } else {
    existing.delete(itemId);
  }
  markSessionParticipation(userId);
  return completed;
}

// --- Journal ---

export function getJournalEntries(userId: string): JournalEntry[] {
  return journalEntries.get(userId) ?? [];
}

export function addJournalEntry(userId: string, content: string): JournalEntry {
  const entry: JournalEntry = {
    id: `${userId}-${Date.now()}`,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  const existing = journalEntries.get(userId) ?? [];
  journalEntries.set(userId, [entry, ...existing]);
  markSessionParticipation(userId);
  return entry;
}

export function deleteJournalEntry(userId: string, entryId: string): boolean {
  const existing = journalEntries.get(userId) ?? [];
  const filtered = existing.filter((e) => e.id !== entryId);
  if (filtered.length === existing.length) {
    return false;
  }
  journalEntries.set(userId, filtered);
  markSessionParticipation(userId);
  return true;
}
