import { test, expect } from '@playwright/test';

test('product page has no variant selector or bundle UI and add-to-cart works', async ({ page }) => {
  await page.goto('/');
  // Click first product card link
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 60_000 });
  await firstProduct.click();

  // Wait for product page
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Ensure variant selector not present
  const selectOption = page.locator('text=Select Option');
  await expect(selectOption).toHaveCount(0);

  // Ensure bundle UI removed
  const addBundle = page.locator('text=Add Bundle to Cart');
  await expect(addBundle).toHaveCount(0);

  // Click Add to Cart
  await page.click('text=Add to Cart');

  // Wait a moment for cookie to be set
  await page.waitForTimeout(500);

  const cookies = await page.context().cookies();
  const cartCookie = cookies.find((c) => c.name === 'mash-cart');
  expect(cartCookie).toBeTruthy();
  // Ensure cart contains the product we just added (derived from URL)
  const url = page.url();
  const slug = url.split('/product/')[1];
  expect(cartCookie?.value).toContain(slug);
});