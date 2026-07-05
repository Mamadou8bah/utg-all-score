import { apiUrl, resolveApiUrl, resolvePublicSiteUrl } from "@/lib/api-url";

export const API_URL = resolveApiUrl();
export const PUBLIC_SITE_URL = resolvePublicSiteUrl();const TOKEN_KEY = "utg_admin_token";

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

  return fetch(apiUrl(path, API_URL), { ...init, headers });}

export async function apiJson<T>(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data as T;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch("/api/portal/admin/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.data.url as string;
}
