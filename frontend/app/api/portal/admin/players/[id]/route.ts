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
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) return jsonError("Player not found.", 404, request);

  const player = await prisma.player.update({
    where: { id },
    data: {
      name: body?.name?.trim() ?? existing.name,
      number: body?.number !== undefined ? Number(body.number) : existing.number,
      role: body?.role?.trim() ?? existing.role,
      position: body?.position !== undefined ? body.position || null : existing.position,
      goals: body?.goals !== undefined ? Number(body.goals) : existing.goals,
      assists: body?.assists !== undefined ? Number(body.assists) : existing.assists
    }
  });

  return jsonData(player, request);
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) return jsonError("Player not found.", 404, request);

  await prisma.player.delete({ where: { id } });
  return jsonData({ ok: true }, request);
}
