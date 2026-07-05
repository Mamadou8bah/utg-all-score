import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";
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
  const existing = await prisma.user.findUnique({ where: { id, role: "AGENT" } });
  if (!existing) return jsonError("Agent not found.", 404, request);

  const data: Record<string, unknown> = {};
  if (body?.name?.trim()) data.name = body.name.trim();
  if (body?.schoolId) data.schoolId = body.schoolId;
  if (body?.active !== undefined) data.active = !!body.active;
  if (body?.password) data.passwordHash = await hashPassword(body.password);

  const agent = await prisma.user.update({
    where: { id },
    data,
    include: { school: true }
  });

  return jsonData(
    {
      id: agent.id,
      email: agent.email,
      name: agent.name,
      active: agent.active,
      schoolId: agent.schoolId,
      schoolName: agent.school?.name ?? null
    },
    request
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.user.findUnique({ where: { id, role: "AGENT" } });
  if (!existing) return jsonError("Agent not found.", 404, request);

  await prisma.user.delete({ where: { id } });
  return jsonData({ ok: true }, request);
}
