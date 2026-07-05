import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed-database";
import { ensureDefaultAdmin } from "@/lib/bootstrap-admin";
import { jsonData, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return jsonError("Unauthorized", 401, request);
  }

  const competitions = await prisma.competition.count();
  if (competitions > 0) {
    const admin = await ensureDefaultAdmin(prisma);
    return jsonData(
      {
        message: "Database already seeded",
        seeded: false,
        adminEnsured: true,
        adminId: admin.id
      },
      request
    );
  }

  await seedDatabase();
  return jsonData({ message: "Database seeded successfully", seeded: true }, request, 201);
}
