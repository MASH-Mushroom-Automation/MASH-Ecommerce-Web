import { test, expect } from '@playwright/test';

test('login page has no getPasswordRequirements ReferenceError', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/login');
  // Interact with password input to trigger the password requirements UI
  await page.fill('#password', 'Test123!');
  await page.waitForTimeout(500);

  expect(errors.find(e => e.includes('getPasswordRequirements'))).toBeUndefined();
});