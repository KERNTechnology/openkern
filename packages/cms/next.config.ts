import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },
  experimental: {
    // CloudFront → API Gateway → Lambda: API Gateway sets x-forwarded-host
    // to its own domain, but the browser sends origin as the CloudFront domain.
    // Allow both as trusted origins for Server Actions.
    serverActions: {
      allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
    },
  },
};

export default withPayload(nextConfig);
