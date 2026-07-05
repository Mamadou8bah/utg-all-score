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

  const competitionId = new URL(request.url).searchParams.get("competitionId");
  const userId = new URL(request.url).searchParams.get("userId");

  const entries = await prisma.competitionAgent.findMany({
    where: {
      ...(competitionId ? { competitionId } : {}),
      ...(userId ? { userId } : {})
    },
    include: {
      competition: true,
      user: { include: { school: true } }
    },
    orderBy: [{ competition: { name: "asc" } }, { user: { name: "asc" } }]
  });

  return jsonData(
    entries.map((entry) => ({
      competitionId: entry.competitionId,
      userId: entry.userId,
      competitionName: entry.competition.name,
      competitionType: entry.competition.type,
      agentName: entry.user.name,
      agentEmail: entry.user.email,
      schoolName: entry.user.school?.name ?? null
    })),
    request
  );
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const competitionId = body?.competitionId;
  const userId = body?.userId;

  if (!competitionId || !userId) {
    return jsonError("Competition and agent are required.", 400, request);
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) return jsonError("Competition not found.", 404, request);
  if (competition.type !== "GENERAL") {
    return jsonError("Only general (university-wide) competitions accept cross-school agent assignments.", 400, request);
  }

  const agent = await prisma.user.findUnique({ where: { id: userId, role: "AGENT", active: true } });
  if (!agent) return jsonError("Active agent not found.", 404, request);

  const entry = await prisma.competitionAgent.upsert({
    where: { competitionId_userId: { competitionId, userId } },
    create: { competitionId, userId },
    update: {}
  });

  return jsonData(entry, request, 201);
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const competitionId = body?.competitionId;
  const userId = body?.userId;

  if (!competitionId || !userId) {
    return jsonError("Competition and agent are required.", 400, request);
  }

  const entry = await prisma.competitionAgent.findUnique({
    where: { competitionId_userId: { competitionId, userId } }
  });
  if (!entry) return jsonError("Agent is not assigned to this competition.", 404, request);

  await prisma.competitionAgent.delete({
    where: { competitionId_userId: { competitionId, userId } }
  });

  return jsonData({ ok: true }, request);
}
