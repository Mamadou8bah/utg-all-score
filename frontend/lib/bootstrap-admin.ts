import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

export const DEFAULT_ADMIN_EMAIL = "admin@utgsu.edu.gm";
export const DEFAULT_ADMIN_PASSWORD = "UTGSUAdmin2026!";
export const DEFAULT_ADMIN_NAME = "UTGSU Sports Admin";

export async function ensureDefaultAdmin(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

  return prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      passwordHash,
      name: DEFAULT_ADMIN_NAME,
      role: "ADMIN",
      active: true
    },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      name: DEFAULT_ADMIN_NAME,
      role: "ADMIN"
    }
  });
}
