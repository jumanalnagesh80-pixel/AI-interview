import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "hooks/**/*.test.ts"],
    exclude: ["node_modules", ".next", "backend"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
