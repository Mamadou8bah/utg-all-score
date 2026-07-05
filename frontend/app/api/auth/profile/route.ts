import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return jsonError("Not authenticated.", 401, request);

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return jsonError("Name is required.", 400, request);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name },
    include: { school: true }
  });

  return jsonData(
    {
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        schoolId: updated.schoolId,
        schoolName: updated.school?.name ?? null
      }
    },
    request
  );
}
