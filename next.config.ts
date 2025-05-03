import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,  // skip all Next.js image optimization
  },
};

export default nextConfig;
