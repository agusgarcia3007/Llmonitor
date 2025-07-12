import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'pnpm --filter client preview --port 4173',
    port: 4173,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});