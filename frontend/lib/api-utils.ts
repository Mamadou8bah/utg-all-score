import { NextResponse } from "next/server";
import type { SessionUser } from "@/lib/types";
import { corsHeaders } from "@/lib/cors";

export function jsonData<T>(data: T, request?: Request, status = 200) {
  const origin = request?.headers.get("origin") ?? null;
  return NextResponse.json({ data }, { status, headers: corsHeaders(origin) });
}

export function jsonError(message: string, status = 400, request?: Request) {
  const origin = request?.headers.get("origin") ?? null;
  return NextResponse.json({ error: message }, { status, headers: corsHeaders(origin) });
}

export function unauthorized(message = "Unauthorized", request?: Request) {
  return jsonError(message, 401, request);
}

export function forbidden(message = "Forbidden", request?: Request) {
  return jsonError(message, 403, request);
}

export function requireUser(user: SessionUser | null, roles?: Array<"ADMIN" | "AGENT">, request?: Request) {
  if (!user) return unauthorized(undefined, request);
  if (roles && !roles.includes(user.role)) return forbidden(undefined, request);
  return null;
}
