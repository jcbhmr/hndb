import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["orange-potato-4vp4g77vv762jq6-3000.app.github.dev",
        'localhost:3000']
    }
  }
};

export default nextConfig;
