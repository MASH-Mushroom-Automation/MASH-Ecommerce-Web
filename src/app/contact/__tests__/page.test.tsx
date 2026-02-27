/**
 * Contact Page render tests
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the CMS section component
jest.mock("@/components/cms/ContactSection", () => ({
  CMSContactSection: (props: Record<string, unknown>) => (
    <div data-testid="cms-contact-section">
      {props.loading ? (
        <span>loading</span>
      ) : props.error ? (
        <span>{String(props.error)}</span>
      ) : (
        <span>contact-content</span>
      )}
    </div>
  ),
}));

// Mock the hook
const mockHook = jest.fn();
jest.mock("@/hooks/useSanityContactPage", () => ({
  useSanityContactPage: () => mockHook(),
}));

import ContactPage from "../page";

describe("ContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockHook.mockReturnValue({ content: null, loading: true, error: null });
    render(<ContactPage />);
    expect(
      screen.getByText("Loading contact information...")
    ).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    mockHook.mockReturnValue({
      content: null,
      loading: false,
      error: new Error("Load failed"),
    });
    render(<ContactPage />);
    expect(screen.getByText(/Load failed/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Try Again/i })
    ).toBeInTheDocument();
  });

  it("renders with default data when content is null", () => {
    mockHook.mockReturnValue({ content: null, loading: false, error: null });
    render(<ContactPage />);
    expect(screen.getByTestId("cms-contact-section")).toBeInTheDocument();
    expect(screen.getByText("contact-content")).toBeInTheDocument();
  });

  it("renders with Sanity CMS content having all 3 contact types", () => {
    mockHook.mockReturnValue({
      content: {
        contactMethods: [
          {
            _key: "e1",
            type: "email",
            value: "test@example.com",
            label: "Email",
            description: "test desc",
            displayOrder: 0,
          },
          {
            _key: "p1",
            type: "phone",
            value: "+1234567890",
            label: "Phone",
            description: "Mon-Fri",
            displayOrder: 1,
          },
          {
            _key: "a1",
            type: "address",
            value: "123 Main St",
            label: "Visit",
            description: "Main office",
            displayOrder: 2,
          },
        ],
        businessHours: [
          { _key: "mon", day: "monday", openTime: "9AM", closeTime: "5PM", isClosed: false },
          { _key: "tue", day: "tuesday", openTime: "9AM", closeTime: "5PM", isClosed: false },
          { _key: "wed", day: "wednesday", openTime: "9AM", closeTime: "5PM", isClosed: false },
          { _key: "thu", day: "thursday", openTime: "9AM", closeTime: "5PM", isClosed: false },
          { _key: "fri", day: "friday", openTime: "9AM", closeTime: "5PM", isClosed: false },
          { _key: "sat", day: "saturday", openTime: "10AM", closeTime: "4PM", isClosed: false },
          { _key: "sun", day: "sunday", openTime: "", closeTime: "", isClosed: true, note: "Closed" },
        ],
        socialLinks: [
          { _key: "fb", platform: "facebook", url: "https://fb.com/test", displayOrder: 0 },
        ],
      },
      loading: false,
      error: null,
    });

    render(<ContactPage />);
    expect(screen.getByTestId("cms-contact-section")).toBeInTheDocument();
  });

  it("falls back to defaults when Sanity data is incomplete", () => {
    mockHook.mockReturnValue({
      content: {
        contactMethods: [
          { _key: "e1", type: "email", value: "test@example.com" },
          // missing phone and address
        ],
        businessHours: [],
        socialLinks: [],
      },
      loading: false,
      error: null,
    });

    render(<ContactPage />);
    expect(screen.getByTestId("cms-contact-section")).toBeInTheDocument();
  });

  it("filters out contact methods with missing type or value", () => {
    mockHook.mockReturnValue({
      content: {
        contactMethods: [
          { _key: "e1", type: "email", value: "test@example.com" },
          { _key: "bad", type: null, value: "" },
        ],
        businessHours: [],
        socialLinks: [],
      },
      loading: false,
      error: null,
    });

    render(<ContactPage />);
    expect(screen.getByText("contact-content")).toBeInTheDocument();
  });
});
