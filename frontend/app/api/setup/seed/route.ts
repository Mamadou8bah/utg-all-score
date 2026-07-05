import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed-database";
import { jsonData, jsonError } from "@/lib/api-utils";

export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return jsonError("Unauthorized", 401, request);
  }

  const users = await prisma.user.count();
  if (users > 0) {
    return jsonData({ message: "Database already seeded", seeded: false }, request);
  }

  await seedDatabase();
  return jsonData({ message: "Database seeded successfully", seeded: true }, request, 201);
}
