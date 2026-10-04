import { prisma } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/api-utils";
import { matchIncludeList, serializeMatch } from "@/lib/services/football";
import { emptySearchResults, type SearchResults } from "@/lib/search-types";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return jsonData(emptySearchResults, request);
  if (query.length > 80) return jsonError("Search must be 80 characters or fewer.", 400, request);
  const contains = { contains: query, mode: "insensitive" as const };
  try {
    const [teams, players, competitions, matches, news] = await Promise.all([
      prisma.team.findMany({ where: { OR: [{ name: contains }, { school: { name: contains } }] }, select: { id: true, name: true, logo: true, school: { select: { name: true } } }, orderBy: { name: "asc" }, take: 10 }),
      prisma.player.findMany({ where: { name: contains }, select: { id: true, name: true, number: true, team: { select: { name: true } } }, orderBy: { name: "asc" }, take: 10 }),
      prisma.competition.findMany({ where: { name: contains }, include: { school: { select: { name: true } } }, orderBy: { name: "asc" }, take: 10 }),
      prisma.match.findMany({ where: { OR: [{ homeTeam: { name: contains } }, { awayTeam: { name: contains } }, { competition: { name: contains } }, { venue: contains }] }, include: matchIncludeList, orderBy: { kickoff: "desc" }, take: 10 }),
      prisma.newsArticle.findMany({ where: { published: true, OR: [{ title: contains }, { excerpt: contains }] }, select: { id: true, title: true, excerpt: true, category: true, image: true, publishedAt: true, body: true }, orderBy: { publishedAt: "desc" }, take: 10 })
    ]);
    const data: SearchResults = {
      teams: teams.map((team) => ({ ...team, school: team.school?.name ?? null })),
      players: players.map((player) => ({ ...player, team: player.team.name })),
      competitions: competitions.map((item) => ({ id: item.slug, name: item.name, type: item.type as "GENERAL" | "SCHOOL", format: item.format as "LEAGUE" | "TOURNAMENT", description: item.description, logo: item.logo ?? undefined, schoolName: item.school?.name })),
      matches: matches.map((match) => serializeMatch(match)!),
      news: news.map((item) => ({ ...item, image: item.image ?? "", body: item.body ?? undefined, publishedAt: item.publishedAt.toISOString() }))
    };
    return jsonData(data, request);
  } catch {
    return jsonError("Search is unavailable. Please try again.", 503, request);
  }
}
