import { fetchAnnouncements } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET() {
  const data = await fetchAnnouncements();
  return jsonData(data);
}
