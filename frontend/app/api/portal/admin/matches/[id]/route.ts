import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";
import { processMatchDeleted } from "@/lib/services/competition-engine";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.match.findUnique({ where: { id } });
  if (!existing) return jsonError("Match not found.", 404, request);

  await prisma.match.delete({ where: { id } });
  await processMatchDeleted(existing.competitionId, existing.homeTeamId, existing.awayTeamId);

  return jsonData({ ok: true }, request);
}
