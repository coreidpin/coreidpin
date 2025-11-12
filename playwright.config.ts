import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Desktop Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop WebKit', use: { ...devices['Desktop Safari'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});