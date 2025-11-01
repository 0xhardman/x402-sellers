import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Make CDP API credentials available in Edge Runtime
    serverComponentsExternalPackages: ["@coinbase/cdp-sdk"],
  },
  env: {
    CDP_API_KEY_ID: process.env.CDP_API_KEY_ID,
    CDP_API_KEY_SECRET: process.env.CDP_API_KEY_SECRET,
  },
};

export default nextConfig;
