import { test, expect } from '@playwright/test';

test('cart stock dynamic behavior', async ({ page }) => {
  // Mock inventory endpoints
  await page.route('**/api/products/*/inventory', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { data: { quantity: 10 } } });
    } else if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      // Simulate successful decrement
      await route.fulfill({ json: { data: { quantity: body.quantity } } });
    } else {
      await route.continue();
    }
  });

  // Mock Sanity product query to ensure product exists and has stock
  await page.route('**/*.sanity.io/**/query/**', async (route) => {
    const url = route.request().url();
    console.log('[Mock Sanity] Intercepted:', url);
    if (url.includes('product') || url.includes('mock-mushroom')) {
      console.log('[Mock Sanity] Returning mock product');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            _id: 'mock-p1',
            name: 'Mock Mushroom',
            slug: { current: 'mock-mushroom' },
            price: 100,
            quantity: 10, // Mapped to stock
            stock: 10,
            isAvailable: true,
            image: { asset: { url: 'https://via.placeholder.com/150' } },
            images: [],
            category: { name: 'Fungi' },
            description: 'A mock product for testing',
            grower: { name: 'Mock Farm' }
          }
        })
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/product/mock-mushroom');

  // Wait for product page
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Check initial stock display (mocked at 10)
  // Look for text containing "10 available" or similar
  const bodyText = await page.textContent('body');
  console.log('Page content:', bodyText?.slice(0, 500)); // Log first 500 chars

  const stockText = page.locator('text=available').first();
  const inStockText = page.locator('text=In Stock').first();
  const outOfStockText = page.locator('text=Out of Stock').first();

  if (await stockText.isVisible()) {
    console.log('Found "available" text');
  } else if (await inStockText.isVisible()) {
    console.log('Found "In Stock" text');
  } else if (await outOfStockText.isVisible()) {
    console.log('Found "Out of Stock" text');
  } else {
    console.log('Stock status not found');
  }

  await expect(stockText).toBeVisible();
  
  // Get initial stock number
  const initialText = await stockText.innerText();
  const match = initialText.match(/(\d+)/);
  // If no match found (e.g. "In Stock" without number), this might fail. 
  // But our page logic shows "In Stock (X available)" if > 0.
  const initialStock = parseInt(match?.[1] || '0', 10);
  expect(initialStock).toBe(10);

  // Add to cart
  await page.click('button:has-text("Add to Cart")');

  // Verify stock visibly decremented immediately (optimistic UI)
  // We need to wait a tiny bit for React state update
  await page.waitForTimeout(500); 
  
  const newText = await stockText.innerText();
  const newStock = parseInt(newText.match(/(\d+)/)?.[1] || '0', 10);
  
  expect(newStock).toBe(9);
});
