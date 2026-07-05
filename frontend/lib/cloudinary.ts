import crypto from "crypto";

const FOLDER = "utg-allscore/logos";

export function isCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

  if (cloudName && uploadPreset) return true;

  return Boolean(
    cloudName && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function formatCloudinaryError(message: string) {
  if (message.includes("missing permissions") || message.includes('actions=["create"]')) {
    return (
      "Cloudinary rejected the upload: API key lacks upload permission. " +
      "Fix in Cloudinary Console → Settings → API Keys → assign a role with Upload access, " +
      "or add CLOUDINARY_UPLOAD_PRESET (unsigned preset) on the API project and redeploy."
    );
  }
  return message;
}

export async function uploadImage(buffer: Buffer, filename: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(buffer)]), filename);

  if (uploadPreset) {
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", FOLDER);
  } else {
    const apiKey = process.env.CLOUDINARY_API_KEY!.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET!.trim();
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${FOLDER}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", FOLDER);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const json = await res.json();
  if (!res.ok) {
    const message = json.error?.message || "Cloudinary upload failed";
    throw new Error(formatCloudinaryError(message));
  }

  return json.secure_url as string;
}
