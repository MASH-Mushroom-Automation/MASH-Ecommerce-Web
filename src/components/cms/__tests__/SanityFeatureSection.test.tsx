import { render, screen } from "@testing-library/react";
import { SanityFeatureSection } from "../SanityFeatureSection";

const baseData = {
  title: "Why MASH",
  subtitle: "Fresh mushrooms delivered",
  backgroundColor: "light",
  columns: 3,
  features: [
    { id: "1", icon: "Leaf", headline: "Fresh Farm", subheadline: "Locally sourced", link: "", isActive: true, displayOrder: 1 },
    { id: "2", icon: "Truck", headline: "Fast Delivery", subheadline: "Same day", link: "https://example.com", isActive: true, displayOrder: 2 },
    { id: "3", icon: "Shield", headline: "Quality Assured", subheadline: "Lab tested", link: "", isActive: true, displayOrder: 3 },
  ],
};

describe("SanityFeatureSection", () => {
  it("should render the section title and subtitle", () => {
    render(<SanityFeatureSection data={baseData as any} />);
    expect(screen.getByText("Why MASH")).toBeInTheDocument();
    expect(screen.getByText("Fresh mushrooms delivered")).toBeInTheDocument();
  });

  it("should render all active feature cards", () => {
    render(<SanityFeatureSection data={baseData as any} />);
    expect(screen.getByText("Fresh Farm")).toBeInTheDocument();
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument();
    expect(screen.getByText("Quality Assured")).toBeInTheDocument();
  });

  it("should render subheadlines", () => {
    render(<SanityFeatureSection data={baseData as any} />);
    expect(screen.getByText("Locally sourced")).toBeInTheDocument();
    expect(screen.getByText("Same day")).toBeInTheDocument();
    expect(screen.getByText("Lab tested")).toBeInTheDocument();
  });

  it("should return null when no active features", () => {
    const data = { ...baseData, features: [{ ...baseData.features[0], isActive: false }] };
    const { container } = render(<SanityFeatureSection data={data as any} />);
    expect(container.innerHTML).toBe("");
  });

  it("should filter out inactive features", () => {
    const data = {
      ...baseData,
      features: [
        ...baseData.features,
        { id: "4", icon: "Heart", headline: "Hidden Feature", subheadline: "Inactive", link: "", isActive: false, displayOrder: 4 },
      ],
    };
    render(<SanityFeatureSection data={data as any} />);
    expect(screen.queryByText("Hidden Feature")).not.toBeInTheDocument();
  });

  it("should sort features by displayOrder", () => {
    const data = {
      ...baseData,
      features: [
        { id: "a", icon: "Star", headline: "Third", subheadline: "3", link: "", isActive: true, displayOrder: 3 },
        { id: "b", icon: "Award", headline: "First", subheadline: "1", link: "", isActive: true, displayOrder: 1 },
        { id: "c", icon: "Heart", headline: "Second", subheadline: "2", link: "", isActive: true, displayOrder: 2 },
      ],
    };
    render(<SanityFeatureSection data={data as any} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("First");
    expect(headings[1]).toHaveTextContent("Second");
    expect(headings[2]).toHaveTextContent("Third");
  });

  it("should wrap feature in link when link is provided", () => {
    render(<SanityFeatureSection data={baseData as any} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should not render subtitle when not provided", () => {
    const data = { ...baseData, subtitle: undefined };
    render(<SanityFeatureSection data={data as any} />);
    expect(screen.getByText("Why MASH")).toBeInTheDocument();
    expect(screen.queryByText("Fresh mushrooms delivered")).not.toBeInTheDocument();
  });

  it("should apply muted background class", () => {
    const data = { ...baseData, backgroundColor: "muted" };
    const { container } = render(<SanityFeatureSection data={data as any} />);
    expect(container.querySelector("section")).toHaveClass("bg-muted/30");
  });

  it("should apply 2-column grid class", () => {
    const data = { ...baseData, columns: 2 };
    render(<SanityFeatureSection data={data as any} />);
    const grid = screen.getByText("Fresh Farm").closest(".grid");
    expect(grid).toHaveClass("md:grid-cols-2");
  });

  it("should apply 4-column grid class", () => {
    const data = { ...baseData, columns: 4 };
    render(<SanityFeatureSection data={data as any} />);
    const grid = screen.getByText("Fresh Farm").closest(".grid");
    expect(grid).toHaveClass("lg:grid-cols-4");
  });

  it("should fall back to Leaf icon for unknown icon name", () => {
    const data = {
      ...baseData,
      features: [{ id: "1", icon: "UnknownIcon", headline: "Fallback", subheadline: "Test", link: "", isActive: true, displayOrder: 1 }],
    };
    render(<SanityFeatureSection data={data as any} />);
    expect(screen.getByText("Fallback")).toBeInTheDocument();
  });
});
