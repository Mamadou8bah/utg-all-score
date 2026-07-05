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
  const existing = await prisma.competition.findUnique({ where: { id } });
  if (!existing) return jsonError("Competition not found.", 404, request);

  const slug = body?.slug?.trim()?.toLowerCase().replace(/\s+/g, "-") ?? existing.slug;
  if (slug !== existing.slug) {
    const clash = await prisma.competition.findUnique({ where: { slug } });
    if (clash) return jsonError("A competition with this slug already exists.", 400, request);
  }

  const type = body?.type ?? existing.type;
  const schoolId =
    body?.schoolId !== undefined ? body.schoolId || null : type === "SCHOOL" ? existing.schoolId : null;

  if (type === "SCHOOL" && !schoolId) {
    return jsonError("School competitions require a school.", 400, request);
  }

  const competition = await prisma.competition.update({
    where: { id },
    data: {
      name: body?.name?.trim() ?? existing.name,
      slug,
      type,
      format: body?.format ?? existing.format,
      description: body?.description?.trim() ?? existing.description,
      logo: body?.logo !== undefined ? body.logo || null : existing.logo,
      schoolId
    }
  });

  return jsonData(competition, request);
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.competition.findUnique({ where: { id } });
  if (!existing) return jsonError("Competition not found.", 404, request);

  await prisma.competition.delete({ where: { id } });
  return jsonData({ ok: true }, request);
}
