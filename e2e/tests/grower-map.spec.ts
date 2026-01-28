import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure screenshots dir exists
const outDir = path.join(process.cwd(), 'e2e', 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

test('grower map expands and screenshot captures expanded map', async ({ page }) => {
  // Navigate to site and open first product
  await page.goto('/');
  await page.waitForSelector('a[href^="/product/"]', { timeout: 60_000 });
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await firstProduct.click();

  // Wait for product page and grower map to be visible
  await page.waitForSelector('[data-testid="grower-map"]', { timeout: 60_000 });

  // Click the expand button to open modal
  const expand = await page.locator('[data-testid="grower-map-expand"]').first();
  await expand.click();

  // Wait for modal and large iframe
  await page.waitForSelector('[data-testid="grower-map-modal"]', { timeout: 60_000 });
  await page.waitForSelector('[data-testid="grower-map-large"]', { timeout: 60_000 });

  // Take screenshot of the modal area
  const modal = await page.locator('[data-testid="grower-map-modal"]').first();
  const screenshotPath = path.join(outDir, 'grower-map-expanded.png');
  await modal.screenshot({ path: screenshotPath });

  // Basic sanity: screenshot file exists and size > 0
  const stat = fs.statSync(screenshotPath);
  expect(stat.size).toBeGreaterThan(0);
});