import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { serializeMatch } from "@/lib/services/football";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const matches = await prisma.match.findMany({
    include: {
      competition: { include: { school: true } },
      homeTeam: true,
      awayTeam: true,
      events: { orderBy: { minute: "asc" } },
      lineups: true
    },
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
      awayScore: 0
    },
    include: {
      competition: { include: { school: true } },
      homeTeam: true,
      awayTeam: true,
      events: true,
      lineups: true
    }
  });

  return jsonData(serializeMatch(match)!, request, 201);
}
