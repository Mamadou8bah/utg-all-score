import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  return jsonData(schools, request);
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const shortName = body?.shortName?.trim() || name?.split(" ").slice(-1)[0] || "";

  if (!name) return jsonError("School name is required.", 400, request);

  const existing = await prisma.school.findUnique({ where: { name } });
  if (existing) return jsonError("A school with this name already exists.", 400, request);

  const school = await prisma.school.create({ data: { name, shortName } });
  return jsonData(school, request, 201);
}
