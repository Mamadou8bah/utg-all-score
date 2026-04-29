import type { Metadata, Viewport } from "next";
import type React from "react";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { Footer, Navbar } from "@/components/ui";
import { MobileNav } from "@/components/mobile-nav";
import { PwaBoot } from "@/components/pwa-boot";
import { SplashScreen } from "@/components/splash-screen";
import { appMeta } from "@/lib/data";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Sora({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: `${appMeta.name} | ${appMeta.tagline}`,
  description: "Production-ready university sports PWA for live scores, fixtures, results, athlete stories, and announcements.",
  applicationName: appMeta.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appMeta.shortName
  },
  icons: {
    icon: "https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png",
    apple: "https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0055A4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <SplashScreen />
        <div className="flex flex-col min-h-[var(--app-height)] bg-background">
          <Navbar />
          <main className="flex-1 mobile-safe-bottom w-full overflow-x-hidden pt-2">{children}</main>
          <MobileNav />
          <PwaBoot />
        </div>
      </body>
    </html>
  );
}
