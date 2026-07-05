import { prisma } from "@/lib/db";
import { ensureDefaultAdmin, DEFAULT_ADMIN_EMAIL } from "@/lib/bootstrap-admin";
import { jsonData, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

function authorizeSetup(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return jsonError("Unauthorized", 401, request);
  }
  return null;
}

export async function POST(request: Request) {
  const denied = authorizeSetup(request);
  if (denied) return denied;

  const admin = await ensureDefaultAdmin(prisma);
  return jsonData(
    {
      message: "Default admin ensured",
      email: DEFAULT_ADMIN_EMAIL,
      adminId: admin.id
    },
    request,
    201
  );
}
