import type { NextConfig } from "next";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || serverUrl;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${authUrl.replace(/\/$/, "")}/auth/:path*`,
      },
      {
        source: "/erp/:path*",
        destination: `${serverUrl.replace(/\/$/, "")}/erp/:path*`,
      },
    ];
  },
};

export default nextConfig;
