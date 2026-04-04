import { type NextRequest, NextResponse } from "next/server";
import { results } from "@/lib/data";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId");

  if (competitionId) {
    const filteredResults = results.filter(r => r.competitionId === competitionId);
    return NextResponse.json({ data: filteredResults });
  }

  return NextResponse.json({ data: results });
}
