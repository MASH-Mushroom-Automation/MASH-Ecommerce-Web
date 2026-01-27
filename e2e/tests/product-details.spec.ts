import { test, expect } from '@playwright/test';

test('product page shows details sections and suggested products', async ({ page }) => {
  await page.goto('/');
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 60_000 });
  await firstProduct.click();

  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Sections
  await expect(page.locator('text=Freshness & Quality')).toHaveCount(1);
  await expect(page.locator('text=Cooking Guide')).toHaveCount(1);
  await expect(page.locator('text=Delivery Options')).toHaveCount(1);
  // Grower details should be present (name or contact link)
  const hasMaps = await page.locator('text=View on Google Maps').count();
  const hasContact = await page.locator('text=Contact seller').count();
  expect(hasMaps + hasContact).toBeGreaterThan(0);

  // Suggested products (if present, there should be product cards)
  const suggestionsCount = await page.locator('text=You May Also Like').count();
  if (suggestionsCount > 0) {
    const suggSection = page.locator('section', { hasText: 'You May Also Like' }).first();
    const productLinks = await suggSection.locator('a[href^="/product/"]').count();
    expect(productLinks).toBeGreaterThan(0);
  }
});