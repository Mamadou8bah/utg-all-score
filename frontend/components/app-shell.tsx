"use client";

import { DevicePreferences } from "@/components/device-preferences";
import { Navbar } from "@/components/ui";
import { MobileNav } from "@/components/mobile-nav";
import { PwaBoot } from "@/components/pwa-boot";
import { SplashScreen } from "@/components/splash-screen";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DevicePreferences />
      <SplashScreen />
      <div className="app-shell">
        <Navbar />
        <main className="app-main">{children}</main>
        <MobileNav />
        <PwaBoot />
      </div>
    </>
  );
}
