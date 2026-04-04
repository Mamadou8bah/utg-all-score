import { NextResponse } from "next/server";
import { newsItems } from "@/lib/data";

export function GET() {
  return NextResponse.json({ data: newsItems });
}
