import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim()?.toLowerCase();
  const password = body?.password;
  const expectedRole = body?.expectedRole;

  if (!email || !password) {
    return jsonError("Email and password are required.", 400, request);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { school: true }
  });

  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("Invalid email or password.", 401, request);
  }

  if (expectedRole && user.role !== expectedRole) {
    return jsonError("This account is not authorized for this application.", 403, request);
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "AGENT",
    schoolId: user.schoolId,
    schoolName: user.school?.name ?? null
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  return jsonData(
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school?.name ?? null
      }
    },
    request
  );
}
