/**
 * Review Sync Utility Tests
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { syncReviewToSanity, syncReviewFromSanity } from "../sync";

describe("syncReviewToSanity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should POST review data to sync-to-sanity endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    syncReviewToSanity("review-1", { rating: 5, comment: "Great!" });

    // Let the promise chain resolve
    await new Promise((r) => setTimeout(r, 10));

    expect(mockFetch).toHaveBeenCalledWith("/api/reviews/sync-to-sanity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: "review-1", reviewData: { rating: 5, comment: "Great!" } }),
    });
  });

  it("should log warning on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    syncReviewToSanity("review-2", { rating: 3 });
    await new Promise((r) => setTimeout(r, 10));

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("review-2"));
    warnSpy.mockRestore();
  });

  it("should log error on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    syncReviewToSanity("review-3", {});
    await new Promise((r) => setTimeout(r, 10));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("review-3"),
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

describe("syncReviewFromSanity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should POST sanityId to sync-from-sanity endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    syncReviewFromSanity("sanity-abc");
    await new Promise((r) => setTimeout(r, 10));

    expect(mockFetch).toHaveBeenCalledWith("/api/reviews/sync-from-sanity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sanityId: "sanity-abc" }),
    });
  });

  it("should log warning on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    syncReviewFromSanity("sanity-xyz");
    await new Promise((r) => setTimeout(r, 10));

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("sanity-xyz"));
    warnSpy.mockRestore();
  });

  it("should log error on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Connection refused"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    syncReviewFromSanity("sanity-err");
    await new Promise((r) => setTimeout(r, 10));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("sanity-err"),
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});
