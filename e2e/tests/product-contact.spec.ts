import { test, expect } from '@playwright/test';

test('product page grower contact and quick chat works', async ({ page }) => {
  await page.goto('/');

  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 60_000 });
  await firstProduct.click();

  // Wait for product page to render
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Ensure Grower card elements present
  // Map may be an embedded iframe or a link (if API key is missing)
  const iframeLocator = page.locator('[data-testid="grower-map"]').first();
  const linkLocator = page.locator('text=View on Google Maps').first();
  const iframeCount = await iframeLocator.count();
  const linkCount = await linkLocator.count();
  expect(iframeCount + linkCount).toBeGreaterThan(0);

  // If iframe is present, validate its src contains the embed endpoint
  if (iframeCount > 0) {
    const src = await iframeLocator.getAttribute('src');
    expect(src).toBeTruthy();
    // Accept either Maps Embed API (embed/v1/place?key=...) or the shared embed (embed?pb=...)
    expect(src).toMatch(/maps\/embed(\/v1\/place)?|(embed\?pb=)/);
    // If it's v1, it should include a key or q param; if pb-style, it should include pb token
    expect(src).toMatch(/key=|q=|pb=/);
  }

  // There may be more than one quick chat button on the page (header + grower card). Just assert at least one exists.
  const chatBtnCount = await page.locator('[data-testid="contact-chat-btn"]').count();
  expect(chatBtnCount).toBeGreaterThan(0);

  // Cal.com button may be present or fallback to mailto
  const hasCalcom = await page.locator('[data-testid="calcom-btn"]').first().count();
  const hasMailto = await page.locator('a[href^="mailto:"]').count();
  expect(hasCalcom + hasMailto).toBeGreaterThan(0);

  // Click Quick Chat and ensure chat dialog attaches
  await page.click('[data-testid="contact-chat-btn"]');
  await page.waitForSelector('[data-testid="chat-dialog"]', { timeout: 30_000 });
  await expect(page.locator('[data-testid="chat-dialog"]')).toBeVisible();
});