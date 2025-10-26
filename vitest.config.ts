import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.{ts,tsx}", "**/tests/**/*.{ts,tsx}"],
    coverage: {
      enabled: false, // you can enable later
    },
  },
});
