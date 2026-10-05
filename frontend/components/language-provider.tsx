"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readSettings, type DeviceSettings } from "@/lib/device-settings";
import { translateText } from "@/lib/translations";

type Language = DeviceSettings["language"];
const LanguageContext = createContext({ language: "en" as Language, locale: "en-GB", t: <T,>(text: T): T => text });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    const refresh = () => setLanguage(readSettings().language);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("utg-settings-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("utg-settings-change", refresh);
    };
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({ language, locale: language === "fr" ? "fr-FR" : "en-GB", t: <T,>(text: T): T => (typeof text === "string" ? translateText(text, language) : text) as T }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
