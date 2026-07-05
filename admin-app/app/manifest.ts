import type { MetadataRoute } from "next";
import { APP_ICON, PWA_BACKGROUND, PWA_THEME_COLOR } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UTG AllScore Admin",
    short_name: "AllScore Admin",
    description: "Football administration — teams, competitions, and school agents.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: PWA_BACKGROUND,
    theme_color: PWA_THEME_COLOR,
    orientation: "any",
    categories: ["sports", "productivity"],
    icons: [
      { src: APP_ICON, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: APP_ICON, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: APP_ICON, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
