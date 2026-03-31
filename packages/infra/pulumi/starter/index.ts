import { mediaBucket, assetsBucket } from "./storage";
import { lambdaFunctionName, imageFunctionName, apiUrl } from "./compute";
import { distributionId, distributionDomain, siteUrl } from "./cdn";

// Stack outputs — displayed after `pulumi up`
export const mediaBucketName = mediaBucket.bucket;
export const assetsBucketName = assetsBucket.bucket;
export { lambdaFunctionName, imageFunctionName };
export { apiUrl };
export { distributionId, distributionDomain, siteUrl };

// Admin URL
export const adminUrl = siteUrl.apply((url) => `${url}/admin`);
