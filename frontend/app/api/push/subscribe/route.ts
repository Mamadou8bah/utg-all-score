import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Subscription placeholder recorded. Wire this route to your push provider or VAPID flow."
  });
}
