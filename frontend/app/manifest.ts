import type { MetadataRoute } from "next";

const APP_ICON =
  "https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UTG AllScore",
    short_name: "AllScore",
    description: "The Official Hub for University Sports Updates",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5F7FA",
    theme_color: "#0055A4",
    orientation: "any",
    categories: ["sports", "news"],
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: APP_ICON, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: APP_ICON, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
