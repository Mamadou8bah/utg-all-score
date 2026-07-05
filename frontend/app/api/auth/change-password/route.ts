import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return jsonError("Not authenticated.", 401, request);

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword?.trim();
  const newPassword = body?.newPassword?.trim();

  if (!currentPassword || !newPassword) {
    return jsonError("Current password and new password are required.", 400, request);
  }

  if (newPassword.length < 8) {
    return jsonError("New password must be at least 8 characters.", 400, request);
  }

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record || !(await verifyPassword(currentPassword, record.passwordHash))) {
    return jsonError("Current password is incorrect.", 401, request);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) }
  });

  return jsonData({ message: "Password updated successfully." }, request);
}
