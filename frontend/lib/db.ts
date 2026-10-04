import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function runtimeDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;
  const url = new URL(value);
  // Neon may need longer than Prisma's default connection timeout to wake up.
  // Preserve explicitly configured timeouts and other database providers.
  if (url.hostname.endsWith(".neon.tech")) {
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "15");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "20");
  }
  return url.toString();
}

const databaseUrl = runtimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

// Reuse one client across hot reloads and serverless invocations in the same isolate.
globalForPrisma.prisma = prisma;
