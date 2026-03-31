import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { assetsBucket, mediaBucket, oai } from "./storage";
import { lambdaFunctionUrl, imageLambdaUrl } from "./compute";

const config = new pulumi.Config("openkern");
const projectName = config.require("projectName");

// Every customer gets a subdomain like a7f3x.openkern.org (set by the installer).
// DNS CNAME points <subdomain>.openkern.org → xyz.cloudfront.net.
// CloudFront uses the shared *.openkern.org wildcard cert from kern-central.
const subdomain = config.require("subdomain"); // e.g. "a7f3x"
const siteHost = `${subdomain}.openkern.org`;

// Wildcard ACM cert for *.openkern.org (us-east-1) — provided by kern-central.
const wildcardCertArn = config.require("wildcardCertArn");

// Optional custom domain (paid add-on) — customer creates their own ACM cert in us-east-1.
const customDomain = config.get("customDomain") || "";
const customCertArn = config.get("customCertArn") || "";

const tags = {
  Project: "openkern",
  Site: projectName,
  ManagedBy: "pulumi",
};

// Extract Lambda function URL hostnames (strip protocol and trailing slash)
const lambdaOriginDomain = lambdaFunctionUrl.apply((url) => {
  const parsed = new URL(url);
  return parsed.hostname;
});

const imageOriginDomain = imageLambdaUrl.apply((url) => {
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

    // Aliases: always include the openkern.org subdomain; optionally add a custom domain.
    aliases: customDomain ? [siteHost, customDomain] : [siteHost],

    // Default behavior — routes to Lambda (Payload + Next.js SSR)
    defaultCacheBehavior: {
      targetOriginId: "lambda",
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

    // Static assets, image optimization, and media from S3
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
        targetOriginId: "image-optimization",
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
        originId: "lambda",
        domainName: lambdaOriginDomain,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"],
        },
      },
      {
        originId: "image-optimization",
        domainName: imageOriginDomain,
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

    // Always use the wildcard cert for *.openkern.org.
    // Custom domain: customer provides their own ACM cert — use that instead.
    viewerCertificate: {
      acmCertificateArn: customCertArn || wildcardCertArn,
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },

    tags: { ...tags, Name: `${projectName}-cdn` },
  },
);

export const distributionId = distribution.id;
export const distributionDomain = distribution.domainName;
export const siteUrl = pulumi.interpolate`https://${siteHost}`;
export const customSiteUrl = customDomain
  ? pulumi.interpolate`https://${customDomain}`
  : pulumi.output("");
