import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://backend:8000";

const nextConfig: NextConfig = {
  reactCompiler: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [{ source: "/api/:path*/", destination: `${API_URL}/api/:path*/` }];
  },
};

export default nextConfig;
