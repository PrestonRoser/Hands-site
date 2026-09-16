import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against a real production build served by `astro preview`,
 * not the dev server. The dev server transforms modules on the fly, so it can pass
 * while the built output is broken — and the built output is what ships.
 *
 * The port is deliberately not Astro's default 4321, and an existing server is
 * never reused: with both defaults, a run silently adopted an unrelated project's
 * dev server that happened to hold 4321 and tested the wrong site, reporting a mix
 * of passes and failures that had nothing to do with this repo.
 */
const PORT = 4327;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
