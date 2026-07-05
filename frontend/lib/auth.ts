import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/types";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, verifySessionToken } from "@/lib/session";

export { SESSION_COOKIE, createSessionToken, verifySessionToken };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function resolveSessionUser(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { school: true }
  });

  if (!user || !user.active) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "AGENT",
    schoolId: user.schoolId,
    schoolName: user.school?.name ?? null
  };
}

export async function getSessionUser(request?: Request): Promise<SessionUser | null> {
  let token: string | undefined;

  if (request) {
    const auth = request.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      token = auth.slice(7);
    }
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE)?.value;
  }

  return resolveSessionUser(token);
}

export async function requireSession(roles?: Array<"ADMIN" | "AGENT">, request?: Request) {
  const user = await getSessionUser(request);
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return user;
}
