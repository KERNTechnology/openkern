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
    // We allow the API Gateway domain as a trusted forwarded host.
    // SERVER_URL contains the CloudFront URL, API_GATEWAY_HOST is set by the installer.
    serverActions: {
      allowedForwardedHosts: (process.env.ALLOWED_FORWARDED_HOSTS || "").split(",").filter(Boolean),
    },
  },
};

export default withPayload(nextConfig);
