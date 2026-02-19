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

// 10x10 red JPEG used as a more realistic test image
const JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS" +
  "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ" +
  "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
  "MjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAA" +
  "AAAAAAUH/8QAIhAAAQMEAgIDAAAAAAAAAAAAAQIDBAAFBhEhMRJBUWFx/8QAFQEBAQAA" +
  "AAAAAAAAAAAAAAAAAwT/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADERL/2gAMAwEAAhED" +
  "EQA/AKmN3a3xbPFMl5KFJbA0Tyo9D+0y/mdrSkhLDqvewBSpeLwmPYgHiQCIjStd6C" +
  "UpP8AaVuV4tDjT0Y7iFgpI8TvlKVfJB9H2KVn/9k=";

function testImage() {
  return {
    name: "test-avatar.png",
    mimeType: "image/png" as const,
    buffer: Buffer.from(PNG_BASE64, "base64"),
  };
}

function testJpeg() {
  return {
    name: "test-photo.jpg",
    mimeType: "image/jpeg" as const,
    buffer: Buffer.from(JPEG_BASE64, "base64"),
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

    test("camera button is a button element", async ({ page }) => {
      const cameraBtn = page.getByTestId("profile-picture-camera-btn");
      await expect(cameraBtn).toHaveAttribute("type", "button");
    });

    test("overlay is keyboard focusable", async ({ page }) => {
      const overlay = page.getByTestId("profile-picture-overlay");
      await expect(overlay).toHaveAttribute("tabindex", "0");
      await expect(overlay).toHaveAttribute("role", "button");
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

    test("opening dialog via overlay click", async ({ page }) => {
      await page.getByTestId("profile-picture-overlay").click();

      await expect(page.getByText("Update Profile Picture")).toBeVisible();
      await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
    });

    test("file input is hidden from view", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const fileInput = page.getByTestId("profile-picture-file-input");
      await expect(fileInput).toBeHidden();
    });

    test("Current Photo tab shows avatar description", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByRole("tab", { name: "Current Photo" }).click();

      // Should show either custom photo or auto-generated description
      const customDesc = page.getByText("Your current custom profile picture");
      const generatedDesc = page.getByText("Auto-generated avatar based on your profile");
      const hasCustom = await customDesc.isVisible().catch(() => false);
      const hasGenerated = await generatedDesc.isVisible().catch(() => false);
      expect(hasCustom || hasGenerated).toBe(true);
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

    test("crop step shows zoom in and zoom out buttons", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByTestId("zoom-in-btn")).toBeVisible();
      await expect(page.getByTestId("zoom-out-btn")).toBeVisible();
    });

    test("zoom out is disabled at minimum zoom", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByTestId("zoom-out-btn")).toBeDisabled();
    });

    test("zoom in button has accessible label", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByTestId("zoom-in-btn")).toHaveAttribute("aria-label", "Zoom in");
      await expect(page.getByTestId("zoom-out-btn")).toHaveAttribute("aria-label", "Zoom out");
    });

    test("crop step has zoom slider", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByTestId("zoom-slider")).toBeVisible();
    });

    test("crop step shows zoom percentage", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByText(/Zoom: \d+%/)).toBeVisible();
    });

    test("crop step has reset button", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByTestId("reset-btn")).toBeVisible();
    });

    test("crop area element is present", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());

      await expect(page.getByTestId("crop-area")).toBeVisible();
    });

    test("selecting a JPEG also transitions to crop step", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testJpeg());

      await expect(page.getByText("Adjust Your Photo")).toBeVisible();
      await expect(page.getByTestId("image-crop-editor")).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // Dialog - Keyboard Navigation
  // --------------------------------------------------------------------------
  test.describe("Keyboard Navigation", () => {
    test("overlay opens dialog on Enter key", async ({ page }) => {
      const overlay = page.getByTestId("profile-picture-overlay");
      await overlay.focus();
      await page.keyboard.press("Enter");

      await expect(page.getByText("Update Profile Picture")).toBeVisible();
    });

    test("overlay opens dialog on Space key", async ({ page }) => {
      const overlay = page.getByTestId("profile-picture-overlay");
      await overlay.focus();
      await page.keyboard.press("Space");

      await expect(page.getByText("Update Profile Picture")).toBeVisible();
    });

    test("dialog can be closed with Escape", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await expect(page.getByText("Update Profile Picture")).toBeVisible();

      await page.keyboard.press("Escape");

      await expect(page.getByText("Update Profile Picture")).toBeHidden();
    });

    test("tabs are navigable with keyboard", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const uploadTab = page.getByRole("tab", { name: "Upload New" });
      const currentTab = page.getByRole("tab", { name: "Current Photo" });

      await uploadTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(currentTab).toBeFocused();

      await page.keyboard.press("ArrowLeft");
      await expect(uploadTab).toBeFocused();
    });
  });

  // --------------------------------------------------------------------------
  // Dialog - State Transitions
  // --------------------------------------------------------------------------
  test.describe("State Transitions", () => {
    test("canceling and reopening resets dialog to select step", async ({ page }) => {
      // Open, select file, go to crop
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());
      await expect(page.getByText("Adjust Your Photo")).toBeVisible();

      // Close dialog
      await page.keyboard.press("Escape");
      await expect(page.getByText("Adjust Your Photo")).toBeHidden();

      // Reopen - should be back on select step
      await page.getByTestId("profile-picture-camera-btn").click();
      await expect(page.getByText("Update Profile Picture")).toBeVisible();
      await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
    });

    test("Choose Different then select new file goes to crop again", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();
      await page.getByTestId("profile-picture-file-input").setInputFiles(testImage());
      await expect(page.getByText("Adjust Your Photo")).toBeVisible();

      // Go back to select step
      await page.getByRole("button", { name: /choose different/i }).click();
      await expect(page.getByText("Update Profile Picture")).toBeVisible();

      // Select a new image
      await page.getByTestId("profile-picture-file-input").setInputFiles(testJpeg());
      await expect(page.getByText("Adjust Your Photo")).toBeVisible();
      await expect(page.getByTestId("image-crop-editor")).toBeVisible();
    });

    test("Upload New tab is active by default", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      const uploadTab = page.getByRole("tab", { name: "Upload New" });
      await expect(uploadTab).toHaveAttribute("data-state", "active");
    });

    test("switching to Current Photo then back preserves dropzone", async ({ page }) => {
      await page.getByTestId("profile-picture-camera-btn").click();

      // Switch to Current Photo tab
      await page.getByRole("tab", { name: "Current Photo" }).click();
      await expect(page.getByAltText("Current profile picture")).toBeVisible();

      // Switch back to Upload New tab
      await page.getByRole("tab", { name: "Upload New" }).click();
      await expect(page.getByTestId("profile-picture-dropzone")).toBeVisible();
    });
  });
});
