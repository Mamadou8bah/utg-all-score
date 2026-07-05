import { fetchMatchesByStatus } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET() {
  const data = await fetchMatchesByStatus("LIVE");
  return jsonData(data);
}
