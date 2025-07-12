import { test, expect } from '@playwright/test';

const ERROR_PATTERN = /L\.current\.useRef/;

test.describe('Dashboard subscription access', () => {
  test('paid user can view dashboard without errors', async ({ page }) => {
    // simulate paid user via cookie
    await page.context().addCookies([
      {
        name: 'isAuthenticated',
        value: 'true',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: 'plan',
        value: 'premium',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    const messages: string[] = [];
    page.on('pageerror', (err) => messages.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') messages.push(msg.text());
    });

    await page.goto('/_dashboard/dashboard');
    await expect(page).toHaveURL(/dashboard/);
    expect(messages.find((m) => ERROR_PATTERN.test(m))).toBeFalsy();
    await expect(page.getByText(/Dashboard/i)).toBeVisible();
  });

  test('free user is redirected to pricing', async ({ page }) => {
    await page.context().addCookies([
      { name: 'isAuthenticated', value: 'true', domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' },
      { name: 'plan', value: 'free', domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' },
    ]);

    const messages: string[] = [];
    page.on('pageerror', (err) => messages.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') messages.push(msg.text());
    });

    await page.goto('/_dashboard/dashboard');
    await expect(page).toHaveURL(/\/pricing/);
    expect(messages.find((m) => ERROR_PATTERN.test(m))).toBeFalsy();
    await expect(page.getByText(/Pricing|Upgrade/i)).toBeVisible();
  });
});