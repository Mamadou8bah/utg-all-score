import {
  fetchCompetitions,
  fetchCompetitionGroups,
  fetchAllKnockoutBrackets,
  fetchCompetitionStats
} from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET(request: Request) {
  const include = new URL(request.url).searchParams.get("include") ?? "";
  const parts = new Set(
    include
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)
  );
  const wantsAll = parts.has("all");
  const wantsGroups = wantsAll || parts.has("groups");
  const wantsBrackets = wantsAll || parts.has("brackets");
  const wantsStats = wantsAll || parts.has("stats");

  const competitions = await fetchCompetitions();
  const [groups, brackets, stats] = await Promise.all([
    wantsGroups ? fetchCompetitionGroups() : Promise.resolve({}),
    wantsBrackets ? fetchAllKnockoutBrackets() : Promise.resolve({}),
    wantsStats ? fetchCompetitionStats() : Promise.resolve({})
  ]);

  return jsonData({ competitions, groups, brackets, stats });
}
