/**
 * Tests for src/lib/colors.ts
 * Covers: Color palette structure integrity, color value format validation
 */

import { colors, tailwindColors } from "../colors";

describe("colors palette", () => {
  describe("primary colors", () => {
    it("has dark, medium, and light variants", () => {
      expect(colors.primary.dark).toBeDefined();
      expect(colors.primary.medium).toBeDefined();
      expect(colors.primary.light).toBeDefined();
    });

    it("all primary colors are valid hex strings", () => {
      expect(colors.primary.dark).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.primary.medium).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.primary.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("primary.dark is the darkest green", () => {
      expect(colors.primary.dark).toBe("#1E392A");
    });

    it("primary.medium is #6A994E", () => {
      expect(colors.primary.medium).toBe("#6A994E");
    });
  });

  describe("neutral colors", () => {
    it("has white, background, border, and divider", () => {
      expect(colors.neutral.white).toBe("#FFFFFF");
      expect(colors.neutral.background).toBeDefined();
      expect(colors.neutral.border).toBeDefined();
      expect(colors.neutral.divider).toBeDefined();
    });

    it("all neutral colors are hex format", () => {
      for (const value of Object.values(colors.neutral)) {
        expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe("text colors", () => {
    it("has primary, secondary, tertiary, and inverse", () => {
      expect(colors.text.primary).toBeDefined();
      expect(colors.text.secondary).toBeDefined();
      expect(colors.text.tertiary).toBeDefined();
      expect(colors.text.inverse).toBe("#FFFFFF");
    });

    it("all text colors are hex format", () => {
      for (const value of Object.values(colors.text)) {
        expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe("status colors", () => {
    it("has success, error, warning, and info", () => {
      expect(colors.status.success).toBeDefined();
      expect(colors.status.error).toBeDefined();
      expect(colors.status.warning).toBeDefined();
      expect(colors.status.info).toBeDefined();
    });

    it("all status colors are hex format", () => {
      for (const value of Object.values(colors.status)) {
        expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });

    it("success is green", () => {
      expect(colors.status.success).toBe("#10B981");
    });

    it("error is red", () => {
      expect(colors.status.error).toBe("#EF4444");
    });
  });

  describe("opacity values", () => {
    it("has hover, disabled, and overlay", () => {
      expect(colors.opacity.hover).toBeDefined();
      expect(colors.opacity.disabled).toBeDefined();
      expect(colors.opacity.overlay).toBeDefined();
    });

    it("opacity values are numeric strings between 0 and 1", () => {
      for (const value of Object.values(colors.opacity)) {
        const num = parseFloat(value);
        expect(num).toBeGreaterThan(0);
        expect(num).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe("tailwindColors mapping", () => {
  it("maps primary to colors.primary.medium", () => {
    expect(tailwindColors.primary).toBe(colors.primary.medium);
  });

  it("maps primary-dark to colors.primary.dark", () => {
    expect(tailwindColors["primary-dark"]).toBe(colors.primary.dark);
  });

  it("maps primary-light to colors.primary.light", () => {
    expect(tailwindColors["primary-light"]).toBe(colors.primary.light);
  });

  it("maps background to neutral.background", () => {
    expect(tailwindColors.background).toBe(colors.neutral.background);
  });

  it("maps foreground to text.primary", () => {
    expect(tailwindColors.foreground).toBe(colors.text.primary);
  });

  it("maps border to neutral.border", () => {
    expect(tailwindColors.border).toBe(colors.neutral.border);
  });

  it("maps ring to primary.medium", () => {
    expect(tailwindColors.ring).toBe(colors.primary.medium);
  });
});
