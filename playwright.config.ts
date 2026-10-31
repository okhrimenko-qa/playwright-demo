import { existsSync } from 'node:fs';
import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { defaultToolshopApiUrl, defaultToolshopUrl } from './constants';
import { TestOptions } from 'node:test';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const baseURL = process.env.BASE_URL || defaultToolshopUrl;
const apiURL = process.env.API_URL || defaultToolshopApiUrl;

const reporter: ReporterDescription[] = [
  [process.env.CI ? 'github' : 'list'],
  ['html', { open: 'never' }]
];

if (process.env.TESTOMATIO) {
  reporter.push(['@testomatio/reporter/playwright']);
}

export default defineConfig<TestOptions>({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter,
  use: {
    testIdAttribute: 'data-test',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './specs/api',
      use: { baseURL: apiURL },
    },
    {
      name: 'chromium',
      testDir: './specs/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
        userAgent: devices['Desktop Chrome'].userAgent,
      },
    },
  ],
});
