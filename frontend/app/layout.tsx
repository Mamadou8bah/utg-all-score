import type { Metadata, Viewport } from "next";
import type React from "react";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { appMeta } from "@/lib/data";

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: `${appMeta.name} | ${appMeta.tagline}`,
  description: "Official football hub for live scores, fixtures, results, and campus sports news.",
  applicationName: appMeta.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appMeta.shortName
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
