import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { serializeMatch, getAgentAssignedCompetitionIds } from "@/lib/services/football";
import { jsonData, requireUser } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const assignedCompetitionIds =
    session!.role === "AGENT" ? await getAgentAssignedCompetitionIds(session!.id) : [];

  const orConditions: Array<Record<string, unknown>> = [];

  if (session!.role === "AGENT" && session!.schoolId) {
    orConditions.push(
      { homeTeam: { schoolId: session!.schoolId } },
      { awayTeam: { schoolId: session!.schoolId } }
    );
  }

  if (session!.role === "AGENT" && assignedCompetitionIds.length) {
    orConditions.push({ competitionId: { in: assignedCompetitionIds } });
  }

  const where =
    session!.role === "AGENT"
      ? orConditions.length
        ? { OR: orConditions }
        : { id: { in: [] } }
      : {};

  const matches = await prisma.match.findMany({
    where,
    include: {
      competition: { include: { school: true } },
      homeTeam: true,
      awayTeam: true,
      events: { orderBy: { minute: "asc" } },
      lineups: true
    },
    orderBy: { kickoff: "desc" },
    take: 50
  });

  return jsonData(matches.map((m) => serializeMatch(m)!), request);
}
