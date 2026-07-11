import type { NextConfig } from "next";

const DEFAULT_BACKEND_URL = "https://backend-lynue-18847472647.us-central1.run.app";

const backendUrl = (() => {
  const explicitBackend = process.env.API_URL?.trim();
  if (explicitBackend) {
    return explicitBackend.replace(/\/+$/, "");
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const publicAppUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (publicApiUrl && /^https?:\/\//i.test(publicApiUrl)) {
    return publicApiUrl.replace(/\/+$/, "");
  }

  if (publicApiUrl && publicApiUrl.startsWith("/")) {
    const baseUrl = publicAppUrl || "https://lynue.com";
    return `${baseUrl.replace(/\/+$/, "")}${publicApiUrl}`;
  }

  return DEFAULT_BACKEND_URL;
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
