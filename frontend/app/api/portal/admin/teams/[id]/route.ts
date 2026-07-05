import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  const existing = await prisma.team.findUnique({ where: { id } });
  if (!existing) return jsonError("Team not found.", 404, request);

  const name = body?.name?.trim() ?? existing.name;
  if (name !== existing.name) {
    const clash = await prisma.team.findUnique({ where: { name } });
    if (clash) return jsonError("A team with this name already exists.", 400, request);
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      name,
      schoolId: body?.schoolId !== undefined ? body.schoolId || null : existing.schoolId,
      colors: Array.isArray(body?.colors) ? JSON.stringify(body.colors) : existing.colors,
      tone: body?.tone?.trim() ?? existing.tone,
      logo: body?.logo !== undefined ? body.logo || null : existing.logo
    },
    include: { school: true, _count: { select: { players: true } } }
  });

  return jsonData(
    {
      id: team.id,
      name: team.name,
      schoolId: team.schoolId,
      schoolName: team.school?.name ?? null,
      colors: JSON.parse(team.colors),
      tone: team.tone,
      logo: team.logo,
      playerCount: team._count.players
    },
    request
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.team.findUnique({ where: { id } });
  if (!existing) return jsonError("Team not found.", 404, request);

  const matchCount = await prisma.match.count({
    where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] }
  });
  if (matchCount > 0) {
    return jsonError("Cannot delete a team linked to matches. Remove fixtures first.", 400, request);
  }

  await prisma.team.delete({ where: { id } });
  return jsonData({ ok: true }, request);
}
