import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { qualifyGroupsToKnockout } from "@/lib/services/competition-engine";
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
  const advancePerGroup = Math.max(1, Math.min(2, Number(body?.advancePerGroup) || 1));
  const startDate = body?.startDate ? new Date(body.startDate) : new Date();

  const result = await qualifyGroupsToKnockout(id, advancePerGroup, { startDate });
  if (!result.qualified.length) {
    return jsonError(
      "Could not qualify teams. Ensure this is a tournament with groups and completed group standings.",
      400,
      request
    );
  }

  if (!result.updated.length && !result.created.length) {
    return jsonError("No knockout fixtures were created or updated.", 400, request);
  }

  return jsonData(
    {
      qualified: result.qualified,
      updatedCount: result.updated.length,
      createdCount: result.created.length,
      byeCount: result.byes.length
    },
    request,
    201
  );
}
