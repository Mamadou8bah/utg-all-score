"use client";

import { Navbar } from "@/components/ui";
import { MobileNav } from "@/components/mobile-nav";
import { PwaBoot } from "@/components/pwa-boot";
import { SplashScreen } from "@/components/splash-screen";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      <div className="flex flex-col min-h-[var(--app-height)] bg-background">
        <Navbar />
        <main className="flex-1 mobile-safe-bottom w-full overflow-x-hidden pt-2">{children}</main>
        <MobileNav />
        <PwaBoot />
      </div>
    </>
  );
}
