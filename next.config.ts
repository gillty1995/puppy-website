import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "d34kcq2fej5twn.cloudfront.net",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "textilepoms-uploads.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;