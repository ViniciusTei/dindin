import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.tsx"],
    setupFiles: ["app/test/vitest.ui.setup.ts"],
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/ui",
      reporter: ["text-summary", "html", "json"],
      all: false,
      include: [
        "app/components/**/*.{ts,tsx}",
        "app/ui/**/*.{ts,tsx}",
        "app/domain/**/ui/**/*.{ts,tsx}",
      ],
      exclude: ["**/*.d.ts", "**/*.test.ts", "**/*.test.tsx", "app/test/**"],
    },
  },
});
