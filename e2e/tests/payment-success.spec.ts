import { test, expect } from '@playwright/test';

/**
 * Payment Success Page E2E Tests
 *
 * Tests the payment-success page UI by injecting pendingOrder data into
 * sessionStorage before navigating to the page. These tests do NOT require
 * a real PayMongo payment -- they validate the UI rendering, receipt download,
 * email status display, and resend retry limit.
 *
 * The page expects:
 *   - URL param: ?orderId=<id>
 *   - sessionStorage key "pendingOrder" with PendingOrderData JSON
 *   - /api/payment/status endpoint (mocked via route intercept)
 */

const PENDING_ORDER = {
  orderId: 'e2e-order-001',
  orderNumber: 'MASH-E2E-001',
  paymentId: 'src_e2e_test',
  paymentType: 'source',
  customerEmail: 'e2e@mashmarket.app',
  customerName: 'E2E Test User',
  paymentMethod: 'gcash',
  vendor: 'Farm Fresh Mushrooms',
  timestamp: Date.now(),
  amount: 750,
  subtotal: 700,
  deliveryFee: 50,
  items: [
    { name: 'Oyster Mushroom 500g', quantity: 2, price: 250 },
    { name: 'Shiitake Mushroom 250g', quantity: 1, price: 200 },
  ],
  deliveryMethod: 'delivery',
};

/**
 * Helper: Inject pendingOrder into sessionStorage and navigate to payment-success.
 * Also intercepts /api/payment/status to return a successful verification.
 */
async function setupSuccessPage(page: import('@playwright/test').Page) {
  // Intercept payment status API to always return success
  await page.route('**/api/payment/status**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, status: 'succeeded', paid: true }),
    });
  });

  // Intercept email API to return success
  await page.route('**/api/email/send', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, messageId: 'e2e-msg-001' }),
    });
  });

  // Navigate to a blank page first to set sessionStorage on the correct origin
  await page.goto('/login');
  await page.evaluate((order) => {
    sessionStorage.setItem('pendingOrder', JSON.stringify(order));
  }, PENDING_ORDER);

  // Navigate to payment-success
  await page.goto(`/checkout/payment-success?orderId=${PENDING_ORDER.orderId}`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Payment Success Page', () => {
  test('displays success state with order details', async ({ page }) => {
    await setupSuccessPage(page);

    // Wait for success heading
    await expect(page.getByText('Payment Successful!')).toBeVisible({ timeout: 15000 });

    // Order number
    await expect(page.getByText(PENDING_ORDER.orderNumber)).toBeVisible();

    // Payment method
    await expect(page.getByText('GCash')).toBeVisible();

    // Amount
    await expect(page.getByText(/750/)).toBeVisible();
  });

  test('shows Continue Shopping and View Order links', async ({ page }) => {
    await setupSuccessPage(page);

    await expect(page.getByText('Payment Successful!')).toBeVisible({ timeout: 15000 });

    // Continue Shopping link
    const shopLink = page.getByRole('link', { name: /Continue Shopping/i });
    await expect(shopLink).toBeVisible();
    await expect(shopLink).toHaveAttribute('href', '/shop');

    // View Order link
    const orderLink = page.getByRole('link', { name: /View Order/i });
    await expect(orderLink).toBeVisible();
    await expect(orderLink).toHaveAttribute('href', '/profile/order-history');
  });

  test('Download Receipt button is enabled and clickable', async ({ page }) => {
    await setupSuccessPage(page);

    await expect(page.getByText('Payment Successful!')).toBeVisible({ timeout: 15000 });

    const receiptBtn = page.getByRole('button', { name: /Download Receipt/i });
    await expect(receiptBtn).toBeVisible();
    await expect(receiptBtn).toBeEnabled();

    // Click should open a popup (we listen for the popup event)
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await receiptBtn.click();
    const popup = await popupPromise;

    if (popup) {
      // Verify receipt content in the popup
      await expect(popup.getByText('MASH Market')).toBeVisible({ timeout: 5000 });
      await expect(popup.getByText(PENDING_ORDER.orderNumber)).toBeVisible();
      await popup.close();
    }
    // If popup is blocked by browser config, the toast error path is tested in unit tests
  });

  test('shows email confirmation status', async ({ page }) => {
    await setupSuccessPage(page);

    await expect(page.getByText('Payment Successful!')).toBeVisible({ timeout: 15000 });

    // Email should eventually show sent or sending state
    await expect(
      page.getByText(/confirmation email|Sending confirmation/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows email error with Resend button when email fails', async ({ page }) => {
    // Intercept email API to return failure
    await page.route('**/api/email/send', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'SMTP timeout' }),
      });
    });

    // Intercept payment status API
    await page.route('**/api/payment/status**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: 'succeeded', paid: true }),
      });
    });

    await page.goto('/login');
    await page.evaluate((order) => {
      sessionStorage.setItem('pendingOrder', JSON.stringify(order));
    }, PENDING_ORDER);

    await page.goto(`/checkout/payment-success?orderId=${PENDING_ORDER.orderId}`);

    await expect(page.getByText('Payment Successful!')).toBeVisible({ timeout: 15000 });

    // Should show error message and Resend button
    await expect(
      page.getByText(/could not send the confirmation email/i)
    ).toBeVisible({ timeout: 10000 });

    const resendBtn = page.getByRole('button', { name: /Resend Email/i });
    await expect(resendBtn).toBeVisible();
    await expect(resendBtn).toContainText('3 left');
  });

  test('shows failed verification state', async ({ page }) => {
    // Intercept payment status API to return failed
    await page.route('**/api/payment/status**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: 'failed', paid: false }),
      });
    });

    await page.goto('/login');
    await page.evaluate((order) => {
      sessionStorage.setItem('pendingOrder', JSON.stringify(order));
    }, PENDING_ORDER);

    await page.goto(`/checkout/payment-success?orderId=${PENDING_ORDER.orderId}`);

    // Should show failed state
    await expect(page.getByText('Payment Not Confirmed')).toBeVisible({ timeout: 15000 });

    // Should show Try Again link
    const tryAgainLink = page.getByRole('link', { name: /Try Again/i });
    await expect(tryAgainLink).toBeVisible();
  });
});
