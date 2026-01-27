import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Start fresh: clear cookies so ClientLayout behavior sets the cookie in dev
  await context.clearCookies();
});

test('default light theme is set and cookie is created in dev', async ({ page }) => {
  await page.goto('/');
  // Wait for the footer to appear which indicates the page has rendered
  await page.waitForSelector('footer', { timeout: 60_000 });

  // Wait for client-side effect to set the theme cookie (may happen after hydration)
  await page.waitForFunction(() => document.cookie.includes('mash-theme='), { timeout: 60_000 });

  // Check cookie exists and is 'light'
  const cookies = await page.context().cookies();
  const themeCookie = cookies.find((c) => c.name === 'mash-theme');
  expect(themeCookie).toBeTruthy();
  expect(themeCookie?.value).toBe('light');

  // HTML element should have the 'light' class when using next-themes attribute='class'
  const hasLightClass = await page.evaluate(() => document.documentElement.classList.contains('light'));
  expect(hasLightClass).toBe(true);
});

test('footer does not contain Accepted Payments and renders larger logo', async ({ page }) => {
  await page.goto('/');
  // Wait for the footer to appear which indicates the page has rendered
  await page.waitForSelector('footer', { timeout: 60_000 });

  // Ensure Accepted Payments text is not visible
  await expect(page.locator('text=Accepted Payments')).toHaveCount(0);

  // Logo fallback should render with expected width/height attributes
  const logo = page.locator('img[alt="MASH Market"]');
  await expect(logo).toHaveCount(1);
  const width = await logo.getAttribute('width');
  const height = await logo.getAttribute('height');
  expect(width).toBe('260');
  expect(height).toBe('90');
});
