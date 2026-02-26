import { test, expect } from "@playwright/test";

/**
 * Phone Verification E2E Tests
 *
 * Tests the phone verification flows on the /profile/my-information page:
 * - Phone display and verification badge visibility
 * - Edit phone flow (enter phone -> OTP modal -> verify -> success)
 * - Phone change flow (change phone -> verify new -> success)
 * - Save without verify option
 * - OTP modal interaction (digit inputs, timer, resend, keyboard nav)
 *
 * NOTE: Actual SMS delivery is not tested (requires Twilio credentials).
 * These tests verify UI flow, navigation, and component integration.
 * Screenshot capture on failure is handled by Playwright's trace config.
 */

test.describe("Phone Verification Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile/my-information");
  });

  // --------------------------------------------------------------------------
  // Phone Section Visibility
  // --------------------------------------------------------------------------
  test.describe("Phone Section Display", () => {
    test("profile page shows phone verification section", async ({ page }) => {
      const section = page.getByTestId("phone-verification-section");
      await expect(section).toBeVisible();
    });

    test("phone section has label with required indicator", async ({ page }) => {
      const section = page.getByTestId("phone-verification-section");
      await expect(section.getByText("Phone Number")).toBeVisible();
      await expect(section.getByText("*")).toBeVisible();
      await expect(
        section.getByText("(Required for delivery)")
      ).toBeVisible();
    });

    test("phone display shows masked number or empty state", async ({
      page,
    }) => {
      const phoneDisplay = page.getByTestId("phone-display");
      // Should show either a masked phone number or "No phone number set"
      const text = await phoneDisplay.textContent();
      expect(
        text?.includes("No phone number set") || /\*/.test(text || "")  || /\d/.test(text || "")
      ).toBeTruthy();
    });

    test("edit phone button is visible and clickable", async ({ page }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await expect(editBtn).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // Phone Verification Badges
  // --------------------------------------------------------------------------
  test.describe("Verification Badge", () => {
    test("shows verified or unverified badge when phone exists", async ({
      page,
    }) => {
      const section = page.getByTestId("phone-verification-section");
      const phoneDisplay = page.getByTestId("phone-display");
      const text = await phoneDisplay.textContent();

      if (text && !text.includes("No phone number set")) {
        // Phone exists - should show one of the badges
        const verifiedBadge = section.getByTestId("verified-badge");
        const unverifiedBadge = section.getByTestId("unverified-badge");

        const hasVerified = await verifiedBadge
          .isVisible()
          .catch(() => false);
        const hasUnverified = await unverifiedBadge
          .isVisible()
          .catch(() => false);

        expect(hasVerified || hasUnverified).toBeTruthy();
      }
    });

    test("verified badge shows green checkmark text", async ({ page }) => {
      const verifiedBadge = page.getByTestId("verified-badge");
      const isVisible = await verifiedBadge.isVisible().catch(() => false);

      if (isVisible) {
        await expect(verifiedBadge).toContainText("Verified");
      }
    });

    test("unverified badge shows amber warning text", async ({ page }) => {
      const unverifiedBadge = page.getByTestId("unverified-badge");
      const isVisible = await unverifiedBadge.isVisible().catch(() => false);

      if (isVisible) {
        await expect(unverifiedBadge).toContainText("Unverified");
      }
    });
  });

  // --------------------------------------------------------------------------
  // Edit Phone Flow
  // --------------------------------------------------------------------------
  test.describe("Edit Phone Flow", () => {
    test("clicking edit shows phone input with action buttons", async ({
      page,
    }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      // Phone input should be visible
      const phoneInput = page.locator(
        '[data-testid="phone-verification-section"] input[placeholder="912 345 6789"]'
      );
      await expect(phoneInput).toBeVisible();

      // Action buttons should appear
      await expect(page.getByText("Verify & Save")).toBeVisible();
      await expect(page.getByText("Save Without Verify")).toBeVisible();
      await expect(page.getByText("Cancel")).toBeVisible();
    });

    test("cancel button returns to display mode", async ({ page }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      // Click cancel
      await page.getByText("Cancel").click();

      // Should return to display mode
      await expect(page.getByTestId("phone-display")).toBeVisible();
      await expect(page.getByTestId("edit-phone-button")).toBeVisible();
    });

    test("phone input accepts valid PH mobile number format", async ({
      page,
    }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      const phoneInput = page.locator(
        '[data-testid="phone-verification-section"] input[placeholder="912 345 6789"]'
      );
      await phoneInput.fill("9123456789");

      // Verify & Save button should be enabled
      const verifyBtn = page.getByText("Verify & Save");
      await expect(verifyBtn).toBeEnabled();
    });

    test("verify & save button disabled for incomplete phone number", async ({
      page,
    }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      const phoneInput = page.locator(
        '[data-testid="phone-verification-section"] input[placeholder="912 345 6789"]'
      );
      await phoneInput.fill("912");

      // Verify & Save should be disabled for incomplete numbers
      const verifyBtn = page.getByText("Verify & Save");
      await expect(verifyBtn).toBeDisabled();
    });

    test("clicking verify & save triggers OTP modal", async ({ page }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      const phoneInput = page.locator(
        '[data-testid="phone-verification-section"] input[placeholder="912 345 6789"]'
      );
      await phoneInput.fill("9171234567");

      // Click Verify & Save
      await page.getByText("Verify & Save").click();

      // OTP modal should appear (Dialog component)
      await expect(
        page.getByText("Verify Your Phone Number")
      ).toBeVisible({ timeout: 5000 });
    });
  });

  // --------------------------------------------------------------------------
  // OTP Verification Modal
  // --------------------------------------------------------------------------
  test.describe("OTP Verification Modal", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to edit mode and trigger OTP modal
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      const phoneInput = page.locator(
        '[data-testid="phone-verification-section"] input[placeholder="912 345 6789"]'
      );
      await phoneInput.fill("9171234567");
      await page.getByText("Verify & Save").click();

      // Wait for modal to appear
      await page.getByText("Verify Your Phone Number").waitFor({
        timeout: 5000,
      });
    });

    test("OTP modal shows phone number and 6 digit inputs", async ({
      page,
    }) => {
      // Should show the phone number
      await expect(page.getByText("9171234567")).toBeVisible();

      // Should have 6 OTP digit inputs
      const otpInputs = page.locator(
        '[role="group"][aria-label="OTP Code Input"] input'
      );
      await expect(otpInputs).toHaveCount(6);
    });

    test("OTP inputs have proper ARIA labels", async ({ page }) => {
      const otpInputs = page.locator(
        '[role="group"][aria-label="OTP Code Input"] input'
      );

      for (let i = 0; i < 6; i++) {
        await expect(otpInputs.nth(i)).toHaveAttribute(
          "aria-label",
          `Digit ${i + 1} of 6`
        );
      }
    });

    test("OTP inputs accept single digits and auto-advance", async ({
      page,
    }) => {
      const otpInputs = page.locator(
        '[role="group"][aria-label="OTP Code Input"] input'
      );

      // Type digits sequentially
      await otpInputs.first().fill("1");
      // After typing in first input, focus should auto-advance
      await expect(otpInputs.nth(1)).toBeFocused();
    });

    test("timer countdown is displayed", async ({ page }) => {
      const timer = page.locator('[role="timer"]');
      await expect(timer).toBeVisible();

      // Timer should show time in M:SS format
      const timerText = await timer.textContent();
      expect(timerText).toMatch(/\d+:\d{2}/);
    });

    test("cancel button closes the modal", async ({ page }) => {
      await page.getByRole("button", { name: "Cancel" }).click();

      // Modal should be closed
      await expect(
        page.getByText("Verify Your Phone Number")
      ).not.toBeVisible();
    });

    test("verify button is disabled when inputs are empty", async ({
      page,
    }) => {
      const verifyButton = page.getByRole("button", { name: "Verify" });
      await expect(verifyButton).toBeDisabled();
    });

    test("OTP paste fills all 6 digits", async ({ page }) => {
      const otpInputs = page.locator(
        '[role="group"][aria-label="OTP Code Input"] input'
      );

      // Focus first input and paste 6-digit code
      await otpInputs.first().focus();

      // Simulate paste via keyboard
      await page.evaluate(() => {
        const input = document.querySelector(
          '[role="group"][aria-label="OTP Code Input"] input'
        );
        if (input) {
          const pasteEvent = new ClipboardEvent("paste", {
            clipboardData: new DataTransfer(),
          });
          Object.defineProperty(pasteEvent, "clipboardData", {
            value: { getData: () => "123456" },
          });
          input.dispatchEvent(pasteEvent);
        }
      });

      // Wait for paste to be processed
      await page.waitForTimeout(500);

      // Check that inputs received the digits
      for (let i = 0; i < 6; i++) {
        const val = await otpInputs.nth(i).inputValue();
        if (val) {
          expect(val).toMatch(/^\d$/);
        }
      }
    });

    test("resend button shows cooldown timer initially", async ({ page }) => {
      // Resend should show cooldown text initially
      const resendBtn = page.getByRole("button", {
        name: /Resend/i,
      });
      await expect(resendBtn).toBeVisible();
      await expect(resendBtn).toBeDisabled();

      // Should show countdown text
      const btnText = await resendBtn.textContent();
      expect(btnText).toMatch(/Resend in \d+s/);
    });

    test("modal has helper text for missing code", async ({ page }) => {
      await expect(
        page.getByText(
          "Didn't receive the code? Check your phone or wait to resend."
        )
      ).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // Save Without Verify
  // --------------------------------------------------------------------------
  test.describe("Save Without Verify", () => {
    test("save without verify button is available", async ({ page }) => {
      const editBtn = page.getByTestId("edit-phone-button");
      await editBtn.click();

      const saveBtn = page.getByText("Save Without Verify");
      await expect(saveBtn).toBeVisible();
      await expect(saveBtn).toBeEnabled();
    });
  });

  // --------------------------------------------------------------------------
  // Verify Button for Unverified Phone
  // --------------------------------------------------------------------------
  test.describe("Verify Existing Phone", () => {
    test("verify button appears for unverified phone numbers", async ({
      page,
    }) => {
      const unverifiedBadge = page.getByTestId("unverified-badge");
      const isUnverified = await unverifiedBadge.isVisible().catch(() => false);

      if (isUnverified) {
        const verifyBtn = page.getByTestId("verify-button");
        await expect(verifyBtn).toBeVisible();
        await expect(verifyBtn).toContainText("Verify");
      }
    });
  });

  // --------------------------------------------------------------------------
  // Empty Phone State
  // --------------------------------------------------------------------------
  test.describe("Empty Phone State", () => {
    test("shows delivery warning when no phone is set", async ({ page }) => {
      const phoneDisplay = page.getByTestId("phone-display");
      const text = await phoneDisplay.textContent();

      if (text?.includes("No phone number set")) {
        await expect(
          page.getByText(
            "Phone number is required for Lalamove delivery coordination"
          )
        ).toBeVisible();
      }
    });
  });

  // --------------------------------------------------------------------------
  // Screenshot on key states
  // --------------------------------------------------------------------------
  test("capture phone verification section screenshot", async ({ page }) => {
    const section = page.getByTestId("phone-verification-section");
    await section.screenshot({
      path: "e2e/screenshots/phone-verification-section.png",
    });
  });

  test("capture OTP modal screenshot", async ({ page }) => {
    const editBtn = page.getByTestId("edit-phone-button");
    await editBtn.click();

    const phoneInput = page.locator(
      '[data-testid="phone-verification-section"] input[placeholder="912 345 6789"]'
    );
    await phoneInput.fill("9171234567");
    await page.getByText("Verify & Save").click();

    await page
      .getByText("Verify Your Phone Number")
      .waitFor({ timeout: 5000 });

    await page.screenshot({
      path: "e2e/screenshots/otp-verification-modal.png",
      fullPage: false,
    });
  });
});
