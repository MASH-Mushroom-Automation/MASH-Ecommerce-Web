import { render, screen } from "@testing-library/react";
import { CMSFeatureSection } from "../FeatureSection";

jest.mock("lucide-react", () => ({
  Leaf: (props: any) => <svg data-testid="icon-leaf" {...props} />,
  Truck: (props: any) => <svg data-testid="icon-truck" {...props} />,
  Heart: (props: any) => <svg data-testid="icon-heart" {...props} />,
  Shield: (props: any) => <svg data-testid="icon-shield" {...props} />,
  Users: (props: any) => <svg data-testid="icon-users" {...props} />,
  Award: (props: any) => <svg data-testid="icon-award" {...props} />,
  CheckCircle: (props: any) => <svg data-testid="icon-checkcircle" {...props} />,
  Star: (props: any) => <svg data-testid="icon-star" {...props} />,
}));

const mockFeatureData = {
  title: "Why Choose MASH",
  subtitle: "Farm to table freshness",
  features: [
    { id: "f1", icon: "Leaf", headline: "Fresh Produce", subheadline: "Locally sourced", isActive: true, displayOrder: 1 },
    { id: "f2", icon: "Truck", headline: "Fast Delivery", subheadline: "Same day delivery", isActive: true, displayOrder: 2 },
    { id: "f3", icon: "Heart", headline: "Quality Assured", subheadline: "Tested products", isActive: true, displayOrder: 3 },
  ],
};

describe("CMSFeatureSection", () => {
  it("should render title and subtitle", () => {
    render(<CMSFeatureSection data={mockFeatureData} />);
    expect(screen.getByText("Why Choose MASH")).toBeInTheDocument();
    expect(screen.getByText("Farm to table freshness")).toBeInTheDocument();
  });

  it("should render all active features", () => {
    render(<CMSFeatureSection data={mockFeatureData} />);
    expect(screen.getByText("Fresh Produce")).toBeInTheDocument();
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument();
    expect(screen.getByText("Quality Assured")).toBeInTheDocument();
  });

  it("should render subheadlines", () => {
    render(<CMSFeatureSection data={mockFeatureData} />);
    expect(screen.getByText("Locally sourced")).toBeInTheDocument();
    expect(screen.getByText("Same day delivery")).toBeInTheDocument();
  });

  it("should filter out inactive features", () => {
    const data = {
      ...mockFeatureData,
      features: [
        ...mockFeatureData.features,
        { id: "f4", icon: "Shield", headline: "Hidden Feature", subheadline: "Not shown", isActive: false, displayOrder: 4 },
      ],
    };
    render(<CMSFeatureSection data={data} />);
    expect(screen.queryByText("Hidden Feature")).not.toBeInTheDocument();
  });

  it("should sort features by displayOrder", () => {
    const data = {
      ...mockFeatureData,
      features: [
        { id: "f3", icon: "Heart", headline: "Third", subheadline: "", isActive: true, displayOrder: 3 },
        { id: "f1", icon: "Leaf", headline: "First", subheadline: "", isActive: true, displayOrder: 1 },
        { id: "f2", icon: "Truck", headline: "Second", subheadline: "", isActive: true, displayOrder: 2 },
      ],
    };
    render(<CMSFeatureSection data={data} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0].textContent).toBe("First");
    expect(headings[1].textContent).toBe("Second");
    expect(headings[2].textContent).toBe("Third");
  });

  it("should default to Leaf icon for unknown icon names", () => {
    const data = {
      ...mockFeatureData,
      features: [
        { id: "f1", icon: "UnknownIcon", headline: "Test", subheadline: "Sub", isActive: true, displayOrder: 1 },
      ],
    };
    render(<CMSFeatureSection data={data} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders Shield icon", () => {
    const data = { ...mockFeatureData, features: [{ id: "f1", icon: "Shield", headline: "Secure", subheadline: "s", isActive: true, displayOrder: 1 }] };
    render(<CMSFeatureSection data={data} />);
    expect(screen.getByText("Secure")).toBeInTheDocument();
  });

  it("renders Users icon", () => {
    const data = { ...mockFeatureData, features: [{ id: "f1", icon: "Users", headline: "Community", subheadline: "s", isActive: true, displayOrder: 1 }] };
    render(<CMSFeatureSection data={data} />);
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  it("renders Award icon", () => {
    const data = { ...mockFeatureData, features: [{ id: "f1", icon: "Award", headline: "Quality", subheadline: "s", isActive: true, displayOrder: 1 }] };
    render(<CMSFeatureSection data={data} />);
    expect(screen.getByText("Quality")).toBeInTheDocument();
  });

  it("renders CheckCircle icon", () => {
    const data = { ...mockFeatureData, features: [{ id: "f1", icon: "CheckCircle", headline: "Verified", subheadline: "s", isActive: true, displayOrder: 1 }] };
    render(<CMSFeatureSection data={data} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders Star icon", () => {
    const data = { ...mockFeatureData, features: [{ id: "f1", icon: "Star", headline: "Premium", subheadline: "s", isActive: true, displayOrder: 1 }] };
    render(<CMSFeatureSection data={data} />);
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("renders empty grid when no features are active", () => {
    const data = { ...mockFeatureData, features: [{ id: "f1", icon: "Leaf", headline: "Hidden", subheadline: "s", isActive: false, displayOrder: 1 }] };
    render(<CMSFeatureSection data={data} />);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("should render as a section element", () => {
    const { container } = render(<CMSFeatureSection data={mockFeatureData} />);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("should render 3-column grid", () => {
    const { container } = render(<CMSFeatureSection data={mockFeatureData} />);
    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("md:grid-cols-3");
  });
});
