import { test, expect } from '@playwright/test';

// Mock Sanity grower query to return a grower with calendly enabled and custom buttonText
test('grower profile shows booking CTA with custom button text and links to booking page', async ({ page }) => {
  await page.context().route('**/*.sanity.io/**/query/**', async (route) => {
    const url = route.request().url();
    if (url.includes('grower')) {
      // Return a minimal grower payload expected by the page
      const body = { result: [{
        _id: 'grower-1',
        name: 'Mock Grower',
        slug: { current: 'mock-grower' },
        calendlyEnabled: true,
        calcomButtonText: 'Schedule with Grower',
        appointmentTypes: [{ name: '30 Min', eventSlug: '30min', duration: 30, meetingType: 'online', isDefault: true }],
        image: null,
      }] };
      await route.fulfill({ status: 200, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      return;
    }

    // For other sanity queries, fall back to empty result
    await route.fulfill({ status: 200, body: JSON.stringify({ result: [] }), headers: { 'Content-Type': 'application/json' } });
  });

  await page.goto('/grower/mock-grower');

  // Wait for booking CTA to appear
  await page.waitForSelector('text=Schedule with Grower', { timeout: 60_000 });

  const bookingButton = page.locator('text=Schedule with Grower').first();
  await expect(bookingButton).toBeVisible();

  // The button should link to internal booking page
  const href = await bookingButton.evaluate((el) => (el.closest('a') as HTMLAnchorElement)?.href || '');
  expect(href).toContain('/grower/mock-grower/book');
});