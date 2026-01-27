import { test, expect } from '@playwright/test';

test('product page grower contact and quick chat works', async ({ page }) => {
  await page.goto('/');

  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 60_000 });
  await firstProduct.click();

  // Wait for product page to render
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Ensure Grower card elements present
  await expect(page.locator('text=View on Google Maps')).toHaveCount(1);
  await expect(page.locator('[data-testid="contact-chat-btn"]')).toHaveCount(1);
  // Cal.com button may be present or fallback to mailto
  const hasCalcom = await page.locator('[data-testid="calcom-btn"]').first().count();
  const hasMailto = await page.locator('a[href^="mailto:"]').count();
  expect(hasCalcom + hasMailto).toBeGreaterThan(0);

  // Click Quick Chat and ensure chat dialog attaches
  await page.click('[data-testid="contact-chat-btn"]');
  await page.waitForSelector('[data-testid="chat-dialog"]', { timeout: 30_000 });
  await expect(page.locator('[data-testid="chat-dialog"]')).toBeVisible();
});