import { defineConfig } from "vitest/config";
import path from "path";

const config = defineConfig({
  test: {
    include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: false,
    typecheck: {
      tsconfig: "./tsconfig.vitest.json",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@payload-config": path.resolve(__dirname, "src/payload.config.ts"),
    },
  },
});

// Vitest 4 / Vite 8 uses oxc for JSX transformation. Next.js tsconfig
// sets jsx: "preserve" which oxc cannot parse. Override to "automatic".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(config as any).oxc = { jsx: "automatic" };

export default config;
