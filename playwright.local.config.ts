import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  globalSetup: './e2e/global-setup.js',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  // No webServer: assume app is already running on localhost:3000 (docker compose web)
});
