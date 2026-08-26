import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { serializeMatch } from "@/lib/services/football";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

const adminMatchInclude = {
  competition: true,
  homeTeam: true,
  awayTeam: true,
  events: { orderBy: { minute: "asc" as const } },
  lineups: true,
  agents: { include: { user: true } }
};

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const matches = await prisma.match.findMany({
    include: adminMatchInclude,
    orderBy: { kickoff: "desc" },
    take: 100
  });

  return jsonData(matches.map((m) => serializeMatch(m)!), request);
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const competitionId = body?.competitionId;
  const homeTeamId = body?.homeTeamId;
  const awayTeamId = body?.awayTeamId;
  const venue = body?.venue?.trim() || "UTG Main Field";
  const kickoff = body?.kickoff;
  const status = body?.status || "UPCOMING";
  const round = body?.round?.trim() || null;
  const groupId = body?.groupId || null;
  const nextMatchId = body?.nextMatchId || null;
  const nextMatchSlot = body?.nextMatchSlot || null;
  const agentIds: string[] = Array.isArray(body?.agentIds)
    ? body.agentIds.filter((id: unknown) => typeof id === "string" && id)
    : body?.agentId
      ? [String(body.agentId)]
      : [];

  if (!competitionId || !homeTeamId || !awayTeamId || !kickoff) {
    return jsonError("Competition, home team, away team, and kickoff are required.", 400, request);
  }

  if (homeTeamId === awayTeamId) {
    return jsonError("Home and away teams must be different.", 400, request);
  }

  const [competition, homeTeam, awayTeam] = await Promise.all([
    prisma.competition.findUnique({ where: { id: competitionId } }),
    prisma.team.findUnique({ where: { id: homeTeamId } }),
    prisma.team.findUnique({ where: { id: awayTeamId } })
  ]);

  if (!competition) return jsonError("Competition not found.", 404, request);
  if (!homeTeam || !awayTeam) return jsonError("Team not found.", 404, request);

  const linkedTeams = await prisma.competitionTeam.findMany({
    where: { competitionId, teamId: { in: [homeTeamId, awayTeamId] } },
    select: { teamId: true }
  });
  const linkedIds = new Set(linkedTeams.map((row) => row.teamId));
  if (!linkedIds.has(homeTeamId) || !linkedIds.has(awayTeamId)) {
    return jsonError("Both teams must be linked to the selected competition before scheduling.", 400, request);
  }

  if (agentIds.length) {
    const agents = await prisma.user.findMany({
      where: { id: { in: agentIds }, role: "AGENT", active: true }
    });
    if (agents.length !== agentIds.length) {
      return jsonError("One or more selected agents are invalid or inactive.", 400, request);
    }
  }

  const stage = body?.stage || (competition.format === "TOURNAMENT" ? "GROUP" : "LEAGUE");

  const match = await prisma.match.create({
    data: {
      competitionId,
      homeTeamId,
      awayTeamId,
      venue,
      kickoff: new Date(kickoff),
      status,
      stage,
      round,
      groupId,
      nextMatchId,
      nextMatchSlot,
      homeScore: 0,
      awayScore: 0,
      agents: agentIds.length
        ? { create: agentIds.map((userId) => ({ userId })) }
        : undefined
    },
    include: adminMatchInclude
  });

  return jsonData(serializeMatch(match)!, request, 201);
}
