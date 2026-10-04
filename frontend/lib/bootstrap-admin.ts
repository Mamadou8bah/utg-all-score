import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

export const DEFAULT_ADMIN_EMAIL = "admin@utgsu.edu.gm";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || (process.env.NODE_ENV !== "production" ? "UTGSUAdmin2026!" : "");
export const DEFAULT_ADMIN_NAME = "Sports Admin";

export async function ensureDefaultAdmin(prisma: PrismaClient) {
  const existing = await prisma.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } });
  if (existing) return existing;
  if (DEFAULT_ADMIN_PASSWORD.length < 12) throw new Error("Set ADMIN_INITIAL_PASSWORD to a unique password of at least 12 characters before creating a production admin.");
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

  return prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {},
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      name: DEFAULT_ADMIN_NAME,
      role: "ADMIN"
    }
  });
}
