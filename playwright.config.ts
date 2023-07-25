// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 10 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
  reporter: [
  ['./src/index.ts', { 
    testFolder: 'tests',
    title: 'Playwright HTML Report',
    project: 'QA Tests',
    release: '9.87.6',
    testEnvironment: 'DEV',
    embedAssets: true,
    embedAttachments: true,
    outputFolder: 'playwright-html-report',
    minifyAssets: true,
    startServer: true,
  }]
],
  use: {
    video: {
			mode: "on",
		},
		screenshot: "on",
		trace: "on",
  },
  projects: [
      /* Test against desktop browsers */
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
      /* Test against mobile viewports. */
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
      /* Test against branded browsers. */
      {
        name: 'Google Chrome',
        use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      },
      {
        name: 'Google Chrome Beta',
        use: { ...devices['Desktop Chrome'], channel: 'chrome-beta' },
      },
      {
        name: 'Microsoft Edge',
        use: { ...devices['Desktop Edge'], channel: 'msedge' },
      },
      {
        name: 'Microsoft Edge Beta',
        use: { ...devices['Desktop Edge'], channel: 'msedge-beta' },
      },
      {
        name: 'Microsoft Edge Dev',
        use: { ...devices['Desktop Edge'], channel: 'msedge-dev' },
      },
  ],
};
export default config;