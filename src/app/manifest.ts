import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lynue",
    short_name: "Lynue",
    description: "Backend-first real estate discovery platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fa",
    theme_color: "#1f7a8c",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
