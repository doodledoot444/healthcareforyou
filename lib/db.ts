import { PrismaClient } from "../prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () =>
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

export const db = global.prisma ?? prismaClientSingleton();

let lastHealthCheck = 0;
let lastHealthStatus = false;

export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();

  // Reuse recent health check result to avoid extra round-trips on hot paths.
  if (now - lastHealthCheck < 15_000) {
    return lastHealthStatus;
  }

  try {
    await db.$queryRaw`SELECT 1`;
    lastHealthStatus = true;
  } catch {
    lastHealthStatus = false;
  }

  lastHealthCheck = now;
  return lastHealthStatus;
}

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
