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
  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) return jsonError("School not found.", 404, request);

  const name = body?.name?.trim() ?? existing.name;
  if (name !== existing.name) {
    const clash = await prisma.school.findUnique({ where: { name } });
    if (clash) return jsonError("A school with this name already exists.", 400, request);
  }

  const school = await prisma.school.update({
    where: { id },
    data: {
      name,
      shortName: body?.shortName?.trim() ?? existing.shortName
    }
  });

  return jsonData(school, request);
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) return jsonError("School not found.", 404, request);

  const linked = await prisma.team.count({ where: { schoolId: id } });
  const agents = await prisma.user.count({ where: { schoolId: id } });
  if (linked || agents) {
    return jsonError("Cannot delete a school with linked teams or agents.", 400, request);
  }

  await prisma.school.delete({ where: { id } });
  return jsonData({ ok: true }, request);
}
