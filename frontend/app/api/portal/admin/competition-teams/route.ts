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
  const entries = await prisma.competitionTeam.findMany({
    where: competitionId ? { competitionId } : undefined,
    include: { team: true, competition: true },
    orderBy: { team: { name: "asc" } }
  });

  return jsonData(
    entries.map((e) => ({
      competitionId: e.competitionId,
      teamId: e.teamId,
      teamName: e.team.name,
      competitionName: e.competition.name
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
  const teamId = body?.teamId;

  if (!competitionId || !teamId) {
    return jsonError("Competition and team are required.", 400, request);
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!competition) return jsonError("Competition not found.", 404, request);
  if (!team) return jsonError("Team not found.", 404, request);

  if (competition.type === "SCHOOL" && competition.schoolId && team.schoolId && competition.schoolId !== team.schoolId) {
    return jsonError("School competitions can only include teams from that school.", 400, request);
  }

  const entry = await prisma.competitionTeam.upsert({
    where: { competitionId_teamId: { competitionId, teamId } },
    create: { competitionId, teamId },
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
  const teamId = body?.teamId;

  if (!competitionId || !teamId) {
    return jsonError("Competition and team are required.", 400, request);
  }

  const entry = await prisma.competitionTeam.findUnique({
    where: { competitionId_teamId: { competitionId, teamId } }
  });
  if (!entry) return jsonError("Team is not linked to this competition.", 404, request);

  await prisma.competitionTeam.delete({
    where: { competitionId_teamId: { competitionId, teamId } }
  });

  return jsonData({ ok: true }, request);
}
