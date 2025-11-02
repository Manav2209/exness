import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // ✅ disables domain restrictions & optimization
  },
};

export default nextConfig;
