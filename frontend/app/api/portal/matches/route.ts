import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleCorsPreflight } from "@/lib/cors";
import { serializeMatch } from "@/lib/services/football";
import { jsonData, requireUser } from "@/lib/api-utils";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  const where =
    session!.role === "AGENT" && session!.schoolId
      ? {
          OR: [
            { homeTeam: { schoolId: session!.schoolId } },
            { awayTeam: { schoolId: session!.schoolId } }
          ]
        }
      : {};

  const matches = await prisma.match.findMany({
    where,
    include: {
      competition: { include: { school: true } },
      homeTeam: true,
      awayTeam: true,
      events: { orderBy: { minute: "asc" } },
      lineups: true
    },
    orderBy: { kickoff: "desc" },
    take: 50
  });

  return jsonData(matches.map((m) => serializeMatch(m)!), request);
}
