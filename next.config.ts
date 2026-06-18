import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Docker; default output for Vercel
  output: process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        ],
      },
    ];
  },
};

export default nextConfig;
