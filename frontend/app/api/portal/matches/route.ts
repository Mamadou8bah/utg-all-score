import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, requireUser } from "@/lib/api-utils";
import { matchIncludePortalList, serializeMatch } from "@/lib/services/football";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const where =
    session!.role === "AGENT"
      ? {
          OR: [
            { agents: { some: { userId: session!.id } } },
            { competition: { agents: { some: { userId: session!.id } } } }
          ]
        }
      : {};

  const matches = await prisma.match.findMany({
    where,
    include: matchIncludePortalList,
    orderBy: { kickoff: "desc" },
    take: 50
  });

  return jsonData(matches.map((m) => serializeMatch(m)!), request);
}
