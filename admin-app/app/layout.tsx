import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/auth-guard";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Sora({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "UTG AllScore Admin",
  description: "UTGSU football administration — teams, competitions, and school agents.",
  icons: {
    icon: "https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png"
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
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0055A4"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${headingFont.variable}`} suppressHydrationWarning>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
