import type { NextConfig } from "next";

const backendUrl = (() => {
  const explicitBackend = process.env.API_URL?.trim();
  if (explicitBackend) {
    return explicitBackend.replace(/\/+$/, "");
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApiUrl && /^https?:\/\//i.test(publicApiUrl)) {
    return publicApiUrl.replace(/\/+$/, "");
  }

  throw new Error("API_URL or NEXT_PUBLIC_API_URL must be provided. Set it in environment variables or Cloud Run secrets.");
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
