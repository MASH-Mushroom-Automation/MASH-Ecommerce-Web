import { test, expect } from '@playwright/test';

test('cart stock conflict & recovery (server authoritative lower stock)', async ({ page }) => {
  // Track GET calls to simulate a conflict on reconciliation
  let getCalls = 0;

  await page.context().route('**/api/products/*/inventory', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      getCalls += 1;
      if (getCalls === 1) {
        // Initial load: backend reports 10
        await route.fulfill({ json: { data: { quantity: 10 } } });
      } else {
        // During reconciliation: backend authoritative lower stock (e.g., 5)
        await route.fulfill({ json: { data: { quantity: 5 } } });
      }
    } else if (method === 'PUT') {
      // Simulate backend accepting update but returning authoritative quantity (5)
      await route.fulfill({ json: { data: { quantity: 5 } } });
    } else {
      await route.continue();
    }
  });

  // Mock Sanity product query
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

  await page.goto('/product/mock-mushroom');
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  const stockLocator = page.locator('text=available').first();
  await expect(stockLocator).toBeVisible();
  const initial = parseInt((await stockLocator.innerText()).match(/(\d+)/)?.[1] || '0', 10);
  expect(initial).toBe(10);

  // Add to cart -> optimistic should reduce stock (may be optimistic or authoritative immediately depending on timing)
  await page.click('button:has-text("Add to Cart")');
  // Wait until stock display shows any number less than the initial value (handles race conditions)
  await page.waitForFunction((initial) => {
    const body = document.body.textContent || '';
    const m = body.match(/(\d+)\s+available/);
    if (!m) return false;
    const n = parseInt(m[1], 10);
    return n < initial;
  }, initial, { timeout: 5000 });

  const optimistic = parseInt((await stockLocator.innerText()).match(/(\d+)/)?.[1] || '0', 10);
  expect(optimistic).toBeLessThan(initial);

  // Wait for reconciliation to occur and authoritative value (5) to be applied
  await page.waitForFunction(() => (document.body.textContent || '').includes('5 available'), { timeout: 5000 });

  const authoritative = parseInt((await stockLocator.innerText()).match(/(\d+)/)?.[1] || '0', 10);
  expect(authoritative).toBe(5);
});