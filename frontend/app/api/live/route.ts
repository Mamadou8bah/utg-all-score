import { NextResponse } from "next/server";
import { liveMatches } from "@/lib/data";

export function GET() {
  return NextResponse.json({ data: liveMatches });
}
