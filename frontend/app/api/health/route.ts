import { prisma } from "@/lib/db";
import { jsonData } from "@/lib/api-utils";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return jsonData({ status: "ok", service: "utg-allscore-api" });
  } catch {
    return jsonData({ status: "degraded", service: "utg-allscore-api" }, undefined, 503);
  }
}
