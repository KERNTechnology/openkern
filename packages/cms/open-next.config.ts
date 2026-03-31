import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "aws-lambda",
      converter: "aws-apigw-v2",
      // Disable S3-based ISR cache — use in-memory only.
      // Avoids needing a dedicated cache bucket per customer.
      incrementalCache: "dummy",
    },
  },

  imageOptimization: {
    override: {},
  },

  buildCommand: "npx next build",
};

export default config;
