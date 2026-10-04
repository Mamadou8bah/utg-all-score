import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UTG AllScore",
    short_name: "AllScore",
    description: "The Official Hub for University Sports Updates",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f0f0f0",
    theme_color: "#0c1c8c",
    orientation: "any",
    categories: ["sports", "news"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
