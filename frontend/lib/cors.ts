const DEFAULT_ORIGINS = ["http://localhost:3001", "http://localhost:3002"];

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getAllowedOrigins() {
  const fromNamed = [process.env.ADMIN_APP_URL, process.env.AGENT_APP_URL].filter(Boolean) as string[];
  const fromList = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...fromNamed, ...fromList].map(normalizeOrigin))];
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const normalized = origin ? normalizeOrigin(origin) : null;
  if (normalized && getAllowedOrigins().includes(normalized)) {
    return {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };
  }
  return {};
}

export function handleCorsPreflight(request: Request) {
  if (request.method !== "OPTIONS") return null;
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}
