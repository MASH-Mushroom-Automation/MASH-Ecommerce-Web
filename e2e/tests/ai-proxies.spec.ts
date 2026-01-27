import { test, expect } from '@playwright/test';

test('AI proxy health endpoints are available', async ({ request }) => {
  const gemini = await request.get('/api/ai/gemini');
  expect(gemini.status()).toBe(200);
  const geminiBody = await gemini.json();
  expect(geminiBody.ok).toBe(true);

  const hf = await request.get('/api/ai/hf');
  expect(hf.status()).toBe(200);
  const hfBody = await hf.json();
  expect(hfBody.ok).toBe(true);
});

test('chatbot uses fallback HF proxy when Gemini proxy fails', async ({ page }) => {
  // Collect console and page errors for debugging
  const consoles: string[] = [];
  page.on('console', (msg) => consoles.push(`[console:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoles.push(`[pageerror] ${err.message}`));

  // Log network requests/responses for AI routes
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/ai/') || url.includes('/api/chatbot')) {
      console.log(`[request] ${req.method()} ${url}`);
    }
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/ai/') || url.includes('/api/chatbot')) {
      console.log(`[response] ${res.status()} ${res.request().method()} ${url}`);
      try {
        const text = await res.text();
        console.log(`[response body] ${text.slice(0, 500)}`);
      } catch (err) {
        console.log('[response body] <unable to read body>');
      }
    }
  });

  // Make Gemini proxy return 500 for POSTs only (allow GET health checks to pass)
  await page.route('**/api/ai/gemini', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Simulated upstream error' }) });
    } else {
      await route.continue();
    }
  });

  // Make HF proxy return a valid assistant response for POSTs only (allow GET health checks to pass)
  await page.route('**/api/ai/hf', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ generated_text: 'Assistant: Hello from HF fallback' }]),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  // Wait for chat button to be visible (HMR may keep network busy, so avoid networkidle)
  await page.waitForSelector('[data-testid="chat-button"]:visible', { timeout: 30_000 });
  await page.waitForTimeout(500); // allow any transient HMR/animations to finish

  // Try opening dialog robustly (overlay or animations may interfere)
  // Retry clicking up to 3 times if the dialog doesn't attach
  let opened = false;
  for (let attempt = 0; attempt < 3 && !opened; attempt++) {
    // Diagnostic: log chat button & dialog presence before clicking
    const btn = page.locator('[data-testid="chat-button"]');
    const btnCount = await btn.count();
    const btnVisible = await btn.isVisible();
    const btnBox = await btn.boundingBox();
    const btnOpenAttr = await btn.getAttribute('data-open');
    const dialog = page.locator('[data-testid="chat-dialog"]');
    const dialogCount = await dialog.count();
    const dialogVisible = await dialog.isVisible().catch(() => false);

    console.log(`Attempt ${attempt + 1}: chat-button count=${btnCount}, visible=${btnVisible}, box=${JSON.stringify(btnBox)}, data-open=${btnOpenAttr}, dialog count=${dialogCount}, dialogVisible=${dialogVisible}`);

    // Try native DOM click first
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="chat-button"]') as HTMLElement | null;
      if (btn) btn.click();
    });

    // If not opened, try Playwright force click
    try {
      await page.locator('[data-testid="chat-dialog"]').waitFor({ state: 'attached', timeout: 2000 });
      await page.waitForSelector('[data-testid="chat-dialog"]:visible', { timeout: 2000 });
      opened = true;
    } catch (err) {
      await page.locator('[data-testid="chat-button"]').click({ force: true });
      try {
        await page.locator('[data-testid="chat-dialog"]').waitFor({ state: 'attached', timeout: 30000 });
        await page.waitForSelector('[data-testid="chat-dialog"]:visible', { timeout: 30000 });
        opened = true;
      } catch (err2) {
        // Try again: press Escape to dismiss overlays, small delay, and retry
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
      }
    }
  }

  if (!opened) {
    const html = await page.content();
    console.log('=== CHAT DIALOG FAILED TO OPEN ===');
    console.log('Console logs:', consoles.join('\n') || '<none>');
    console.log('Page HTML (truncated):', html.slice(0, 20000));
    throw new Error('Chat dialog failed to open after retries');
  }

  // Use a product-related query to trigger RAG + fallback behavior
  await page.fill('[data-testid="chat-input-textarea"]', 'Show me mushrooms');
  await page.click('[data-testid="chat-input-send-button"]');

  // Wait for assistant message from HF fallback (longer timeout in case of slow processing)
  try {
    await page.waitForSelector('text=Hello from HF fallback', { timeout: 60_000 });
    const assistant = page.locator('[data-testid="message-assistant"]', { hasText: 'Hello from HF fallback' }).first();
    await expect(assistant).toContainText('Hello from HF fallback');
  } catch (err) {
    // Dump diagnostic info
    const html = await page.content();
    console.log('=== HF FALLBACK TEST FAILURE ===');
    console.log('Console logs:', consoles.join('\n') || '<none>');
    console.log('Page HTML (truncated):', html.slice(0, 4000));
    throw err;
  }
});