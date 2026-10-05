"use client";

import { LanguageProvider } from "@/components/language-provider";
import { DevicePreferences } from "@/components/device-preferences";
import { Navbar } from "@/components/ui";
import { MobileNav } from "@/components/mobile-nav";
import { PwaBoot } from "@/components/pwa-boot";
import { SplashScreen } from "@/components/splash-screen";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DevicePreferences />
      <SplashScreen />
      <div className="app-shell">
        <Navbar />
        <main className="app-main">{children}</main>
        <MobileNav />
        <PwaBoot />
      </div>
    </LanguageProvider>
  );
}
