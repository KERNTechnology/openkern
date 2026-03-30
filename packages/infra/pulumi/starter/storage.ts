import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("openkern");
const projectName = config.require("projectName");

const tags = {
  Project: "openkern",
  Site: projectName,
  ManagedBy: "pulumi",
};

// S3 bucket for media uploads (images, documents via Payload S3 adapter)
export const mediaBucket = new aws.s3.BucketV2(`${projectName}-media`, {
  tags: { ...tags, Name: `${projectName}-media` },
});

new aws.s3.BucketPublicAccessBlock(`${projectName}-media-public-access`, {
  bucket: mediaBucket.id,
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
});

// S3 bucket for static assets (Next.js build output, served via CloudFront)
export const assetsBucket = new aws.s3.BucketV2(`${projectName}-assets`, {
  tags: { ...tags, Name: `${projectName}-assets` },
});

new aws.s3.BucketPublicAccessBlock(`${projectName}-assets-public-access`, {
  bucket: assetsBucket.id,
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
});

// Origin Access Identity for CloudFront to access S3
export const oai = new aws.cloudfront.OriginAccessIdentity(
  `${projectName}-oai`,
  {
    comment: `OAI for ${projectName} OpenKERN site`,
  },
);

// Allow CloudFront to read from the assets bucket
new aws.s3.BucketPolicy(`${projectName}-assets-policy`, {
  bucket: assetsBucket.id,
  policy: pulumi.all([assetsBucket.arn, oai.iamArn]).apply(([arn, iamArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: iamArn },
          Action: "s3:GetObject",
          Resource: `${arn}/*`,
        },
      ],
    }),
  ),
});

// Allow CloudFront to read from the media bucket
new aws.s3.BucketPolicy(`${projectName}-media-policy`, {
  bucket: mediaBucket.id,
  policy: pulumi.all([mediaBucket.arn, oai.iamArn]).apply(([arn, iamArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: iamArn },
          Action: "s3:GetObject",
          Resource: `${arn}/*`,
        },
      ],
    }),
  ),
});
