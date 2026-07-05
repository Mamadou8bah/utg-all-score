import { fetchCompetitions, fetchCompetitionGroups, fetchAllKnockoutBrackets, fetchCompetitionStats } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET() {
  const [competitions, groups, brackets, stats] = await Promise.all([
    fetchCompetitions(),
    fetchCompetitionGroups(),
    fetchAllKnockoutBrackets(),
    fetchCompetitionStats()
  ]);
  return jsonData({ competitions, groups, brackets, stats });
}
