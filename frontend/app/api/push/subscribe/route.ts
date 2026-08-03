import { jsonData, jsonError } from "@/lib/api-utils";
import { saveSubscription, removeSubscription, isPushConfigured } from "@/lib/push";

export async function POST(request: Request) {
  if (!isPushConfigured()) {
    return jsonError("Push notifications are not configured on this server.", 503, request);
  }

  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body?.keys?.auth === "string" ? body.keys.auth : "";

  if (!endpoint || !p256dh || !auth) {
    return jsonError("Invalid push subscription payload.", 400, request);
  }

  await saveSubscription({
    endpoint,
    keys: { p256dh, auth },
    userAgent: request.headers.get("user-agent")
  });

  return jsonData({ ok: true }, request, 201);
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";

  if (!endpoint) {
    return jsonError("Subscription endpoint is required.", 400, request);
  }

  await removeSubscription(endpoint);
  return jsonData({ ok: true }, request);
}
