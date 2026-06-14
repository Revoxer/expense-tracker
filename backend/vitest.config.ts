import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    sequence: {
      concurrent: false,
    },
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
