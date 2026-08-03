import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { agentCanAccessMatch, fetchMatchById, serializeMatch } from "@/lib/services/football";
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

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (session!.role === "AGENT") {
    const allowed = await agentCanAccessMatch(session!.id, id);
    if (!allowed) return jsonError("You can only update matches for your school or assigned general competitions.", 403, request);
  }

  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true }
  });
  if (!match) return jsonError("Match not found.", 404, request);

  const previousStatus = match.status;

  const updated = await prisma.match.update({
    where: { id },
    data: {
      homeScore: body?.homeScore ?? match.homeScore,
      awayScore: body?.awayScore ?? match.awayScore,
      status: body?.status ?? match.status,
      timer: body?.timer ?? match.timer,
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

  const full = await fetchMatchById(id);
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
    if (!allowed) return jsonError("You can only update matches for your school or assigned general competitions.", 403, request);
  }

  const action = body?.action;

  if (action === "add-event") {
    const event = await prisma.matchEvent.create({
      data: {
        matchId: id,
        minute: Number(body.minute) || 0,
        type: body.type || "Goal",
        player: body.player || "Unknown",
        team: body.team || "",
        detail: body.detail || ""
      }
    });
    await syncPlayerStatsForMatchEvent(id, event.team);

    if (String(event.type).toLowerCase() === "goal") {
      const full = await fetchMatchById(id);
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

    const full = await fetchMatchById(id);
    return jsonData(serializeMatch(full)!, request);
  }

  return jsonError("Unsupported action.", 400, request);
}
