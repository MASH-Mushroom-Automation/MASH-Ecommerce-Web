import { test, expect } from '@playwright/test';

test('product page shows details sections and suggested products', async ({ page }) => {
  await page.goto('/');
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 60_000 });
  await firstProduct.click();

  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // The detailed sections (Freshness, Cooking, Delivery) were removed intentionally
  await expect(page.locator('text=Freshness & Quality')).toHaveCount(0);
  await expect(page.locator('text=Cooking Guide')).toHaveCount(0);
  await expect(page.locator('text=Delivery Options')).toHaveCount(0);

  // Grower details should be present (either embedded map or external link / contact link)
  const hasMapIframe = await page.locator('[data-testid="grower-map"]').count();
  const hasMapsLink = await page.locator('text=View on Google Maps').count();
  const hasContact = await page.locator('text=Contact seller').count();
  expect(hasMapIframe + hasMapsLink + hasContact).toBeGreaterThan(0);

  // Suggested products (if present, there should be product cards)
  const suggestionsCount = await page.locator('text=You May Also Like').count();
  if (suggestionsCount > 0) {
    const suggSection = page.locator('section', { hasText: 'You May Also Like' }).first();
    const productLinks = await suggSection.locator('a[href^="/product/"]').count();
    expect(productLinks).toBeGreaterThan(0);
  }
});