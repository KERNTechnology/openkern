import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
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
  // Override jsx: "preserve" from Next.js tsconfig for Vitest/oxc
  oxc: {
    jsx: "automatic",
  },
});
