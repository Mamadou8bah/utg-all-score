import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/cors";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const headers = corsHeaders(origin);
  const allowed = Boolean(headers["Access-Control-Allow-Origin"]);

  if (isApi && request.method === "OPTIONS" && allowed) {
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  if (isApi && allowed) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*"]
};
