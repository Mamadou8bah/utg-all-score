export const SETTINGS_KEY = "utg-device-settings";
export const SETTINGS_CACHE = "utg-device-preferences";
export const ALERT_DEFAULTS = { matchStart: true, goals: true, halfTime: true, fullTime: true, lineups: true, breakingNews: true, announcements: true };
export type AlertKey = keyof typeof ALERT_DEFAULTS;
export type DeviceSettings = { theme: "light" | "dark" | "system"; alerts: typeof ALERT_DEFAULTS; language: "en" | "fr" };
export const DEFAULT_SETTINGS: DeviceSettings = { theme: "light", alerts: ALERT_DEFAULTS, language: "en" };
export function readSettings(): DeviceSettings {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { theme: ["light", "dark", "system"].includes(value?.theme) ? value.theme : "light", language: value?.language === "fr" ? "fr" : "en", alerts: Object.fromEntries(Object.entries(ALERT_DEFAULTS).map(([key, fallback]) => [key, typeof value?.alerts?.[key] === "boolean" ? value.alerts[key] : fallback])) as typeof ALERT_DEFAULTS };
  } catch { return DEFAULT_SETTINGS; }
}
export function applyTheme(theme: DeviceSettings["theme"]) {
  document.documentElement.classList.toggle("dark-theme", theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches));
}
export async function saveSettings(settings: DeviceSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyTheme(settings.theme);
  window.dispatchEvent(new Event("utg-settings-change"));
  if ("caches" in window) {
    const cache = await caches.open(SETTINGS_CACHE);
    await cache.put("/device-alert-preferences", new Response(JSON.stringify(settings.alerts), { headers: { "Content-Type": "application/json" } }));
  }
}
