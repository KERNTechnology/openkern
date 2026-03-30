import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { mediaBucket } from "./storage";

const config = new pulumi.Config("openkern");
const projectName = config.require("projectName");
const databaseUri = config.requireSecret("databaseUri");
const payloadSecret = config.requireSecret("payloadSecret");

const tags = {
  Project: "openkern",
  Site: projectName,
  ManagedBy: "pulumi",
};

// IAM role for the Lambda function
const lambdaRole = new aws.iam.Role(`${projectName}-lambda-role`, {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: { Service: "lambda.amazonaws.com" },
        Effect: "Allow",
      },
    ],
  }),
  tags,
});

// Basic Lambda execution permissions (CloudWatch Logs)
new aws.iam.RolePolicyAttachment(`${projectName}-lambda-basic`, {
  role: lambdaRole.name,
  policyArn:
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

// S3 access for media uploads
const s3Policy = new aws.iam.RolePolicy(`${projectName}-lambda-s3`, {
  role: lambdaRole.id,
  policy: mediaBucket.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
          Resource: `${arn}/*`,
        },
        {
          Effect: "Allow",
          Action: ["s3:ListBucket"],
          Resource: arn,
        },
      ],
    }),
  ),
});

// Lambda function for Payload CMS (deployed via OpenNext)
// The actual code is deployed separately after the infrastructure is up.
// This creates the function with a placeholder — the installer replaces it.
export const serverFunction = new aws.lambda.Function(
  `${projectName}-server`,
  {
    runtime: "nodejs20.x",
    handler: "index.handler",
    role: lambdaRole.arn,
    memorySize: 1024,
    timeout: 30,
    environment: {
      variables: {
        DATABASE_URI: databaseUri,
        PAYLOAD_SECRET: payloadSecret,
        S3_BUCKET: mediaBucket.bucket,
        S3_REGION: aws.config.region || "eu-central-1",
        NODE_ENV: "production",
      },
    },
    tags: { ...tags, Name: `${projectName}-server` },

    // Placeholder code — replaced by the installer with the OpenNext build
    code: new pulumi.asset.AssetArchive({
      "index.js": new pulumi.asset.StringAsset(
        'exports.handler = async () => ({ statusCode: 200, body: "OpenKERN: awaiting deployment" });',
      ),
    }),
  },
);

// Lambda function URL (used by CloudFront as origin)
export const functionUrl = new aws.lambda.FunctionUrl(
  `${projectName}-server-url`,
  {
    functionName: serverFunction.name,
    authorizationType: "NONE",
  },
);

export const lambdaFunctionName = serverFunction.name;
export const lambdaFunctionUrl = functionUrl.functionUrl;
