// src/lib/db.js
// ─── Prisma Client Singleton ──────────────────────────────────
// Uses Prisma v7's Neon adapter so app queries go through Neon's pooler.
// Ensures a single Prisma Client instance is reused across hot reloads
// in development, preventing unnecessary reconnects.

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
