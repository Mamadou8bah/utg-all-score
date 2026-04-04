import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UTG AllScore",
    short_name: "AllScore",
    description: "The Official Hub for University Sports Updates",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F7FA",
    theme_color: "#0055A4",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
