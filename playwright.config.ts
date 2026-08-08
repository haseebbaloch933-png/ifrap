import { defineConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Playwright end-to-end config (T-02). These are REAL behaviour tests: they
 * build and start the app, drive a headless browser, and exercise the auth /
 * RBAC / proxy gate and rendering end-to-end — unlike the static source-shape
 * checks in tests/e2e/*.test.js.
 *
 * The browser binary is preinstalled in the environment (PLAYWRIGHT_BROWSERS_PATH),
 * so we resolve its executable explicitly rather than have Playwright download
 * a version-matched build. Override with PW_CHROMIUM if needed.
 */
function findChromium(): string | undefined {
  if (process.env.PW_CHROMIUM && fs.existsSync(process.env.PW_CHROMIUM)) return process.env.PW_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dir = fs
      .readdirSync(base)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort()
      .pop();
    if (dir) {
      const exe = path.join(base, dir, 'chrome-linux', 'chrome');
      if (fs.existsSync(exe)) return exe;
    }
  } catch {
    /* fall through to Playwright's default resolution */
  }
  return undefined;
}

const executablePath = findChromium();

// A throwaway secret is fine for e2e; the app only requires it to be >= 16 chars.
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'playwright-e2e-test-secret-not-for-production-0001';

export default defineConfig({
  testDir: './tests/e2e-browser',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    launchOptions: {
      executablePath,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXTAUTH_SECRET,
      NEXTAUTH_URL: 'http://localhost:3000',
      ACKNOWLEDGE_SINGLE_INSTANCE_STORE: 'true',
    },
  },
});
