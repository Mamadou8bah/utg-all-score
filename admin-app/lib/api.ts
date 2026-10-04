import { apiUrl, resolveApiUrl, resolvePublicSiteUrl } from "@/lib/api-url";

export const API_URL = resolveApiUrl();
export const PUBLIC_SITE_URL = resolvePublicSiteUrl();

const TOKEN_KEY = "utg_admin_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  clearToken();
  window.location.href = "/login";
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(apiUrl(path, API_URL), {
      ...init, cache: "no-store", headers, signal: init.signal ?? AbortSignal.timeout(isFormData ? 60000 : 30000)
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      response = Response.json({ error: "The server is unavailable. Please try again." }, { status: response.ok ? 502 : response.status });
    }
  } catch {
    response = Response.json({ error: "Unable to connect. Check your connection and try again." }, { status: 503 });
  }
  if (response.status === 401 && path !== "/api/auth/login") {
    clearToken();
    window.location.replace("/login");
  }
  return response;
}

export async function apiJson<T>(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init);
  const json = await res.json().catch(() => ({ error: "The server returned an unexpected response. Please try again." }));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data as T;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch("/api/portal/admin/upload", { method: "POST", body: formData });
  const json = await res.json().catch(() => ({ error: "The server returned an unexpected response. Please try again." }));
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.data.url as string;
}
