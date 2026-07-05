function normalizeBaseUrl(url: string) {
  let value = url.trim();

  // Fix accidental "hhttps://" or "hhttp://" typos in env vars
  value = value.replace(/^h+(?=https?:\/\/)/i, "");

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value.replace(/^\/+/, "")}`;
  }

  return value.replace(/\/+$/, "");
}

export function resolveApiUrl(raw = process.env.NEXT_PUBLIC_API_URL) {
  return normalizeBaseUrl(raw || "http://localhost:3000");
}

export function resolvePublicSiteUrl(raw = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL) {
  return normalizeBaseUrl(raw || resolveApiUrl());
}

export function apiUrl(path: string, base = resolveApiUrl()) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
