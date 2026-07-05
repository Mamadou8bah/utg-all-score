import { fetchNews } from "@/lib/services/football";
import { jsonData } from "@/lib/api-utils";

export async function GET() {
  const data = await fetchNews();
  return jsonData(data);
}
