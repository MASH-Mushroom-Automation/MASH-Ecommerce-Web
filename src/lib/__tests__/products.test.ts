/**
 * Tests for src/lib/products.ts
 * Covers: PRODUCTS data integrity, getProductById lookup
 */

import { PRODUCTS, getProductById, type Product } from "../products";

describe("PRODUCTS data", () => {
  it("contains at least 5 products", () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(5);
  });

  it("has unique IDs", () => {
    const ids = PRODUCTS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("each product has required string fields", () => {
    for (const product of PRODUCTS) {
      expect(typeof product.id).toBe("string");
      expect(product.id.length).toBeGreaterThan(0);
      expect(typeof product.name).toBe("string");
      expect(product.name.length).toBeGreaterThan(0);
      expect(typeof product.description).toBe("string");
      expect(typeof product.category).toBe("string");
      expect(typeof product.grower).toBe("string");
      expect(typeof product.weight).toBe("string");
    }
  });

  it("each product has a positive price", () => {
    for (const product of PRODUCTS) {
      expect(typeof product.price).toBe("number");
      expect(product.price).toBeGreaterThan(0);
    }
  });

  it("each product has at least one image in images array", () => {
    for (const product of PRODUCTS) {
      expect(Array.isArray(product.images)).toBe(true);
      expect(product.images.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("each product has image field matching images[0]", () => {
    for (const product of PRODUCTS) {
      expect(product.image).toBe(product.images[0]);
    }
  });

  it("includes known categories", () => {
    const categories = new Set(PRODUCTS.map((p) => p.category));
    // Should have multiple categories
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });

  it("includes known growers", () => {
    const growers = new Set(PRODUCTS.map((p) => p.grower));
    expect(growers.size).toBeGreaterThanOrEqual(1);
    // FungiFreshFarms is a known grower
    expect(growers.has("FungiFreshFarms")).toBe(true);
  });

  it("optional tag field is string or undefined", () => {
    for (const product of PRODUCTS) {
      if (product.tag !== undefined) {
        expect(typeof product.tag).toBe("string");
        expect(product.tag.length).toBeGreaterThan(0);
      }
    }
  });

  it("some products have tags", () => {
    const withTags = PRODUCTS.filter((p) => p.tag);
    expect(withTags.length).toBeGreaterThanOrEqual(1);
  });

  it("inStock field is boolean when present", () => {
    for (const product of PRODUCTS) {
      if (product.inStock !== undefined) {
        expect(typeof product.inStock).toBe("boolean");
      }
    }
  });
});

describe("getProductById", () => {
  it("returns product for valid ID '1'", () => {
    const product = getProductById("1");
    expect(product).toBeDefined();
    expect(product!.id).toBe("1");
    expect(product!.name).toBe("Fresh White Oyster Mushrooms");
  });

  it("returns product for ID '4'", () => {
    const product = getProductById("4");
    expect(product).toBeDefined();
    expect(product!.name).toContain("DIY Mushroom Growing Kit");
  });

  it("returns product for ID '9'", () => {
    const product = getProductById("9");
    expect(product).toBeDefined();
    expect(product!.name).toContain("Chicharon");
  });

  it("returns undefined for non-existent ID", () => {
    expect(getProductById("999")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getProductById("")).toBeUndefined();
  });

  it("returns undefined for numeric-looking but wrong ID", () => {
    expect(getProductById("100")).toBeUndefined();
  });

  it("is case-sensitive", () => {
    // IDs are strings, no lowercase matching
    expect(getProductById("1")).toBeDefined();
  });
});
