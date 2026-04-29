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
      { src: "https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
