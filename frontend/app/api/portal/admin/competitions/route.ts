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

  const competitions = await prisma.competition.findMany({
    include: {
      school: true,
      _count: { select: { matches: true, teamEntries: true, groups: true, agents: true } }
    },
    orderBy: { name: "asc" }
  });

  return jsonData(
    competitions.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      type: c.type,
      format: c.format,
      description: c.description,
      logo: c.logo,
      schoolId: c.schoolId,
      schoolName: c.school?.name ?? null,
      matchCount: c._count.matches,
      teamCount: c._count.teamEntries,
      groupCount: c._count.groups,
      agentCount: c._count.agents
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
  const slug = body?.slug?.trim()?.toLowerCase().replace(/\s+/g, "-");
  const type = body?.type;
  const format = body?.format;
  const description = body?.description?.trim();
  const schoolId = body?.schoolId || null;
  const logo = body?.logo?.trim() || null;

  if (!name || !slug || !type || !format || !description) {
    return jsonError("Name, slug, type, format, and description are required.", 400, request);
  }

  if (type === "SCHOOL" && !schoolId) {
    return jsonError("School competitions require a school.", 400, request);
  }

  const competition = await prisma.competition.create({
    data: { name, slug, type, format, description, schoolId, logo }
  });

  return jsonData(competition, request, 201);
}
