import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return jsonError("Team not found.", 404, request);

  const players = await prisma.player.findMany({
    where: { teamId: id },
    orderBy: [{ number: "asc" }]
  });

  return jsonData(players, request);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id: teamId } = await context.params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return jsonError("Team not found.", 404, request);

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const number = Number(body?.number);
  const role = body?.role?.trim() || "MF";
  const position = body?.position?.trim() || null;

  if (!name || !number) return jsonError("Player name and number are required.", 400, request);

  const player = await prisma.player.create({
    data: { teamId, name, number, role, position, goals: 0, assists: 0 }
  });

  return jsonData(player, request, 201);
}
