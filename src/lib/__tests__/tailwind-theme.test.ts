/**
 * Tailwind Theme Configuration Tests
 */
jest.mock("../colors", () => ({
  colors: {
    primary: { dark: "#166534", medium: "#16a34a", light: "#bbf7d0" },
    neutral: { background: "#fafaf9", white: "#ffffff", border: "#e7e5e4" },
    text: { primary: "#1c1917", secondary: "#78716c" },
    status: { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" },
  },
}));

import { theme } from "../tailwind-theme";

describe("tailwind-theme", () => {
  it("should export a theme object with extend property", () => {
    expect(theme).toBeDefined();
    expect(theme.extend).toBeDefined();
  });

  it("should define primary color palette", () => {
    const primary = theme.extend.colors.primary;
    expect(primary.DEFAULT).toBeDefined();
    expect(primary.dark).toBeDefined();
    expect(primary.medium).toBeDefined();
    expect(primary.light).toBeDefined();
  });

  it("should define background and card colors", () => {
    expect(theme.extend.colors.background).toBeDefined();
    expect(theme.extend.colors.card).toBeDefined();
  });

  it("should define status colors", () => {
    expect(theme.extend.colors.success).toBeDefined();
    expect(theme.extend.colors.error).toBeDefined();
    expect(theme.extend.colors.warning).toBeDefined();
    expect(theme.extend.colors.info).toBeDefined();
  });

  it("should define border radius values", () => {
    expect(theme.extend.borderRadius.lg).toBe("0.5rem");
    expect(theme.extend.borderRadius.xl).toBe("0.75rem");
    expect(theme.extend.borderRadius["2xl"]).toBe("1rem");
  });

  it("should define box shadow scale", () => {
    expect(theme.extend.boxShadow.sm).toBeDefined();
    expect(theme.extend.boxShadow.DEFAULT).toBeDefined();
    expect(theme.extend.boxShadow.md).toBeDefined();
    expect(theme.extend.boxShadow.lg).toBeDefined();
  });

  it("should define font size scale", () => {
    expect(theme.extend.fontSize.xs).toBeDefined();
    expect(theme.extend.fontSize.base).toBeDefined();
    expect(theme.extend.fontSize["5xl"]).toBeDefined();
  });

  it("should define font families with Inter and Poppins", () => {
    expect(theme.extend.fontFamily.sans[0]).toBe("Inter");
    expect(theme.extend.fontFamily.display[0]).toBe("Poppins");
  });
});
