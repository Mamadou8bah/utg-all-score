"use client";
import { useEffect } from "react";
import { applyTheme, readSettings } from "@/lib/device-settings";
export function DevicePreferences() {
  useEffect(() => {
    const apply = () => applyTheme(readSettings().theme);
    const media = matchMedia("(prefers-color-scheme: dark)");
    apply();
    window.addEventListener("storage", apply);
    window.addEventListener("utg-settings-change", apply);
    media.addEventListener("change", apply);
    return () => { window.removeEventListener("storage", apply); window.removeEventListener("utg-settings-change", apply); media.removeEventListener("change", apply); };
  }, []);
  return null;
}
