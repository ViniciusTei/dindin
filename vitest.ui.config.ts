import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["app/features/**/*.test.{ts,tsx}"],
    setupFiles: ["app/test/vitest.ui.setup.ts"],
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/ui",
      reporter: ["text-summary", "html", "json"],
      all: false,
      include: ["app/features/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/*.test.ts", "**/*.test.tsx", "app/test/**"],
    },
  },
});
