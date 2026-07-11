import type { NextConfig } from "next";

const backendUrl = (() => {
  const explicitBackend = process.env.API_URL?.trim();
  if (explicitBackend) {
    return explicitBackend.replace(/\/+$/, "");
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApiUrl) {
    if (/^https?:\/\//i.test(publicApiUrl)) {
      return publicApiUrl.replace(/\/+$/, "");
    }

    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (frontendUrl && /^https?:\/\//i.test(frontendUrl)) {
      return `${frontendUrl.replace(/\/+$/, "")}${publicApiUrl.startsWith("/") ? publicApiUrl : `/${publicApiUrl}`}`;
    }
  }

  throw new Error("API_URL or an absolute NEXT_PUBLIC_API_URL must be provided.");
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
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
