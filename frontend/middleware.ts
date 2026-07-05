import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders, getAllowedOrigins } from "@/lib/cors";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const allowed = origin && getAllowedOrigins().includes(origin);

  if (isApi && request.method === "OPTIONS" && allowed) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = NextResponse.next();
  if (isApi && allowed) {
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*"]
};
