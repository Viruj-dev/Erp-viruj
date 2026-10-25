import type { NextConfig } from "next";
import path from "node:path";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3002";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(import.meta.dirname, "../..") },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "admin\\.virujhealth\\.com" }],
          destination: "/review-admin",
        },
      ],
      afterFiles: [
        {
          source: "/events/:path*",
          destination: `${apiUrl.replace(/\/$/, "")}/events/:path*`,
        },
        {
          source: "/auth/:path*",
          destination: `${authUrl.replace(/\/$/, "")}/auth/:path*`,
        },
        {
          source: "/erp/:path*",
          destination: `${apiUrl.replace(/\/$/, "")}/api/erp/:path*`,
        },
        {
          source: "/common/:path*",
          destination: `${apiUrl.replace(/\/$/, "")}/api/common/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
