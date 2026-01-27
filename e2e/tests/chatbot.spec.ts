import { test, expect } from '@playwright/test';

test('chatbot basic flow with proxied Gemini response', async ({ page }) => {
  // Collect console and page errors for debugging
  const consoles: string[] = [];
  page.on('console', (msg) => consoles.push(`[console:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoles.push(`[pageerror] ${err.message}`));

  // Intercept the proxied Gemini API call and return a deterministic response
  await page.route('**/api/ai/gemini', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Assistant: Hello from mock' }] } }] }),
    });
  });

  // Open homepage and ensure chat button is present
  await page.goto('/');
  await page.waitForSelector('[data-testid="chat-button"]');

  // Open chat (force click to avoid possible overlays in page)
  await page.locator('[data-testid="chat-button"]').click({ force: true });

  // Wait for the dialog element to be attached to the DOM (may be hidden during animation)
  try {
    await page.locator('[data-testid="chat-dialog"]').waitFor({ state: 'attached', timeout: 30_000 });
    // Then ensure it's visible before interacting
    await page.waitForSelector('[data-testid="chat-dialog"]:visible', { timeout: 30_000 });
  } catch (err) {
    // Dump diagnostic info for debugging
    const html = await page.content();
    console.log('=== CHAT DIALOG NOT FOUND ===');
    console.log('Console logs:', consoles.join('\n') || '<none>');
    console.log('Page HTML (truncated):', html.slice(0, 4000));
    throw err;
  }

  // Type a message and send
  await page.fill('[data-testid="chat-input-textarea"]', 'Hi');
  await page.click('[data-testid="chat-input-send-button"]');

  // Wait for assistant message to contain our mock text
  await page.waitForSelector('text=Hello from mock', { timeout: 30_000 });
  const assistant = page.locator('[data-testid="message-assistant"]', { hasText: 'Hello from mock' }).first();
  await expect(assistant).toContainText('Hello from mock');
});