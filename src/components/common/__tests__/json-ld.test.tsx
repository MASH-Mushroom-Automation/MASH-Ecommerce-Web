import { render, screen } from "@testing-library/react";
import {
  JsonLd,
  productJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "../json-ld";

describe("JsonLd", () => {
  it("should render a script tag with application/ld+json type", () => {
    const data = { "@context": "https://schema.org", "@type": "Product" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    expect(JSON.parse(script!.innerHTML)).toEqual(data);
  });
});

describe("productJsonLd", () => {
  it("should generate minimal product JSON-LD", () => {
    const result = productJsonLd({ name: "Oyster Mushroom", price: 250 });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Product");
    expect(result.name).toBe("Oyster Mushroom");
    expect((result.offers as any).price).toBe(250);
    expect((result.offers as any).priceCurrency).toBe("PHP");
    expect((result.offers as any).availability).toBe("https://schema.org/InStock");
  });

  it("should include optional description and image", () => {
    const result = productJsonLd({
      name: "Shiitake",
      price: 400,
      description: "Premium dried shiitake",
      image: "https://example.com/shiitake.jpg",
    });
    expect(result.description).toBe("Premium dried shiitake");
    expect(result.image).toBe("https://example.com/shiitake.jpg");
  });

  it("should include brand when provided", () => {
    const result = productJsonLd({
      name: "Product",
      price: 100,
      brand: "MASH",
    });
    expect((result.brand as any)["@type"]).toBe("Brand");
    expect((result.brand as any).name).toBe("MASH");
  });

  it("should include aggregate rating when both rating and reviewCount provided", () => {
    const result = productJsonLd({
      name: "Product",
      price: 100,
      rating: 4.5,
      reviewCount: 12,
    });
    const rating = result.aggregateRating as any;
    expect(rating["@type"]).toBe("AggregateRating");
    expect(rating.ratingValue).toBe(4.5);
    expect(rating.reviewCount).toBe(12);
  });

  it("should not include rating without reviewCount", () => {
    const result = productJsonLd({
      name: "Product",
      price: 100,
      rating: 4.5,
    });
    expect(result.aggregateRating).toBeUndefined();
  });

  it("should include sku and url when provided", () => {
    const result = productJsonLd({
      name: "Product",
      price: 100,
      sku: "SKU-001",
      url: "https://mashmarket.app/product/1",
    });
    expect(result.sku).toBe("SKU-001");
    expect(result.url).toBe("https://mashmarket.app/product/1");
  });

  it("should use custom currency and availability", () => {
    const result = productJsonLd({
      name: "Product",
      price: 100,
      currency: "USD",
      availability: "OutOfStock",
    });
    expect((result.offers as any).priceCurrency).toBe("USD");
    expect((result.offers as any).availability).toBe("https://schema.org/OutOfStock");
  });
});

describe("breadcrumbJsonLd", () => {
  it("should generate breadcrumb list with correct positions", () => {
    const items = [
      { name: "Home", url: "https://mashmarket.app" },
      { name: "Products", url: "https://mashmarket.app/products" },
    ];
    const result = breadcrumbJsonLd(items);
    expect(result["@type"]).toBe("BreadcrumbList");
    const elements = result.itemListElement as any[];
    expect(elements).toHaveLength(2);
    expect(elements[0].position).toBe(1);
    expect(elements[0].name).toBe("Home");
    expect(elements[1].position).toBe(2);
  });
});

describe("organizationJsonLd", () => {
  it("should return MASH organization data", () => {
    const result = organizationJsonLd();
    expect(result["@type"]).toBe("Organization");
    expect(result.name).toBe("MASH Marketplace");
    expect(result.url).toBe("https://www.mashmarket.app");
  });
});
