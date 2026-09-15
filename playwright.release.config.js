const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/release',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: process.env.PLAYWRIGHT_REPORT_DIR || 'playwright-report/release', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://dev.catmapper.org',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
  },
  projects: [{ name: 'release-chromium', use: { ...devices['Desktop Chrome'] } }],
});
