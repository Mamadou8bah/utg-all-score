import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    include: {
      school: true,
      competitionAssignments: { include: { competition: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return jsonData(
    agents.map((agent) => ({
      id: agent.id,
      email: agent.email,
      name: agent.name,
      active: agent.active,
      schoolId: agent.schoolId,
      schoolName: agent.school?.name ?? null,
      assignedCompetitions: agent.competitionAssignments.map((entry) => ({
          id: entry.competitionId,
          name: entry.competition.name,
          type: entry.competition.type
        })),
      createdAt: agent.createdAt.toISOString()
    })),
    request
  );
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = body?.password;
  const schoolId = body?.schoolId;

  if (!email || email.length > 254 || !name || name.length > 100 || typeof password !== "string" || password.length < 8 || password.length > 256 || typeof schoolId !== "string" || !schoolId) {
    return jsonError("Name, email, school, and a password of 8 to 256 characters are required.", 400, request);
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return jsonError("School not found.", 404, request);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("An account with this email already exists.", 400, request);

  const agent = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "AGENT",
      schoolId
    },
    include: { school: true }
  });

  return jsonData(
    {
      id: agent.id,
      email: agent.email,
      name: agent.name,
      schoolId: agent.schoolId,
      schoolName: agent.school?.name ?? null
    },
    request,
    201
  );
}
