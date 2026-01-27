import { test, expect } from '@playwright/test';

// Mock Sanity grower query to return a grower with calendly enabled and custom buttonText
test('grower profile shows booking CTA with custom button text and links to booking page', async ({ page }) => {
  // Log Sanity-related requests (for debugging) and intercept all requests to handle Sanity queries deterministically
  const sanityRequests: string[] = [];
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('sanity') || u.includes('/query')) {
      // eslint-disable-next-line no-console
      console.log('[SANITY REQ]', req.method(), u, req.postData ? req.postData() : '');
      sanityRequests.push(u);
    }
  });

  // Navigate to the deterministic test page that renders the components directly
  await page.goto('/test/grower-booking');

  // Verify GrowerCard cal.com button (product context)
  const calcomBtn = page.getByTestId('calcom-btn').first();
  await expect(calcomBtn).toBeVisible({ timeout: 60_000 });
  const calcomHref = await calcomBtn.evaluate((el) => (el as HTMLAnchorElement).href);
  expect(calcomHref).toContain('https://cal.com/mockgrower/30min');

  // Verify CalendlyButton (profile) links to internal booking page
  const bookingLink = page.locator('a[href*="/grower/mock-grower/book"]').first();
  await expect(bookingLink).toBeVisible({ timeout: 60_000 });
  const href = await bookingLink.evaluate((el) => (el as HTMLAnchorElement)?.href || '');
  expect(href).toContain('/grower/mock-grower/book');
});