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

  const matchId = new URL(request.url).searchParams.get("matchId");
  const userId = new URL(request.url).searchParams.get("userId");

  const entries = await prisma.matchAgent.findMany({
    where: {
      ...(matchId ? { matchId } : {}),
      ...(userId ? { userId } : {})
    },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        }
      },
      user: { include: { school: true } }
    },
    orderBy: [{ match: { kickoff: "desc" } }, { user: { name: "asc" } }]
  });

  return jsonData(
    entries.map((entry) => ({
      matchId: entry.matchId,
      userId: entry.userId,
      matchLabel: `${entry.match.homeTeam.name} vs ${entry.match.awayTeam.name}`,
      competitionName: entry.match.competition.name,
      kickoff: entry.match.kickoff.toISOString(),
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
  const matchId = body?.matchId;
  const userId = body?.userId;

  if (!matchId || !userId) {
    return jsonError("Match and agent are required.", 400, request);
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return jsonError("Match not found.", 404, request);

  const agent = await prisma.user.findUnique({ where: { id: userId } });
  if (!agent || agent.role !== "AGENT" || !agent.active) {
    return jsonError("Active agent not found.", 404, request);
  }

  const entry = await prisma.matchAgent.upsert({
    where: { matchId_userId: { matchId, userId } },
    create: { matchId, userId },
    update: {}
  });

  return jsonData(entry, request, 201);
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const matchId = body?.matchId;
  const userId = body?.userId;

  if (!matchId || !userId) {
    return jsonError("Match and agent are required.", 400, request);
  }

  const entry = await prisma.matchAgent.findUnique({
    where: { matchId_userId: { matchId, userId } }
  });
  if (!entry) return jsonError("Agent is not assigned to this match.", 404, request);

  await prisma.matchAgent.delete({
    where: { matchId_userId: { matchId, userId } }
  });

  return jsonData({ ok: true }, request);
}
