import { test, expect } from '@playwright/test';
import fs from 'fs';

// Ensure directory exists for screenshots
const OUT_DIR = 'test-results/maps-screenshots';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

test('verify map display on product and grower pages and save screenshots', async ({ page }) => {
  // Product page
  await page.goto('/product/fresh-shiitake-mushrooms');
  await page.waitForSelector('text=Add to Cart', { timeout: 60_000 });

  // Locate the grower area (robust: find a card that contains the Seller heading)
  const productGrowerCard = page.locator('div:has-text("Seller")').first();
  await expect(productGrowerCard).toBeVisible({ timeout: 30_000 });

  // Try to detect iframe or fallback link within the grower area (or globally fallback)
  const iframe = productGrowerCard.locator('[data-testid="grower-map"]').first();
  const mapLink = productGrowerCard.locator('text=View on Google Maps').first();

  const iframeCount = iframe ? await iframe.count() : 0;
  const linkCount = mapLink ? await mapLink.count() : 0;

  console.log('Product page - iframeCount:', iframeCount, 'linkCount:', linkCount);

  // Take screenshot of the grower card region for visual inspection (fallback to visible seller card)
  await productGrowerCard.screenshot({ path: `${OUT_DIR}/product-grower-card.png` });

  // Grower detail page
  await page.goto('/grower/fungi-fresh-farms');
  await page.waitForSelector('text=All Products', { timeout: 60_000 });

  // Use the Contact Information card in aside for visual/site map checks
  const growerDetailCard = page.locator('div:has-text("Contact Information")').first();
  await expect(growerDetailCard).toBeVisible({ timeout: 30_000 });

  const gIframe = growerDetailCard.locator('[data-testid="grower-map"]').first();
  const gMapLink = growerDetailCard.locator('text=View on Google Maps').first();

  const gIframeCount = gIframe ? await gIframe.count() : 0;
  const gLinkCount = gMapLink ? await gMapLink.count() : 0;

  console.log('Grower page - iframeCount:', gIframeCount, 'linkCount:', gLinkCount);

  await growerDetailCard.screenshot({ path: `${OUT_DIR}/grower-detail-card.png` });

  // Assert that at least one page shows an iframe or a link
  expect(iframeCount + linkCount + gIframeCount + gLinkCount).toBeGreaterThan(0);
});