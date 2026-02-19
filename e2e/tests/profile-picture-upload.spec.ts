import { test, expect } from "@playwright/test";

/**
 * Profile Picture Upload E2E Tests -- Enhanced 3-Step Flow
 *
 * Tests the profile picture upload flow on the /profile/my-information page.
 * Flow: select (tabs: Upload New | Current Photo) -> crop (zoom/drag) -> uploading
 * Note: Actual Firebase upload is not tested in E2E (requires auth);
 *       these tests verify the client-side UI and validation.
 */

// Minimal 1x1 pixel transparent PNG used as a test fixture
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

function testImage() {
  return {
    name: "test-avatar.png",
    mimeType: "image/png" as const,
    buffer: Buffer.from(PNG_BASE64, "base64"),
  };
}

test.describe("Profile Picture Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile/my-information");
  });

  // --------------------------------------------------------------------------
  // Avatar & Camera Button
  // --------------------------------------------------------------------------
  test.describe("Avatar Display", () => {
    test("profile page shows avatar with camera button", async ({ page }) => {
      const cameraBtn = page.getByTestId("profile-picture-camera-btn");
      await expect(cameraBtn).toBeVisible();
      await expect(cameraBtn).toHaveAttribute(
        "aria-label",
        "Change profile picture",
      );
    });

    test("avatar has hover overlay for changing picture", async ({ page }) => {
      const overlay = page.getByTestId("profile-picture-overlay");
      await expect(overlay).toBeVisible();
      await expect(overlay).toHaveAttribute(
        "aria-label",
        "Change profile picture",
      );
    });
  });

  // --------------------------------------------------------------------------
  // Dialog - Select Step
  // --------------------------------------------------------------------------
  test.describe("Dialog - Select Step", () => {
    test("clicking camera button opens upload dialog", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      await expect(page.getByText("Update Profile Picture")).toBeVisible();
      await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
      await expect(page.getByText(/JPEG, PNG, or WebP/)).toBeVisible();
    });

    test("dialog has Upload New and Current Photo tabs", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      await expect(page.getByRole("tab", { name: "Upload New" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Current Photo" })).toBeVisible();
    });

    test("upload dialog can be closed with Cancel", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await expect(page.getByText("Update Profile Picture")).toBeVisible();

      await page.getByRole("button", { name: /cancel/i }).click();

      await expect(page.getByText("Update Profile Picture")).toBeHidden();
    });

    test("dropzone shows accepted format info", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      await expect(page.getByText(/JPEG, PNG, or WebP/)).toBeVisible();
    });

    test("dialog shows description with max file size", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      await expect(page.getByText("Update Profile Picture")).toBeVisible();
      await expect(page.getByText(/Max size:/)).toBeVisible();
    });

    test("dropzone has keyboard accessibility attributes", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const dropzone = page.getByTestId("profile-picture-dropzone");
      await expect(dropzone).toHaveAttribute("role", "button");
      await expect(dropzone).toHaveAttribute("tabindex", "0");
    });

    test("file input accepts only image MIME types", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      const accept = await fileInput.getAttribute("accept");
      expect(accept).toContain("image/jpeg");
      expect(accept).toContain("image/png");
      expect(accept).toContain("image/webp");
    });

    test("Current Photo tab shows current avatar", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      await page.getByRole("tab", { name: "Current Photo" }).click();

      await expect(page.getByAltText("Current profile picture")).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // Dialog - Crop Step
  // --------------------------------------------------------------------------
  test.describe("Dialog - Crop Step", () => {
    test("selecting an image transitions to crop step", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await fileInput.setInputFiles(testImage());

      // Should show crop step title
      await expect(page.getByText("Adjust Your Photo")).toBeVisible();
    });

    test("crop step shows crop editor", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await fileInput.setInputFiles(testImage());

      await expect(page.getByTestId("image-crop-editor")).toBeVisible();
    });

    test("crop step has Choose Different and Save Photo buttons", async ({
      page,
    }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await fileInput.setInputFiles(testImage());

      await expect(
        page.getByRole("button", { name: /choose different/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /save photo/i }),
      ).toBeVisible();
    });

    test("Choose Different returns to select step", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await fileInput.setInputFiles(testImage());

      await expect(page.getByText("Adjust Your Photo")).toBeVisible();

      await page.getByRole("button", { name: /choose different/i }).click();

      // Should return to select step
      await expect(page.getByText("Update Profile Picture")).toBeVisible();
      await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
    });

    test("crop step shows zoom controls", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await fileInput.setInputFiles(testImage());

      await expect(page.getByTestId("zoom-controls")).toBeVisible();
    });

    test("crop description tells user to zoom and drag", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await fileInput.setInputFiles(testImage());

      await expect(
        page.getByText(/zoom and drag to adjust/i),
      ).toBeVisible();
    });
  });
});
