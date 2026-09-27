import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the AutomationExercise UI framework.
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  /* Where the test cases live */
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry once locally (the public demo site is occasionally flaky) and twice on CI */
  retries: process.env.CI ? 2 : 1,

  /* Keep parallelism modest so the public demo site is not hammered */
  workers: process.env.CI ? 1 : 3,

  /* Per-test timeout — generous enough for the full purchase flows */
  timeout: 60_000,

  /* Reporters: standard HTML report + custom report + line output in the terminal */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['./utils/customreporter.ts']
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://automationexercise.com',

    /* The site exposes `data-qa` attributes for testing — map them to getByTestId() */
    testIdAttribute: 'data-qa',

    /* Artifacts for diagnosing failures */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Firefox and WebKit can be enabled here when cross-browser coverage is required. */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
