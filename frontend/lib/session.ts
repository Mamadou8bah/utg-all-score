import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "utg_portal_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? "utg-allscore-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    schoolId: user.schoolId ?? null,
    schoolName: user.schoolName ?? null
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : payload.email,
      role: payload.role === "ADMIN" ? "ADMIN" : "AGENT",
      schoolId: typeof payload.schoolId === "string" ? payload.schoolId : null,
      schoolName: typeof payload.schoolName === "string" ? payload.schoolName : null
    };
  } catch {
    return null;
  }
}

export { SESSION_MAX_AGE };
