import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { assetsBucket, mediaBucket, oai } from "./storage";
import { apiUrl } from "./compute";

const config = new pulumi.Config("openkern");
const projectName = config.require("projectName");

// Subdomain under openkern.org (optional — requires wildcard cert in the same AWS account).
// If not set, the site runs on the default CloudFront domain (xyz.cloudfront.net).
const subdomain = config.get("subdomain") || ""; // e.g. "a7f3x"
const siteHost = subdomain ? `${subdomain}.openkern.org` : "";

// Wildcard ACM cert for *.openkern.org (us-east-1).
// Required if subdomain is set. Must exist in the SAME AWS account as this stack.
const wildcardCertArn = config.get("wildcardCertArn") || "";

// Optional custom domain (paid add-on) — customer creates their own ACM cert in us-east-1.
const customDomain = config.get("customDomain") || "";
const customCertArn = config.get("customCertArn") || "";

// Build aliases list: only include domains that have a matching cert
const aliases: string[] = [];
if (siteHost && wildcardCertArn) aliases.push(siteHost);
if (customDomain && customCertArn) aliases.push(customDomain);
const certArn = customCertArn || wildcardCertArn || "";

const tags = {
  Project: "openkern",
  Site: projectName,
  ManagedBy: "pulumi",
};

// Extract API Gateway hostname from URL (strip protocol and trailing slash)
const apiOriginDomain = apiUrl.apply((url) => {
  const parsed = new URL(url);
  return parsed.hostname;
});

// CloudFront distribution
export const distribution = new aws.cloudfront.Distribution(
  `${projectName}-cdn`,
  {
    enabled: true,
    isIpv6Enabled: true,
    comment: `OpenKERN: ${projectName}`,
    defaultRootObject: "",
    priceClass: "PriceClass_100", // US + Europe (cheapest)

    // Aliases: only set when a matching cert is available in this account.
    aliases: aliases.length > 0 ? aliases : undefined,

    // Default behavior — routes to API Gateway (Payload + Next.js SSR)
    defaultCacheBehavior: {
      targetOriginId: "api",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: [
        "GET",
        "HEAD",
        "OPTIONS",
        "PUT",
        "POST",
        "PATCH",
        "DELETE",
      ],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // CachingDisabled
      originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac", // AllViewerExceptHostHeader
    },

    // Static assets and media from S3
    orderedCacheBehaviors: [
      {
        pathPattern: "/_next/static/*",
        targetOriginId: "assets",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // CachingOptimized
      },
      {
        pathPattern: "/_next/image",
        targetOriginId: "api",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // CachingOptimized
        originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac", // AllViewerExceptHostHeader
      },
      {
        pathPattern: "/media/*",
        targetOriginId: "media",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // CachingOptimized
      },
    ],

    // Origins
    origins: [
      {
        originId: "api",
        domainName: apiOriginDomain,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"],
        },
      },
      {
        originId: "assets",
        domainName: assetsBucket.bucketRegionalDomainName,
        s3OriginConfig: {
          originAccessIdentity: oai.cloudfrontAccessIdentityPath,
        },
      },
      {
        originId: "media",
        domainName: mediaBucket.bucketRegionalDomainName,
        s3OriginConfig: {
          originAccessIdentity: oai.cloudfrontAccessIdentityPath,
        },
      },
    ],

    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },

    // Use custom/wildcard cert if available, otherwise CloudFront default cert.
    viewerCertificate: certArn
      ? {
          acmCertificateArn: certArn,
          sslSupportMethod: "sni-only",
          minimumProtocolVersion: "TLSv1.2_2021",
        }
      : {
          cloudfrontDefaultCertificate: true,
        },

    tags: { ...tags, Name: `${projectName}-cdn` },
  },
);

export const distributionId = distribution.id;
export const distributionDomain = distribution.domainName;
export const siteUrl = siteHost
  ? pulumi.interpolate`https://${siteHost}`
  : pulumi.interpolate`https://${distribution.domainName}`;
export const customSiteUrl = customDomain
  ? pulumi.interpolate`https://${customDomain}`
  : pulumi.output("");
