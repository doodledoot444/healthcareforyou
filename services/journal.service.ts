import { db } from "@/lib/db";
import type { JournalEntry } from "@/lib/store";

function toJournalEntry(entry: { id: string; content: string; createdAt: Date }): JournalEntry {
  return {
    id: entry.id,
    content: entry.content,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function listJournalEntries(userId: string): Promise<JournalEntry[]> {
  const entries = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });

  return entries.map(toJournalEntry);
}

export async function createJournalEntry(userId: string, content: string): Promise<JournalEntry> {
  return db.$transaction(async (tx) => {
    const created = await tx.journalEntry.create({
      data: {
        userId,
        content: content.trim(),
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    await tx.userSessionParticipation.upsert({
      where: {
        userId_day: {
          userId,
          day: new Date(new Date().toISOString().slice(0, 10)),
        },
      },
      update: {},
      create: {
        userId,
        day: new Date(new Date().toISOString().slice(0, 10)),
      },
    });

    return toJournalEntry(created);
  });
}

export async function removeJournalEntry(userId: string, entryId: string): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const deleted = await tx.journalEntry.deleteMany({
      where: {
        id: entryId,
        userId,
      },
    });

    if (deleted.count > 0) {
      await tx.userSessionParticipation.upsert({
        where: {
          userId_day: {
            userId,
            day: new Date(new Date().toISOString().slice(0, 10)),
          },
        },
        update: {},
        create: {
          userId,
          day: new Date(new Date().toISOString().slice(0, 10)),
        },
      });
      return true;
    }

    return false;
  });
}
