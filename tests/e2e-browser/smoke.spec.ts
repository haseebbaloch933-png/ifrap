import { test, expect } from '@playwright/test';

/**
 * Real end-to-end smoke tests against the running app: they verify the
 * security-critical auth / RBAC / proxy-gate behaviour and core rendering by
 * actually driving the built application, not by inspecting source text.
 */

test.describe('IFRAP — rendering', () => {
  test('home page renders MIRAB branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('MIRAB');
  });

  test('login page renders the sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

test.describe('IFRAP — proxy/RBAC gate (unauthenticated)', () => {
  // Protected PAGE routes must redirect an unauthenticated visitor to /login.
  for (const route of ['/telemetry', '/admin', '/grm', '/field-log', '/results-framework']) {
    test(`GET ${route} (page) redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  // Protected API routes must return 401 (no session), never data.
  for (const api of ['/api/grm', '/api/field-logs', '/api/audit-log', '/api/export']) {
    test(`GET ${api} returns 401`, async ({ request }) => {
      const res = await request.get(api);
      expect(res.status()).toBe(401);
    });
  }

  test('unauthenticated GET /api/grm does not leak ticket data', async ({ request }) => {
    const res = await request.get('/api/grm');
    expect(res.status()).toBe(401);
    const body = await res.text();
    expect(body).not.toContain('submitterName');
  });
});
