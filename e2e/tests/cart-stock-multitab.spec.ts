import { test, expect } from '@playwright/test';

test('cart stock syncs across tabs (multi-tab)', async ({ page }) => {
  // Mock inventory endpoints on the shared context so it applies to multiple pages
  await page.context().route('**/api/products/*/inventory', async (route) => {
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

  // Mock Sanity product query on the shared context
  await page.context().route('**/*.sanity.io/**/query/**', async (route) => {
    const url = route.request().url();
    if (url.includes('product') || url.includes('mock-mushroom')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            _id: 'mock-p1',
            name: 'Mock Mushroom',
            slug: { current: 'mock-mushroom' },
            price: 100,
            quantity: 10,
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

  // Open product page in first tab
  await page.goto('/product/mock-mushroom');
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Open a second tab in the same context to simulate multi-tab behavior
  const page2 = await page.context().newPage();
  await page2.goto('/product/mock-mushroom');
  await page2.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Ensure both pages show initial stock 10
  const stockLocator1 = page.locator('text=available').first();
  const stockLocator2 = page2.locator('text=available').first();

  await expect(stockLocator1).toBeVisible();
  await expect(stockLocator2).toBeVisible();

  const initial1 = parseInt((await stockLocator1.innerText()).match(/(\d+)/)?.[1] || '0', 10);
  const initial2 = parseInt((await stockLocator2.innerText()).match(/(\d+)/)?.[1] || '0', 10);
  expect(initial1).toBe(10);
  expect(initial2).toBe(10);

  // Add to cart from first tab
  await page.click('button:has-text("Add to Cart")');

  // Wait for optimistic UI update on first tab
  await page.waitForTimeout(500);

  // Wait for the second tab to receive storage event and update to 9 (polling the DOM)
  await page2.waitForFunction(() => (document.body.textContent || '').includes('9 available'), { timeout: 5000 });

  // Assert both pages now show 9
  const updated1 = parseInt((await stockLocator1.innerText()).match(/(\d+)/)?.[1] || '0', 10);
  const updated2 = parseInt((await stockLocator2.innerText()).match(/(\d+)/)?.[1] || '0', 10);

  expect(updated1).toBe(9);
  expect(updated2).toBe(9);

  await page2.close();
});
