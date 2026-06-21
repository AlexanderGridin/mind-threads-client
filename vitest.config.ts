import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      exclude: ["src/main.tsx", "src/index.css"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
      reporter:
        process.env.COVERAGE_REPORT === "true" ? ["text", "html"] : ["text"],
    },
  },
});
