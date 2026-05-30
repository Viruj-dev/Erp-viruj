import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/auth/:path*`,
      },
      {
        source: "/erp/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/erp/:path*`,
      },
    ];
  },
};

export default nextConfig;
