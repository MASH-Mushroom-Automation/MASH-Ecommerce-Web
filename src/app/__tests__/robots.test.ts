/**
 * Robots.ts Tests (COV-003)
 * Tests: robots() output, rules, sitemap
 */

import robots from "../../app/robots";

describe("robots()", () => {
  it("should return an object with rules and sitemap", () => {
    const result = robots();
    expect(result).toHaveProperty("rules");
    expect(result).toHaveProperty("sitemap");
  });

  it("should have a wildcard user agent rule", () => {
    const result = robots();
    expect(result.rules).toBeDefined();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find(
      (r) => r.userAgent === "*"
    );
    expect(wildcardRule).toBeDefined();
  });

  it("should allow root path", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules[0];
    expect(wildcardRule.allow).toBe("/");
  });

  it("should disallow sensitive paths", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const disallowed = rules[0].disallow as string[];

    expect(disallowed).toContain("/api/");
    expect(disallowed).toContain("/seller/");
    expect(disallowed).toContain("/profile/");
    expect(disallowed).toContain("/onboarding/");
    expect(disallowed).toContain("/checkout");
  });

  it("should have a valid sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toContain("sitemap.xml");
    expect(result.sitemap).toMatch(/^https?:\/\//);
  });
});
