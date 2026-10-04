import assert from "node:assert/strict";
import { prisma } from "../lib/db";
import { GET } from "../app/api/search/route";

async function main() {
  const queries: Record<string, any> = {};
  const date = new Date("2026-10-04T15:00:00Z");
  const records: Record<string, unknown[]> = {
    team: [{ id: "team", name: "ICT", logo: null, school: { name: "ICT School" } }],
    player: [{ id: "player", name: "ICT Player", number: 9, team: { name: "ICT" } }],
    competition: [{ id: "private-db-id", slug: "university", name: "University League", type: "GENERAL", format: "LEAGUE", description: "Football", logo: null, school: null }],
    match: [{ id: "match", competition: { slug: "university", name: "University League" }, homeTeamId: "home", awayTeamId: "away", homeTeam: { id: "home", name: "ICT" }, awayTeam: { id: "away", name: "Business" }, homeScore: 2, awayScore: 1, venue: "UTG", kickoff: date, status: "LIVE", stage: "LEAGUE", events: [], lineups: [] }],
    newsArticle: [{ id: "news", title: "ICT wins", excerpt: "Match report", body: null, category: "Football", image: null, publishedAt: date }]
  };
  for (const key of Object.keys(records)) {
    Object.defineProperty((prisma as any)[key], "findMany", { configurable: true, value: async (query: unknown) => { queries[key] = query; return records[key]; } });
  }
  const request = (q: string) => new Request(`http://localhost/api/search?q=${encodeURIComponent(q)}`);
  assert.equal((await GET(request(" "))).status, 200);
  assert.deepEqual(Object.keys(queries), [], "empty searches must not query the database");
  assert.equal((await GET(request("x".repeat(81)))).status, 400);
  assert.deepEqual(Object.keys(queries), [], "oversized searches must not query the database");
  const response = await GET(request("  ICT  "));
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data.teams[0].school, "ICT School");
  assert.equal(data.players[0].team, "ICT");
  assert.equal(data.competitions[0].id, "university", "details need the public competition slug");
  assert.equal(data.matches[0].home, "ICT");
  assert.equal(data.matches[0].kickoff, date.toISOString());
  assert.equal(data.news[0].publishedAt, date.toISOString());
  assert.equal(queries.newsArticle.where.published, true, "unpublished news must stay private");
  assert.equal(queries.team.where.OR[0].name.contains, "ICT");
  assert.equal(queries.team.where.OR[0].name.mode, "insensitive");
  for (const query of Object.values(queries)) assert.equal(query.take, 10, "every category must be bounded");
  Object.defineProperty(prisma.team, "findMany", { configurable: true, value: async () => { throw new Error("private connection details"); } });
  const failed = await GET(request("ICT"));
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).error, "Search is unavailable. Please try again.");
  console.log("Search: input limits, category mapping, query bounds, published news, and safe errors passed.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
