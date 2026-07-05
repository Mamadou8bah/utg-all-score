import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/auth-guard";
import { PwaBoot } from "@/components/pwa-boot";
import { APP_ICON, PWA_THEME_COLOR } from "@/lib/branding";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Sora({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "UTG AllScore Admin",
  description: "UTGSU football administration — teams, competitions, and school agents.",
  applicationName: "UTG AllScore Admin",
  icons: {
    icon: APP_ICON,
    apple: APP_ICON
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AllScore Admin"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: PWA_THEME_COLOR
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${headingFont.variable}`} suppressHydrationWarning>
        <AuthGuard>{children}</AuthGuard>
        <PwaBoot />
      </body>
    </html>
  );
}
