import { db } from "@/lib/db";

function toUtcDay(at: Date): Date {
  return new Date(at.toISOString().slice(0, 10));
}

async function touchSessionParticipation(userId: string, at = new Date()) {
  await db.userSessionParticipation.upsert({
    where: {
      userId_day: {
        userId,
        day: toUtcDay(at),
      },
    },
    update: {},
    create: {
      userId,
      day: toUtcDay(at),
    },
  });
}

export async function getCompletedPlanItems(userId: string): Promise<Set<string>> {
  const rows = await db.planCompletion.findMany({
    where: { userId },
    select: { itemId: true },
  });

  return new Set(rows.map((row) => row.itemId));
}

export async function setPlanItemCompletionState(
  userId: string,
  itemId: string,
  completed: boolean,
): Promise<boolean> {
  await db.$transaction(async (tx) => {
    if (completed) {
      await tx.planCompletion.upsert({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          userId,
          itemId,
        },
      });
    } else {
      await tx.planCompletion.deleteMany({
        where: {
          userId,
          itemId,
        },
      });
    }

    await tx.userSessionParticipation.upsert({
      where: {
        userId_day: {
          userId,
          day: toUtcDay(new Date()),
        },
      },
      update: {},
      create: {
        userId,
        day: toUtcDay(new Date()),
      },
    });
  });

  return completed;
}

export async function togglePlanItemCompletionState(userId: string, itemId: string): Promise<boolean> {
  const existing = await db.planCompletion.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await setPlanItemCompletionState(userId, itemId, false);
    return false;
  }

  await setPlanItemCompletionState(userId, itemId, true);
  return true;
}

export async function markParticipation(userId: string, at = new Date()) {
  await touchSessionParticipation(userId, at);
}

export async function getSessionParticipationTotal(userId: string): Promise<number> {
  return db.userSessionParticipation.count({
    where: { userId },
  });
}
