/**
 * Tests for src/hooks/useSanityBlogPosts.ts
 *
 * Hooks:  useSanityBlogPosts, useSanityBlogPost, useSanityFeaturedBlogPosts
 *
 * All hooks use sanityClient.fetch (globally mocked) and listenSafe for
 * real-time subscriptions.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;
const mockListenSafe = jest.requireMock("@/lib/sanity/client")
  .listenSafe as jest.Mock;

import {
  useSanityBlogPosts,
  useSanityBlogPost,
  useSanityFeaturedBlogPosts,
} from "../useSanityBlogPosts";

// ─── Helpers ──────────────────────────────────────────────────

const makePost = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  _id: id,
  _createdAt: "2025-01-01T00:00:00Z",
  _updatedAt: "2025-06-01T00:00:00Z",
  title: `Post ${id}`,
  slug: { current: `post-${id}` },
  excerpt: `Excerpt for ${id}`,
  body: [{ _type: "block", children: [{ text: "body content here for word count" }] }],
  publishedAt: "2025-03-15T10:00:00Z",
  mainImage: `https://img.test/${id}.jpg`,
  author: {
    name: "MASH Author",
    image: "https://img.test/author.jpg",
    bio: "Bio text",
  },
  categories: [
    { name: "Health Benefits", slug: { current: "health-benefits" } },
  ],
  ...overrides,
});

let listenCallback: ((update: { type: string; result?: unknown }) => void) | null = null;
let listenUnsubscribe: jest.Mock;

beforeEach(() => {
  mockSanityFetch.mockClear();
  listenCallback = null;
  listenUnsubscribe = jest.fn();
  mockListenSafe.mockClear();
  mockListenSafe.mockImplementation(() => ({
    subscribe: jest.fn((cb: (update: { type: string; result?: unknown }) => void) => {
      listenCallback = cb;
      return { unsubscribe: listenUnsubscribe };
    }),
  }));
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityBlogPosts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityBlogPosts", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityBlogPosts());
    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches posts and transforms them", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("p1"), makePost("p2")]);

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts).toHaveLength(2);
    expect(result.current.posts[0].id).toBe("p1");
    expect(result.current.posts[0].title).toBe("Post p1");
    expect(result.current.posts[0].slug).toBe("post-p1");
    expect(result.current.posts[0].author.name).toBe("MASH Author");
    expect(result.current.posts[0].categories).toEqual(["Health Benefits"]);
    expect(typeof result.current.posts[0].readTime).toBe("number");
    expect(result.current.error).toBeNull();
  });

  it("applies category filter in query", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityBlogPosts({ category: "Health Benefits" }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("Health Benefits");
  });

  it("applies author filter in query", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityBlogPosts({ author: "John" }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("John");
  });

  it("applies limit filter in query", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityBlogPosts({ limit: 5 }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("0...5");
  });

  it("handles missing author/categories gracefully", async () => {
    mockSanityFetch.mockResolvedValueOnce([
      makePost("p1", { author: null, categories: null }),
    ]);

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts[0].author.name).toBe("MASH Team");
    expect(result.current.posts[0].categories).toEqual([]);
  });

  it("handles missing body for readTime calculation", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("p1", { body: null })]);

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts[0].readTime).toBe(5); // default
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Sanity unreachable"));

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Sanity unreachable");
    expect(result.current.posts).toEqual([]);
  });

  it("sets up listenSafe subscription and cleans up", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalled();
    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("updates posts on real-time mutation", async () => {
    const original = [makePost("p1")];
    mockSanityFetch.mockResolvedValueOnce(original);

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts).toHaveLength(1);

    // Simulate real-time update with array result
    const updated = makePost("p2", { title: "New Post" });
    act(() => {
      listenCallback?.({ type: "mutation", result: [updated] });
    });

    await waitFor(() => {
      expect(result.current.posts.some((p) => p.id === "p2")).toBe(true);
    });
  });

  it("handles single result in real-time mutation", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("p1")]);

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const single = makePost("p3");
    act(() => {
      listenCallback?.({ type: "mutation", result: single });
    });

    await waitFor(() => {
      expect(result.current.posts.some((p) => p.id === "p3")).toBe(true);
    });
  });

  it("refetch re-fetches data", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("p1")]);

    const { result } = renderHook(() => useSanityBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockSanityFetch.mockResolvedValueOnce([makePost("p1"), makePost("p2")]);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(2));
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityBlogPost (single)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityBlogPost", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityBlogPost("test-slug"));
    expect(result.current.loading).toBe(true);
    expect(result.current.post).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches single post by slug", async () => {
    mockSanityFetch.mockResolvedValueOnce(makePost("p1"));

    const { result } = renderHook(() => useSanityBlogPost("post-p1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.post).not.toBeNull();
    expect(result.current.post!.id).toBe("p1");
    expect(result.current.post!.slug).toBe("post-p1");
    expect(result.current.error).toBeNull();
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.stringContaining("slug.current == $slug"),
      { slug: "post-p1" }
    );
  });

  it("returns null when post not found", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityBlogPost("nonexistent"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.post).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles empty slug gracefully", () => {
    // When slug is empty, useEffect returns early without calling fetchPost,
    // so loading stays true and post stays null (no fetch attempted).
    const { result } = renderHook(() => useSanityBlogPost(""));

    expect(result.current.post).toBeNull();
    expect(mockSanityFetch).not.toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useSanityBlogPost("slug"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Not found");
  });

  it("sets up listenSafe subscription for single post", async () => {
    mockSanityFetch.mockResolvedValueOnce(makePost("p1"));

    const { unmount } = renderHook(() => useSanityBlogPost("post-p1"));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalledWith(
      expect.stringContaining("slug.current == $slug"),
      { slug: "post-p1" },
      expect.any(Object)
    );

    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("updates post on real-time mutation", async () => {
    mockSanityFetch.mockResolvedValueOnce(makePost("p1", { title: "Original" }));

    const { result } = renderHook(() => useSanityBlogPost("post-p1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post!.title).toBe("Original");

    const updated = makePost("p1", { title: "Updated" });
    act(() => {
      listenCallback?.({ type: "mutation", result: updated });
    });

    await waitFor(() => {
      expect(result.current.post!.title).toBe("Updated");
    });
  });

  it("refetch re-fetches single post", async () => {
    mockSanityFetch.mockResolvedValueOnce(makePost("p1", { title: "V1" }));

    const { result } = renderHook(() => useSanityBlogPost("post-p1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockSanityFetch.mockResolvedValueOnce(makePost("p1", { title: "V2" }));
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.post!.title).toBe("V2"));
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityFeaturedBlogPosts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityFeaturedBlogPosts", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityFeaturedBlogPosts());
    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches featured posts with default limit of 3", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("f1"), makePost("f2"), makePost("f3")]);

    const { result } = renderHook(() => useSanityFeaturedBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts).toHaveLength(3);
    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("0...3");
  });

  it("respects custom limit", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("f1")]);

    renderHook(() => useSanityFeaturedBlogPosts(5));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("0...5");
  });

  it("handles error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useSanityFeaturedBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Timeout");
  });

  it("sets up real-time subscription and cleans up", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useSanityFeaturedBlogPosts());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalled();
    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("updates posts on real-time mutation", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("f1")]);

    const { result } = renderHook(() => useSanityFeaturedBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = [makePost("f1"), makePost("f2")];
    act(() => {
      listenCallback?.({ type: "mutation", result: updated });
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(2));
  });

  it("refetch re-fetches featured posts", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePost("f1")]);

    const { result } = renderHook(() => useSanityFeaturedBlogPosts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockSanityFetch.mockResolvedValueOnce([makePost("f1"), makePost("f2")]);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(2));
  });
});
