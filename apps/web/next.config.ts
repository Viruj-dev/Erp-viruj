import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/rpc/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/rpc/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
