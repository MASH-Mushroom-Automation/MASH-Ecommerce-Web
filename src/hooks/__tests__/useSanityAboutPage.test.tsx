/**
 * useSanityAboutPage Hook Tests - COVERAGE-011
 *
 * Tests 3 hooks from src/hooks/useSanityAboutPage.ts:
 * - useSanityAboutPage: Fetches About page singleton + team + mentor in parallel
 * - useSanityTeamMembers: Fetches team members
 * - useSanityTeamMember(memberId): Fetches single team member
 *
 * Key: Uses sanityClient.fetch() with parallel Promise.all for main hook
 * Uses imageUrlBuilder (mocked via @sanity/image-url)
 * Loading property: loading
 * Error type: Error | null
 */

import { renderHook, waitFor } from "@testing-library/react";
import {
  default as useSanityAboutPage,
  useSanityTeamMembers,
  useSanityTeamMember,
} from "../useSanityAboutPage";

// Mock @sanity/image-url since it's used for image URL building
jest.mock("@sanity/image-url", () => {
  const chainable = {
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    fit: jest.fn().mockReturnThis(),
    crop: jest.fn().mockReturnThis(),
    url: jest.fn(() => "https://mock-image.url/about.webp"),
  };
  return {
    __esModule: true,
    default: jest.fn(() => ({
      image: jest.fn(() => chainable),
    })),
  };
});

// Access the globally mocked sanityClient
const { sanityClient } = jest.requireMock("@/lib/sanity/client");

// ============================================================================
// MOCK DATA
// ============================================================================

function makeAboutPageData(overrides?: Partial<any>) {
  return {
    heroTitle: "Cultivating the Future",
    heroSubtitle: "Student innovators from UCC",
    heroImage: { _type: "image", asset: { _ref: "image-hero-ref" }, alt: "About Hero" },
    challengesTitle: "The Challenge",
    challengesSubtitle: "Filipino growers face obstacles",
    challenges: [
      { _key: "c1", title: "Climate", description: "High tropical heat", icon: "sun" },
      { _key: "c2", title: "Pests", description: "Contamination risk", icon: "bug" },
    ],
    solutionsTitle: "Our Solution: M.A.S.H.",
    solutionsSubtitle: "Integrated ecosystem",
    solutionsAcronym: "M.A.S.H.",
    solutions: [
      { _key: "s1", title: "Automated Growing", description: "IoT chamber", icon: "cpu" },
      { _key: "s2", title: "AI Insights", description: "Predictive", icon: "brain" },
    ],
    visionTitle: "Our Vision",
    visionContent: [{ _type: "block", children: [{ text: "Technology for good" }] }],
    visionCTA: "Join the movement!",
    visionImage: { _type: "image", asset: { _ref: "image-vision-ref" }, alt: "Vision" },
    mentorTitle: "Our Adviser",
    mentorSubtitle: "Guidance and expertise",
    mentor: {
      _id: "mentor-1",
      firstName: "Joemen",
      lastName: "Barrios",
      role: "Thesis Adviser",
      personType: "mentor",
      shortBio: "MIT graduate",
      picture: { asset: { _ref: "image-mentor-ref" } },
    },
    teamTitle: "Meet the Team",
    teamSubtitle: "The innovators",
    autoFetchTeam: true,
    teamMembers: [],
    ...overrides,
  };
}

function makeTeamMember(overrides?: Partial<any>) {
  return {
    _id: "member-1",
    firstName: "John",
    lastName: "Doe",
    role: "Developer",
    personType: "team",
    shortBio: "Full stack dev",
    bio: [{ _type: "block", children: [{ text: "Experienced developer" }] }],
    email: "john@mash.com",
    phone: "+639123456789",
    website: "https://johndoe.dev",
    specializations: ["React", "Node.js"],
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
    },
    picture: { asset: { _ref: "image-john-ref" } },
    pictureUrl: "https://cdn.sanity.io/images/test/production/john.jpg",
    displayOrder: 1,
    isFeatured: true,
    ...overrides,
  };
}

function makeTeamMember2() {
  return makeTeamMember({
    _id: "member-2",
    firstName: "Jane",
    lastName: "Smith",
    role: "Designer",
    displayOrder: 2,
    isFeatured: false,
    pictureUrl: "https://cdn.sanity.io/images/test/production/jane.jpg",
  });
}

const mockMentor = {
  _id: "mentor-1",
  firstName: "Joemen",
  lastName: "Barrios",
  role: "Thesis Adviser",
  personType: "mentor",
  shortBio: "MIT graduate",
  picture: { asset: { _ref: "image-mentor-ref" } },
  pictureUrl: "https://cdn.sanity.io/images/test/production/mentor.jpg",
  displayOrder: 1,
  isFeatured: false,
};

// ============================================================================
// useSanityAboutPage
// ============================================================================

describe("useSanityAboutPage", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
  });

  it("should fetch about page content with parallel queries", async () => {
    // useSanityAboutPage calls sanityClient.fetch 3 times in Promise.all
    sanityClient.fetch
      .mockResolvedValueOnce(makeAboutPageData()) // aboutPage singleton
      .mockResolvedValueOnce([makeTeamMember(), makeTeamMember2()]) // team members
      .mockResolvedValueOnce(mockMentor); // mentor

    const { result } = renderHook(() => useSanityAboutPage());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(sanityClient.fetch).toHaveBeenCalledTimes(3);
  });

  it("should transform hero section", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce(makeAboutPageData())
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.heroTitle).toBe("Cultivating the Future");
    expect(result.current.content?.heroSubtitle).toBe("Student innovators from UCC");
    expect(result.current.content?.heroImage).toBeDefined();
  });

  it("should transform challenges and solutions", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce(makeAboutPageData())
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.challenges).toHaveLength(2);
    expect(result.current.content?.challenges[0].title).toBe("Climate");
    expect(result.current.content?.solutions).toHaveLength(2);
    expect(result.current.content?.solutions[0].title).toBe("Automated Growing");
  });

  it("should transform mentor from linked data", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce(makeAboutPageData())
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.mentor).toBeDefined();
    expect(result.current.content?.mentor?.firstName).toBe("Joemen");
    expect(result.current.content?.mentor?.lastName).toBe("Barrios");
    expect(result.current.content?.mentor?.fullName).toBe("Joemen Barrios");
  });

  it("should auto-fetch team members when autoFetchTeam is true", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce(makeAboutPageData({ autoFetchTeam: true }))
      .mockResolvedValueOnce([makeTeamMember(), makeTeamMember2()])
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.teamMembers).toHaveLength(2);
    // Sorted by displayOrder: member-1 (1) then member-2 (2)
    expect(result.current.content?.teamMembers[0]._id).toBe("member-1");
    expect(result.current.content?.teamMembers[1]._id).toBe("member-2");
  });

  it("should use default titles when data is null", async () => {
    sanityClient.fetch
      .mockResolvedValueOnce(null) // no aboutPage data
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.heroTitle).toBe("Cultivating the Future of Philippine Agriculture");
    expect(result.current.content?.challengesTitle).toBe("The Challenge Facing Filipino Growers");
    expect(result.current.content?.solutionsTitle).toBe("Our Solution: The M.A.S.H. System");
    expect(result.current.content?.visionTitle).toBe("Our Vision for a Greener Tomorrow");
    expect(result.current.content?.teamTitle).toBe("Meet the Team");
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity unavailable"));

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Sanity unavailable");
  });

  it("should wrap non-Error exceptions", async () => {
    sanityClient.fetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Failed to fetch About page content");
  });

  it("should provide refetch function", async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const { result } = renderHook(() => useSanityAboutPage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});

// ============================================================================
// useSanityTeamMembers
// ============================================================================

describe("useSanityTeamMembers", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
  });

  it("should fetch and transform team members", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeTeamMember(), makeTeamMember2()]);

    const { result } = renderHook(() => useSanityTeamMembers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toHaveLength(2);
    expect(result.current.members[0]._id).toBe("member-1");
    expect(result.current.members[0].fullName).toBe("John Doe");
    expect(result.current.members[0].picture.url).toBe(
      "https://cdn.sanity.io/images/test/production/john.jpg"
    );
    expect(result.current.error).toBeNull();
  });

  it("should sort members by displayOrder", async () => {
    sanityClient.fetch.mockResolvedValueOnce([makeTeamMember2(), makeTeamMember()]);

    const { result } = renderHook(() => useSanityTeamMembers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // member-1 (order 1) before member-2 (order 2)
    expect(result.current.members[0]._id).toBe("member-1");
    expect(result.current.members[1]._id).toBe("member-2");
  });

  it("should filter out null transforms", async () => {
    sanityClient.fetch.mockResolvedValueOnce([null, makeTeamMember()]);

    const { result } = renderHook(() => useSanityTeamMembers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toHaveLength(1);
  });

  it("should handle empty results", async () => {
    sanityClient.fetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityTeamMembers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.members).toEqual([]);
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Team fetch failed"));

    const { result } = renderHook(() => useSanityTeamMembers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error?.message).toBe("Team fetch failed");
  });
});

// ============================================================================
// useSanityTeamMember (single member by ID)
// ============================================================================

describe("useSanityTeamMember", () => {
  beforeEach(() => {
    sanityClient.fetch.mockReset();
  });

  it("should fetch single team member by ID", async () => {
    sanityClient.fetch.mockResolvedValueOnce(makeTeamMember());

    const { result } = renderHook(() => useSanityTeamMember("member-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.member).not.toBeNull();
    expect(result.current.member?._id).toBe("member-1");
    expect(result.current.member?.fullName).toBe("John Doe");
    expect(result.current.error).toBeNull();
  });

  it("should handle empty memberId", async () => {
    const { result } = renderHook(() => useSanityTeamMember(""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.member).toBeNull();
    // Should not call fetch for empty ID
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  it("should handle non-existent member", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityTeamMember("non-existent"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.member).toBeNull();
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Member not found"));

    const { result } = renderHook(() => useSanityTeamMember("bad-id"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error?.message).toBe("Member not found");
  });

  it("should use pictureUrl from GROQ when available", async () => {
    sanityClient.fetch.mockResolvedValueOnce(
      makeTeamMember({ pictureUrl: "https://direct-url.com/photo.jpg" })
    );

    const { result } = renderHook(() => useSanityTeamMember("member-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.member?.picture.url).toBe("https://direct-url.com/photo.jpg");
  });
});
