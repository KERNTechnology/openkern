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

// --- Server Function (Payload CMS + Next.js SSR via OpenNext) ---
// Placeholder code — replaced by the deploy script with the OpenNext build output.
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
        SERVER_URL: "",  // Set after deploy via: aws lambda update-function-configuration
        S3_BUCKET: mediaBucket.bucket,
        S3_REGION: aws.config.region || "eu-central-1",
        CACHE_BUCKET_NAME: mediaBucket.bucket,
        CACHE_BUCKET_REGION: aws.config.region || "eu-central-1",
        NODE_ENV: "production",
      },
    },
    tags: { ...tags, Name: `${projectName}-server` },
    code: new pulumi.asset.AssetArchive({
      "index.js": new pulumi.asset.StringAsset(
        'exports.handler = async () => ({ statusCode: 200, body: "OpenKERN: awaiting deployment" });',
      ),
    }),
  },
);

// --- Image Optimization Function (OpenNext image handler) ---
const imageRole = new aws.iam.Role(`${projectName}-image-role`, {
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

new aws.iam.RolePolicyAttachment(`${projectName}-image-basic`, {
  role: imageRole.name,
  policyArn:
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

new aws.iam.RolePolicy(`${projectName}-image-s3`, {
  role: imageRole.id,
  policy: mediaBucket.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["s3:GetObject"],
          Resource: `${arn}/*`,
        },
      ],
    }),
  ),
});

export const imageFunction = new aws.lambda.Function(
  `${projectName}-image`,
  {
    runtime: "nodejs20.x",
    handler: "index.handler",
    architectures: ["arm64"],
    role: imageRole.arn,
    memorySize: 512,
    timeout: 25,
    environment: {
      variables: {
        BUCKET_NAME: mediaBucket.bucket,
      },
    },
    tags: { ...tags, Name: `${projectName}-image` },
    code: new pulumi.asset.AssetArchive({
      "index.js": new pulumi.asset.StringAsset(
        'exports.handler = async () => ({ statusCode: 200, body: "OpenKERN image: awaiting deployment" });',
      ),
    }),
  },
);

// --- HTTP API (API Gateway v2) as proxy to Lambda ---
// Used as CloudFront origin instead of Function URLs (SCP-compatible).
const api = new aws.apigatewayv2.Api(`${projectName}-api`, {
  protocolType: "HTTP",
  tags,
});

// Server Lambda integration
const serverIntegration = new aws.apigatewayv2.Integration(
  `${projectName}-server-integration`,
  {
    apiId: api.id,
    integrationType: "AWS_PROXY",
    integrationUri: serverFunction.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
  },
);

// Image Lambda integration
const imageIntegration = new aws.apigatewayv2.Integration(
  `${projectName}-image-integration`,
  {
    apiId: api.id,
    integrationType: "AWS_PROXY",
    integrationUri: imageFunction.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
  },
);

// Route: /_next/image → image optimization Lambda
new aws.apigatewayv2.Route(`${projectName}-image-route`, {
  apiId: api.id,
  routeKey: "GET /_next/image",
  target: pulumi.interpolate`integrations/${imageIntegration.id}`,
});

// Route: everything else → server Lambda (catch-all)
new aws.apigatewayv2.Route(`${projectName}-default-route`, {
  apiId: api.id,
  routeKey: "$default",
  target: pulumi.interpolate`integrations/${serverIntegration.id}`,
});

// Auto-deploy stage
const stage = new aws.apigatewayv2.Stage(`${projectName}-api-stage`, {
  apiId: api.id,
  name: "$default",
  autoDeploy: true,
  tags,
});

// Allow API Gateway to invoke the server Lambda
new aws.lambda.Permission(`${projectName}-apigw-invoke-server`, {
  action: "lambda:InvokeFunction",
  function: serverFunction.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

// Allow API Gateway to invoke the image Lambda
new aws.lambda.Permission(`${projectName}-apigw-invoke-image`, {
  action: "lambda:InvokeFunction",
  function: imageFunction.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

// Exports
export const lambdaFunctionName = serverFunction.name;
export const imageFunctionName = imageFunction.name;

// API Gateway URL as the origin for CloudFront
export const apiUrl = pulumi.interpolate`${api.apiEndpoint}/`;
