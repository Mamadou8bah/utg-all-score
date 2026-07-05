import { getSessionUser } from "@/lib/auth";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import { handleCorsPreflight } from "@/lib/cors";
import { jsonData, jsonError, requireUser } from "@/lib/api-utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  const denied = requireUser(session, ["ADMIN", "AGENT"], request);
  if (denied) return denied;

  if (!isCloudinaryConfigured()) {
    return jsonError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      503,
      request
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof Blob)) {
    return jsonError("No image file provided.", 400, request);
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return jsonError("Only JPEG, PNG, WebP, GIF, or SVG images are allowed.", 400, request);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return jsonError("Image must be under 5 MB.", 400, request);
  }

  const filename = file instanceof File ? file.name : "logo.png";

  try {
    const url = await uploadImage(buffer, filename);
    return jsonData({ url }, request, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return jsonError(message, 500, request);
  }
}
