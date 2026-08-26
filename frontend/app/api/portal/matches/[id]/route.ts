import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import {
  agentCanAccessMatch,
  matchIncludeWithSquads,
  serializeMatch
} from "@/lib/services/football";
import { processMatchResult, syncPlayerStatsForMatchEvent } from "@/lib/services/competition-engine";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";
import { schedulePushToAll } from "@/lib/push";

type RouteContext = { params: Promise<{ id: string }> };

function scoreline(home: string, away: string, homeScore: number, awayScore: number) {
  return `${home} ${homeScore}–${awayScore} ${away}`;
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const { id } = await context.params;
  if (session!.role === "AGENT") {
    const allowed = await agentCanAccessMatch(session!.id, id);
    if (!allowed) return jsonError("You can only view matches assigned to you.", 403, request);
  }

  const match = await prisma.match.findUnique({ where: { id }, include: matchIncludeWithSquads });
  if (!match) return jsonError("Match not found.", 404, request);
  return jsonData(serializeMatch(match)!, request);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (session!.role === "AGENT") {
    const allowed = await agentCanAccessMatch(session!.id, id);
    if (!allowed) return jsonError("You can only update matches assigned to you.", 403, request);
  }

  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true }
  });
  if (!match) return jsonError("Match not found.", 404, request);

  const previousStatus = match.status;
  const nextStatus = body?.status ?? match.status;
  const nextHomeScore = body?.homeScore ?? match.homeScore;
  const nextAwayScore = body?.awayScore ?? match.awayScore;
  const nextTimer = body?.timer ?? match.timer;

  if (session!.role === "AGENT" && match.status === "UPCOMING") {
    const scoreChanging = nextHomeScore !== match.homeScore || nextAwayScore !== match.awayScore;
    if (scoreChanging) {
      return jsonError("This match has not started yet. Set status to Live before updating the score.", 400, request);
    }
    if (nextStatus === "HT" || nextStatus === "FT") {
      return jsonError("Start the match (Live) before setting half time or full time.", 400, request);
    }
    if (nextTimer && nextTimer !== match.timer && nextStatus === "UPCOMING") {
      return jsonError("This match has not started yet. Set status to Live before updating the clock.", 400, request);
    }
  }

  const updated = await prisma.match.update({
    where: { id },
    data: {
      homeScore: nextHomeScore,
      awayScore: nextAwayScore,
      status: nextStatus,
      timer: nextTimer,
      venue: body?.venue ?? match.venue
    },
    include: { homeTeam: true, awayTeam: true }
  });

  await processMatchResult(id, previousStatus);

  if (updated.status !== previousStatus) {
    const line = scoreline(updated.homeTeam.name, updated.awayTeam.name, updated.homeScore, updated.awayScore);

    if (updated.status === "LIVE" && previousStatus === "HT") {
      schedulePushToAll({
        title: "Second half underway",
        body: line,
        url: "/live",
        tag: `match-2h-${updated.id}`
      });
    } else if (updated.status === "LIVE") {
      schedulePushToAll({
        title: "Kickoff",
        body: `${updated.homeTeam.name} vs ${updated.awayTeam.name}`,
        url: "/live",
        tag: `match-ko-${updated.id}`
      });
    } else if (updated.status === "HT") {
      schedulePushToAll({
        title: "Half time",
        body: line,
        url: "/live",
        tag: `match-ht-${updated.id}`
      });
    } else if (updated.status === "FT") {
      schedulePushToAll({
        title: "Full time",
        body: line,
        url: "/results",
        tag: `match-ft-${updated.id}`
      });
    }
  }

  const full = await prisma.match.findUnique({ where: { id }, include: matchIncludeWithSquads });
  return jsonData(serializeMatch(full)!, request);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (session!.role === "AGENT") {
    const allowed = await agentCanAccessMatch(session!.id, id);
    if (!allowed) return jsonError("You can only update matches assigned to you.", 403, request);
  }

  const action = body?.action;

  if (action === "add-event") {
    const match = await prisma.match.findUnique({
      where: { id },
      include: { homeTeam: true, awayTeam: true }
    });
    if (!match) return jsonError("Match not found.", 404, request);
    if (session!.role === "AGENT" && match.status === "UPCOMING") {
      return jsonError("Cannot add events before the match starts. Set status to Live first.", 400, request);
    }

    const teamName = String(body.team || "").trim();
    if (teamName && teamName !== match.homeTeam.name && teamName !== match.awayTeam.name) {
      return jsonError("Event team must be the home or away team.", 400, request);
    }

    const event = await prisma.matchEvent.create({
      data: {
        matchId: id,
        minute: Number(body.minute) || 0,
        type: body.type || "Goal",
        player: body.player || "Unknown",
        team: teamName,
        detail: body.detail || ""
      }
    });
    await syncPlayerStatsForMatchEvent(id, event.team);

    if (String(event.type).toLowerCase() === "goal") {
      const full = await prisma.match.findUnique({ where: { id }, include: matchIncludeWithSquads });
      const serialized = serializeMatch(full);
      if (serialized) {
        schedulePushToAll({
          title: `GOAL! ${event.player}`,
          body: `${event.team} · ${serialized.home} ${serialized.homeScore}–${serialized.awayScore} ${serialized.away}`,
          url: "/live",
          tag: `goal-${event.id}`
        });
      }
    }

    return jsonData(event, request, 201);
  }

  if (action === "set-lineups") {
    const home = body?.home as Array<{ number: number; name: string; role: string; isSub?: boolean }>;
    const away = body?.away as Array<{ number: number; name: string; role: string; isSub?: boolean }>;

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) return jsonError("Match not found.", 404, request);

    await prisma.lineupPlayer.deleteMany({ where: { matchId: id } });

    const rows = [
      ...(home ?? []).map((p) => ({ matchId: id, teamId: match.homeTeamId, ...p, isSub: !!p.isSub })),
      ...(away ?? []).map((p) => ({ matchId: id, teamId: match.awayTeamId, ...p, isSub: !!p.isSub }))
    ];

    if (rows.length) {
      await prisma.lineupPlayer.createMany({ data: rows });
    }

    const full = await prisma.match.findUnique({ where: { id }, include: matchIncludeWithSquads });
    return jsonData(serializeMatch(full)!, request);
  }

  return jsonError("Unsupported action.", 400, request);
}
