import { fetchAthletes } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET() {
  const data = await fetchAthletes();
  return jsonData(data);
}
