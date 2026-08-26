import { fetchMatchesByStatus } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId") ?? undefined;
  const data = await fetchMatchesByStatus("FT", {
    take: 80,
    competitionSlug: competitionId || undefined
  });
  return jsonData(data);
}
