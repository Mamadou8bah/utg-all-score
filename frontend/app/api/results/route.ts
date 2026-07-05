import { fetchMatchesByStatus } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId");
  let data = await fetchMatchesByStatus("FT");

  if (competitionId) {
    data = data.filter((match) => match.competitionId === competitionId);
  }

  return jsonData(data);
}
