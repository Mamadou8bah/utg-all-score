import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { generateLeagueFixtures } from "@/lib/services/competition-engine";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN"], request);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const startDate = body?.startDate ? new Date(body.startDate) : new Date();

  const created = await generateLeagueFixtures(id, startDate);
  if (!created.length) {
    return jsonError("Could not generate fixtures. Ensure this is a league with at least 2 teams.", 400, request);
  }

  return jsonData({ count: created.length, matchIds: created }, request, 201);
}
