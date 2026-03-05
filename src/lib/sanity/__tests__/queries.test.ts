/**
 * Tests for Sanity GROQ Queries
 * COVERAGE-008: Sanity Services - queries.ts
 *
 * Validates all 14 exported GROQ query constants exist, are non-empty strings,
 * and contain expected patterns (coalesce for images, draft filtering, ordering).
 */

import {
  suggestedProductsByGrowerQuery,
  wishlistProductsQuery,
  productsQuery,
  productBySlugQuery,
  featuredProductsQuery,
  promoProductsQuery,
  productsByCategoryQuery,
  categoriesQuery,
  categoryBySlugQuery,
  heroCarouselQuery,
  featuredProductsSingletonQuery,
  settingsQuery,
  postsQuery,
  postBySlugQuery,
} from "../queries";

// ---------------------------------------------------------------------------
// All queries export non-empty strings
// ---------------------------------------------------------------------------
describe("GROQ query exports", () => {
  const queryMap: Record<string, string> = {
    suggestedProductsByGrowerQuery,
    wishlistProductsQuery,
    productsQuery,
    productBySlugQuery,
    featuredProductsQuery,
    promoProductsQuery,
    productsByCategoryQuery,
    categoriesQuery,
    categoryBySlugQuery,
    heroCarouselQuery,
    featuredProductsSingletonQuery,
    settingsQuery,
    postsQuery,
    postBySlugQuery,
  };

  it.each(Object.entries(queryMap))("%s is a non-empty string", (name, value) => {
    expect(typeof value).toBe("string");
    expect(value.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Product queries use coalesce for image compatibility
// ---------------------------------------------------------------------------
describe("Image coalesce pattern", () => {
  const productQueries = [
    { name: "productsQuery", query: productsQuery },
    { name: "productBySlugQuery", query: productBySlugQuery },
    { name: "featuredProductsQuery", query: featuredProductsQuery },
    { name: "promoProductsQuery", query: promoProductsQuery },
    { name: "productsByCategoryQuery", query: productsByCategoryQuery },
    { name: "suggestedProductsByGrowerQuery", query: suggestedProductsByGrowerQuery },
    { name: "wishlistProductsQuery", query: wishlistProductsQuery },
    { name: "featuredProductsSingletonQuery", query: featuredProductsSingletonQuery },
    { name: "categoryBySlugQuery", query: categoryBySlugQuery },
  ];

  it.each(productQueries)(
    "$name uses coalesce for mainImage",
    ({ query }) => {
      expect(query).toContain("coalesce(mainImage.asset->url, image.asset->url)");
    }
  );
});

// ---------------------------------------------------------------------------
// Draft filtering pattern
// ---------------------------------------------------------------------------
describe("Draft filtering", () => {
  // Only queries that actually include draft filtering
  const filteredQueries = [
    { name: "productsQuery", query: productsQuery },
    { name: "featuredProductsQuery", query: featuredProductsQuery },
    { name: "promoProductsQuery", query: promoProductsQuery },
    { name: "productsByCategoryQuery", query: productsByCategoryQuery },
    { name: "categoriesQuery", query: categoriesQuery },
    { name: "postsQuery", query: postsQuery },
    { name: "wishlistProductsQuery", query: wishlistProductsQuery },
  ];

  it.each(filteredQueries)(
    '$name filters out drafts with path("drafts.**")',
    ({ query }) => {
      expect(query).toContain('drafts.**');
    }
  );
});

// ---------------------------------------------------------------------------
// Type filters
// ---------------------------------------------------------------------------
describe("Type filters", () => {
  it("productsQuery targets product type", () => {
    expect(productsQuery).toContain('_type == "product"');
  });

  it("categoriesQuery targets category type", () => {
    expect(categoriesQuery).toContain('_type == "category"');
  });

  it("postsQuery targets post type", () => {
    expect(postsQuery).toContain('_type == "post"');
  });

  it("heroCarouselQuery targets heroCarousel type", () => {
    expect(heroCarouselQuery).toContain('_type == "heroCarousel"');
  });

  it("settingsQuery targets settings type", () => {
    expect(settingsQuery).toContain('_type == "settings"');
  });

  it("featuredProductsSingletonQuery targets featuredProducts type", () => {
    expect(featuredProductsSingletonQuery).toContain('_type == "featuredProducts"');
  });
});

// ---------------------------------------------------------------------------
// Parameter placeholders
// ---------------------------------------------------------------------------
describe("Query parameters", () => {
  it("productBySlugQuery uses $slug parameter", () => {
    expect(productBySlugQuery).toContain("$slug");
  });

  it("categoryBySlugQuery uses $slug parameter", () => {
    expect(categoryBySlugQuery).toContain("$slug");
  });

  it("postBySlugQuery uses $slug parameter", () => {
    expect(postBySlugQuery).toContain("$slug");
  });

  it("productsByCategoryQuery uses $categorySlug parameter", () => {
    expect(productsByCategoryQuery).toContain("$categorySlug");
  });

  it("suggestedProductsByGrowerQuery uses $currentProductId and $growerId", () => {
    expect(suggestedProductsByGrowerQuery).toContain("$currentProductId");
    expect(suggestedProductsByGrowerQuery).toContain("$growerId");
  });

  it("wishlistProductsQuery uses $ids parameter", () => {
    expect(wishlistProductsQuery).toContain("$ids");
  });

  it("suggestedProductsByGrowerQuery uses $limit parameter", () => {
    expect(suggestedProductsByGrowerQuery).toContain("$limit");
  });
});

// ---------------------------------------------------------------------------
// Ordering / limits
// ---------------------------------------------------------------------------
describe("Ordering and limits", () => {
  it("productsQuery orders by name ascending", () => {
    expect(productsQuery).toContain("order(name asc)");
  });

  it("featuredProductsQuery is limited to 8 items", () => {
    expect(featuredProductsQuery).toContain("[0...8]");
  });

  it("postsQuery orders by publishedAt descending", () => {
    expect(postsQuery).toContain("order(publishedAt desc)");
  });

  it("promoProductsQuery orders by promoEndDate ascending", () => {
    expect(promoProductsQuery).toContain("order(promoEndDate asc)");
  });

  it("categoriesQuery orders by name ascending", () => {
    expect(categoriesQuery).toContain("order(name asc)");
  });
});

// ---------------------------------------------------------------------------
// Projections / field presence
// ---------------------------------------------------------------------------
describe("Projected fields", () => {
  it("categoriesQuery includes productCount aggregation", () => {
    expect(categoriesQuery).toContain("productCount");
    expect(categoriesQuery).toContain("count(");
  });

  it("productsQuery includes category reference", () => {
    expect(productsQuery).toContain("category->");
  });

  it("productsQuery includes subcategory reference", () => {
    expect(productsQuery).toContain("subcategory->");
  });

  it("postsQuery includes author reference", () => {
    expect(postsQuery).toContain("author->");
  });

  it("heroCarouselQuery includes slides array", () => {
    expect(heroCarouselQuery).toContain("slides[]");
  });

  it("settingsQuery includes ogImage", () => {
    expect(settingsQuery).toContain("ogImage");
  });

  it("featuredProductsSingletonQuery dereferences products", () => {
    expect(featuredProductsSingletonQuery).toContain("products[]->");
  });

  it("categoryBySlugQuery nests product reference", () => {
    expect(categoryBySlugQuery).toContain("references(^._id)");
  });

  it("featuredProductsQuery selects isFeatured products", () => {
    expect(featuredProductsQuery).toContain("isFeatured == true");
  });

  it("promoProductsQuery selects isPromo products", () => {
    expect(promoProductsQuery).toContain("isPromo == true");
  });
});
