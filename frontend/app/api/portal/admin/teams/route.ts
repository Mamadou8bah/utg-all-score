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

  const teams = await prisma.team.findMany({
    include: { school: true, _count: { select: { players: true } } },
    orderBy: { name: "asc" }
  });

  return jsonData(
    teams.map((team) => ({
      id: team.id,
      name: team.name,
      schoolId: team.schoolId,
      schoolName: team.school?.name ?? null,
      colors: JSON.parse(team.colors),
      tone: team.tone,
      logo: team.logo,
      playerCount: team._count.players
    })),
    request
  );
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const schoolId = body?.schoolId || null;
  const colors = Array.isArray(body?.colors) ? body.colors : ["#0055A4", "#FFFFFF"];
  const tone = body?.tone?.trim() || `Football squad representing ${name}.`;
  const logo = body?.logo?.trim() || null;

  if (!name) return jsonError("Team name is required.", 400, request);

  const existing = await prisma.team.findUnique({ where: { name } });
  if (existing) return jsonError("A team with this name already exists.", 400, request);

  const team = await prisma.team.create({
    data: {
      name,
      schoolId,
      colors: JSON.stringify(colors),
      form: JSON.stringify(["D", "D", "D", "D", "D"]),
      tone,
      logo
    },
    include: { school: true }
  });

  return jsonData(
    {
      id: team.id,
      name: team.name,
      schoolId: team.schoolId,
      schoolName: team.school?.name ?? null,
      logo: team.logo
    },
    request,
    201
  );
}
