import { test, expect } from '@playwright/test';

test('product page shows clear empty location state and contact options when grower has no location', async ({ page }) => {
  // Mock inventory endpoints
  await page.route('**/api/products/*/inventory', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { data: { quantity: 5 } } });
    } else {
      await route.continue();
    }
  });

  // Mock Sanity product query for a test slug
  await page.route('**/*.sanity.io/**/query/**', async (route) => {
    const url = route.request().url();
    if (url.includes('mock-no-location')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            _id: 'mock-noloc',
            name: 'Mock No Location Mushroom',
            slug: { current: 'mock-no-location' },
            price: 120,
            quantity: 5,
            stock: 5,
            isAvailable: true,
            image: { asset: { url: 'https://via.placeholder.com/150' } },
            images: [],
            category: { name: 'Fungi' },
            description: 'A mock product with grower missing location for testing',
            grower: { name: 'No Location Farm', calcomUsername: 'noloc', contactEmail: 'hello@noloc.com' }
          }
        })
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/product/mock-no-location');
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Check for empty location state
  await expect(page.locator('[data-testid="grower-location-empty"]')).toBeVisible();
  await expect(page.locator('[data-testid="calcom-btn-empty"]')).toBeVisible();
  await expect(page.locator('[data-testid="contact-chat-btn-empty"]')).toBeVisible();
});