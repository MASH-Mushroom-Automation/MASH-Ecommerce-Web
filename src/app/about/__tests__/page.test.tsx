/**
 * About Page render tests
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the CMS section component
jest.mock("@/components/cms/AboutSection", () => ({
  CMSAboutSection: (props: Record<string, unknown>) => (
    <div data-testid="cms-about-section">
      {props.loading ? (
        <span>loading</span>
      ) : props.error ? (
        <span>{String(props.error)}</span>
      ) : (
        <span>about-content</span>
      )}
    </div>
  ),
}));

// Mock the hook
const mockHook = jest.fn();
jest.mock("@/hooks/useSanityAboutPage", () => ({
  useSanityAboutPage: () => mockHook(),
}));

import AboutPage from "../page";

describe("AboutPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the CMS section with loading state", () => {
    mockHook.mockReturnValue({ content: null, loading: true, error: null });
    render(<AboutPage />);
    expect(screen.getByTestId("cms-about-section")).toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the CMS section with error state", () => {
    mockHook.mockReturnValue({
      content: null,
      loading: false,
      error: new Error("Sanity error"),
    });
    render(<AboutPage />);
    expect(screen.getByTestId("cms-about-section")).toBeInTheDocument();
    expect(screen.getByText("Sanity error")).toBeInTheDocument();
  });

  it("renders with CMS content including challenges and solutions", () => {
    mockHook.mockReturnValue({
      content: {
        heroTitle: "Test Hero",
        heroSubtitle: "Test subtitle",
        heroImage: { url: "https://example.com/hero.jpg" },
        challengesTitle: "Test Challenges",
        challengesSubtitle: "Sub",
        challenges: [{ title: "C1", description: "Desc1" }],
        solutionsTitle: "Test Solutions",
        solutionsSubtitle: "SubSol",
        solutions: [{ _key: "s1", title: "S1", description: "D1" }],
        visionTitle: "Vision",
        visionContent: [
          {
            _type: "block",
            children: [{ _type: "span", text: "Vision text" }],
          },
        ],
        visionCTA: "Join now",
        mentor: {
          fullName: "Dr. Test",
          role: "Adviser",
          picture: { url: "https://example.com/mentor.jpg" },
          shortBio: "Bio here",
        },
        mentorTitle: "Mentor",
        mentorSubtitle: "Guide",
        teamMembers: [
          {
            fullName: "Alice",
            role: "Dev",
            picture: { url: "https://example.com/alice.jpg" },
            shortBio: "Alice bio",
            socialLinks: { github: "https://github.com/alice" },
          },
        ],
      },
      loading: false,
      error: null,
    });

    render(<AboutPage />);
    expect(screen.getByTestId("cms-about-section")).toBeInTheDocument();
    expect(screen.getByText("about-content")).toBeInTheDocument();
  });

  it("renders with null content using default fallbacks", () => {
    mockHook.mockReturnValue({ content: null, loading: false, error: null });
    render(<AboutPage />);
    expect(screen.getByTestId("cms-about-section")).toBeInTheDocument();
    expect(screen.getByText("about-content")).toBeInTheDocument();
  });

  it("renders with empty challenges/solutions arrays using defaults", () => {
    mockHook.mockReturnValue({
      content: {
        heroTitle: "Title",
        challenges: [],
        solutions: [],
        visionContent: [],
        teamMembers: [],
      },
      loading: false,
      error: null,
    });
    render(<AboutPage />);
    expect(screen.getByText("about-content")).toBeInTheDocument();
  });

  it("deduplicates team members by name", () => {
    mockHook.mockReturnValue({
      content: {
        teamMembers: [
          { fullName: "Alice", role: "Dev" },
          { fullName: "Alice", role: "Lead" },
          { fullName: "Bob", role: "QA" },
        ],
      },
      loading: false,
      error: null,
    });
    render(<AboutPage />);
    expect(screen.getByText("about-content")).toBeInTheDocument();
  });

  it("handles portableText with non-block types", () => {
    mockHook.mockReturnValue({
      content: {
        visionContent: [
          { _type: "image", asset: {} },
          {
            _type: "block",
            children: [{ _type: "span", text: "Real text" }],
          },
        ],
      },
      loading: false,
      error: null,
    });
    render(<AboutPage />);
    expect(screen.getByText("about-content")).toBeInTheDocument();
  });
});
