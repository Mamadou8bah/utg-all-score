import type { MetadataRoute } from "next";
import { PWA_BACKGROUND, PWA_THEME_COLOR } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UTG AllScore Agent",
    short_name: "AllScore Agent",
    description: "School agent app for updating football scores, lineups, and news.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: PWA_BACKGROUND,
    theme_color: PWA_THEME_COLOR,
    orientation: "any",
    categories: ["sports", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
