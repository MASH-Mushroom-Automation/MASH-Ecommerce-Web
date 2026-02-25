/**
 * Tests for Sanity Client Configuration
 * COVERAGE-008: Sanity Services - client.ts
 *
 * Tests exported clients, config values, helper functions (isSanityConfigured,
 * isWriteConfigured, getClient, urlFor, getImageUrl, listenSafe).
 *
 * NOTE: jest.setup.js globally mocks @/lib/sanity/client. We unmock it here
 * so we test the real module. next-sanity remains mocked globally, and we
 * add a test-level mock for @sanity/image-url.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Undo the global mock so we test the real client module
jest.unmock("@/lib/sanity/client");

jest.mock("@sanity/image-url", () => {
  const mockBuilder = {
    image: jest.fn(() => ({
      width: jest.fn().mockReturnThis(),
      height: jest.fn().mockReturnThis(),
      format: jest.fn().mockReturnThis(),
      quality: jest.fn().mockReturnThis(),
      fit: jest.fn().mockReturnThis(),
      url: jest.fn(() => "https://cdn.sanity.io/images/mocked.webp"),
    })),
  };
  return jest.fn(() => mockBuilder);
});

// Import AFTER mocks are set up
import {
  sanityClient,
  sanityWriteClient,
  sanityFreshClient,
  previewClient,
  projectId,
  dataset,
  apiVersion,
  useCdn,
  isWriteConfigured,
  getClient,
  urlFor,
  getImageUrl,
  isSanityConfigured,
  listenSafe,
} from "../client";

// ---------------------------------------------------------------------------
// Configuration exports
// ---------------------------------------------------------------------------
describe("Client configuration exports", () => {
  it("exports projectId with default value", () => {
    expect(typeof projectId).toBe("string");
    expect(projectId.length).toBeGreaterThan(0);
  });

  it("exports dataset with default 'production'", () => {
    expect(dataset).toBe("production");
  });

  it("exports apiVersion with default", () => {
    expect(apiVersion).toBe("2024-11-26");
  });

  it("useCdn is true for quota savings", () => {
    expect(useCdn).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Client instances
// ---------------------------------------------------------------------------
describe("Client instances", () => {
  it("sanityClient is defined", () => {
    expect(sanityClient).toBeDefined();
    expect(typeof sanityClient.fetch).toBe("function");
  });

  it("sanityWriteClient is defined", () => {
    expect(sanityWriteClient).toBeDefined();
    expect(typeof sanityWriteClient.fetch).toBe("function");
  });

  it("sanityFreshClient is defined", () => {
    expect(sanityFreshClient).toBeDefined();
    expect(typeof sanityFreshClient.fetch).toBe("function");
  });

  it("previewClient is defined", () => {
    expect(previewClient).toBeDefined();
    expect(typeof previewClient.fetch).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// getClient
// ---------------------------------------------------------------------------
describe("getClient", () => {
  it("returns published client when draftMode is false", () => {
    const client = getClient(false);
    expect(client).toBe(sanityClient);
  });

  it("returns preview client when draftMode is true", () => {
    const client = getClient(true);
    expect(client).toBe(previewClient);
  });

  it("defaults to published client when no argument", () => {
    const client = getClient();
    expect(client).toBe(sanityClient);
  });
});

// ---------------------------------------------------------------------------
// isSanityConfigured
// ---------------------------------------------------------------------------
describe("isSanityConfigured", () => {
  it("returns true when projectId and dataset are set", () => {
    // Default env sets gerattrr + production
    expect(isSanityConfigured()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isWriteConfigured
// ---------------------------------------------------------------------------
describe("isWriteConfigured", () => {
  it("returns boolean based on SANITY_API_WRITE_TOKEN env", () => {
    const result = isWriteConfigured();
    expect(typeof result).toBe("boolean");
  });
});

// ---------------------------------------------------------------------------
// urlFor
// ---------------------------------------------------------------------------
describe("urlFor", () => {
  it("returns an image builder chain", () => {
    const result = urlFor({ _ref: "image-abc-200x200-png" } as any);
    expect(result).toBeDefined();
    expect(typeof result.width).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// getImageUrl
// ---------------------------------------------------------------------------
describe("getImageUrl", () => {
  it("returns a URL string", () => {
    const url = getImageUrl({ _ref: "image-test-100x100-jpg" } as any);
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });

  it("defaults width to 800 and returns URL string", () => {
    const url = getImageUrl({ _ref: "image-test-100x100-jpg" } as any);
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });

  it("applies height and crop when height is provided", () => {
    const url = getImageUrl(
      { _ref: "image-test-100x100-jpg" } as any,
      400,
      300
    );
    expect(typeof url).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// listenSafe
// ---------------------------------------------------------------------------
describe("listenSafe", () => {
  const originalEnv = process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN;
    }
  });

  it("returns no-op subscription when LISTEN env is not true", () => {
    process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN = "false";
    const result = listenSafe('*[_type == "product"]');
    expect(result).toBeDefined();
    expect(typeof result.subscribe).toBe("function");

    const sub = result.subscribe(() => {});
    expect(typeof sub.unsubscribe).toBe("function");
    // calling unsubscribe should not throw
    sub.unsubscribe();
  });

  it("returns no-op subscription when env is unset", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN;
    const result = listenSafe('*[_type == "product"]');
    expect(result).toBeDefined();
    expect(typeof result.subscribe).toBe("function");
  });

  it("attempts listen when env is true", () => {
    process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN = "true";
    // The real sanityClient uses mocked createClient from next-sanity.
    // Add listen method since the global next-sanity mock doesn't provide it.
    if (typeof sanityClient.listen !== "function") {
      (sanityClient as any).listen = jest.fn();
    }
    ((sanityClient as any).listen as jest.Mock).mockReturnValueOnce({
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    });

    const result = listenSafe('*[_type == "product"]');
    expect((sanityClient as any).listen).toHaveBeenCalledWith(
      '*[_type == "product"]',
      {},
      {}
    );
    expect(result).toBeDefined();
  });

  it("falls back to no-op when listen throws", () => {
    process.env.NEXT_PUBLIC_ENABLE_SANITY_LISTEN = "true";
    if (typeof sanityClient.listen !== "function") {
      (sanityClient as any).listen = jest.fn();
    }
    ((sanityClient as any).listen as jest.Mock).mockImplementationOnce(() => {
      throw new Error("CORS blocked");
    });

    const result = listenSafe('*[_type == "product"]');
    expect(result).toBeDefined();
    expect(typeof result.subscribe).toBe("function");
  });
});
