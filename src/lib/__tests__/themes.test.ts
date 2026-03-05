/**
 * Tests for src/lib/themes.ts
 * Covers: Theme interface compliance, themes data integrity, getThemeByName
 */

import { themes, getThemeByName, type Theme } from "../themes";

describe("themes data", () => {
  it("exports an array with at least one theme", () => {
    expect(Array.isArray(themes)).toBe(true);
    expect(themes.length).toBeGreaterThanOrEqual(1);
  });

  it("each theme has required name and label fields", () => {
    for (const theme of themes) {
      expect(typeof theme.name).toBe("string");
      expect(theme.name.length).toBeGreaterThan(0);
      expect(typeof theme.label).toBe("string");
      expect(theme.label.length).toBeGreaterThan(0);
    }
  });

  it("each theme has light and dark CSS vars", () => {
    for (const theme of themes) {
      expect(theme.cssVars).toBeDefined();
      expect(typeof theme.cssVars.light).toBe("object");
      expect(typeof theme.cssVars.dark).toBe("object");
    }
  });

  it("light and dark modes have matching CSS variable keys", () => {
    for (const theme of themes) {
      const lightKeys = Object.keys(theme.cssVars.light).sort();
      const darkKeys = Object.keys(theme.cssVars.dark).sort();
      expect(lightKeys).toEqual(darkKeys);
    }
  });

  it("CSS vars contain essential keys", () => {
    const requiredKeys = [
      "background",
      "foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "border",
      "ring",
    ];
    for (const theme of themes) {
      for (const key of requiredKeys) {
        expect(theme.cssVars.light).toHaveProperty(key);
        expect(theme.cssVars.dark).toHaveProperty(key);
      }
    }
  });

  it("all CSS var values are non-empty strings", () => {
    for (const theme of themes) {
      for (const [key, value] of Object.entries(theme.cssVars.light)) {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
      for (const [key, value] of Object.entries(theme.cssVars.dark)) {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it("has unique theme names", () => {
    const names = themes.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("includes 'nature' theme", () => {
    const nature = themes.find((t) => t.name === "nature");
    expect(nature).toBeDefined();
    expect(nature!.label).toBe("Nature");
  });

  it("nature theme uses oklch color functions", () => {
    const nature = themes.find((t) => t.name === "nature")!;
    const lightValues = Object.values(nature.cssVars.light);
    // All values should use oklch format
    for (const val of lightValues) {
      expect(val).toMatch(/oklch\(/);
    }
  });
});

describe("getThemeByName", () => {
  it("returns nature theme for 'nature'", () => {
    const theme = getThemeByName("nature");
    expect(theme).toBeDefined();
    expect(theme!.name).toBe("nature");
    expect(theme!.label).toBe("Nature");
  });

  it("returns undefined for non-existent theme", () => {
    expect(getThemeByName("ocean")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getThemeByName("")).toBeUndefined();
  });

  it("is case-sensitive", () => {
    expect(getThemeByName("Nature")).toBeUndefined();
    expect(getThemeByName("NATURE")).toBeUndefined();
  });

  it("returned theme has complete CSS vars", () => {
    const theme = getThemeByName("nature")!;
    expect(Object.keys(theme.cssVars.light).length).toBeGreaterThanOrEqual(10);
    expect(Object.keys(theme.cssVars.dark).length).toBeGreaterThanOrEqual(10);
  });
});
