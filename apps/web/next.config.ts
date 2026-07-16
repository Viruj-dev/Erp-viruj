import type { NextConfig } from "next";

const authUrl =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3002";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
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
    ];
  },
};

export default nextConfig;
