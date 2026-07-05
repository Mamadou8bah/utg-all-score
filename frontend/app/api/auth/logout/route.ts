import { clearSessionCookie } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  await clearSessionCookie();
  return jsonData({ ok: true }, request);
}
