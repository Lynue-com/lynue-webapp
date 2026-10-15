import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vamlar",
    short_name: "Vamlar",
    description: "Backend-first real estate discovery platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fa",
    theme_color: "#1f7a8c",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
