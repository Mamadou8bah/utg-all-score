import { NextResponse } from "next/server";
import { fixtures } from "@/lib/data";

export function GET() {
  return NextResponse.json({ data: fixtures });
}
