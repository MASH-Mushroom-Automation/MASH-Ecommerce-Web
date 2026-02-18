import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Profile Picture Upload E2E Tests
 *
 * Tests the profile picture upload flow on the /profile/my-information page.
 * Uses a small test fixture image to validate the upload dialog UI.
 * Note: Actual Firebase upload is not tested in E2E (requires auth);
 *       these tests verify the client-side UI and validation.
 */

const TEST_IMAGE = path.resolve(__dirname, "..", "screenshots", "test-avatar.png");

test.describe("Profile Picture Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile/my-information");
  });

  test("profile page shows avatar with camera button", async ({ page }) => {
    const cameraBtn = page.getByTestId("profile-picture-camera-btn");
    await expect(cameraBtn).toBeVisible();
    await expect(cameraBtn).toHaveAttribute(
      "aria-label",
      "Change profile picture",
    );
  });

  test("clicking camera button opens upload dialog", async ({ page }) => {
    await page.getByTestId("profile-picture-camera-btn").click();

    await expect(page.getByText("Update Profile Picture")).toBeVisible();
    await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
    await expect(page.getByText(/JPEG, PNG, WebP/)).toBeVisible();
  });

  test("upload dialog can be closed with Cancel", async ({ page }) => {
    await page.getByTestId("profile-picture-camera-btn").click();
    await expect(page.getByText("Update Profile Picture")).toBeVisible();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByText("Update Profile Picture")).toBeHidden();
  });

  test("upload button is disabled when no file is selected", async ({
    page,
  }) => {
    await page.getByTestId("profile-picture-camera-btn").click();

    const uploadBtn = page.getByTestId("profile-picture-upload-btn");
    await expect(uploadBtn).toBeDisabled();
  });

  test("selecting an image shows preview and enables upload button", async ({
    page,
  }) => {
    await page.getByTestId("profile-picture-camera-btn").click();

    // Create a small 1x1 PNG file for testing
    const fileInput = page.getByTestId("profile-picture-file-input");

    // Generate a minimal PNG buffer (1x1 pixel, red)
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(pngBase64, "base64");

    await fileInput.setInputFiles({
      name: "test-avatar.png",
      mimeType: "image/png",
      buffer,
    });

    // Preview should appear
    await expect(page.getByAltText("Preview")).toBeVisible();

    // Upload button should be enabled
    const uploadBtn = page.getByTestId("profile-picture-upload-btn");
    await expect(uploadBtn).toBeEnabled();
  });

  test("remove button clears selected file and returns to dropzone", async ({
    page,
  }) => {
    await page.getByTestId("profile-picture-camera-btn").click();

    const fileInput = page.getByTestId("profile-picture-file-input");

    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(pngBase64, "base64");

    await fileInput.setInputFiles({
      name: "test-avatar.png",
      mimeType: "image/png",
      buffer,
    });

    await expect(page.getByAltText("Preview")).toBeVisible();

    // Click remove button
    await page.getByTestId("profile-picture-remove-btn").click();

    // Should return to dropzone
    await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
    await expect(page.getByAltText("Preview")).toBeHidden();
  });
});
