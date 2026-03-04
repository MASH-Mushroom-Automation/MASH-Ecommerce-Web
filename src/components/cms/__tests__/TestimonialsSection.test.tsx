/**
 * Tests for TestimonialsSection, CompactTestimonials, StarRating, etc.
 * Targets: src/components/cms/TestimonialsSection.tsx (8fn, 30br)
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const mockTestimonials = [
  {
    id: "t1",
    customerName: "Alice",
    customerImage: "/alice.jpg",
    customerTitle: "Chef",
    quote: "Great mushrooms",
    headline: "Best Quality",
    rating: 5,
    isVerified: true,
    isFeatured: true,
    location: "Manila",
    product: { name: "Shiitake", slug: "shiitake", image: "/shiitake.jpg" },
    date: "2024-01-15",
  },
  {
    id: "t2",
    customerName: "Bob",
    customerImage: null,
    customerTitle: null,
    quote: "Nice and fresh",
    headline: null,
    rating: 4,
    isVerified: false,
    isFeatured: false,
    location: null,
    product: null,
    date: null,
  },
  {
    id: "t3",
    customerName: "Charlie",
    customerImage: null,
    customerTitle: null,
    quote: "Will buy again",
    headline: "Amazing",
    rating: 3,
    isVerified: false,
    isFeatured: false,
    location: null,
    product: null,
    date: "2024-02-20",
  },
  {
    id: "t4",
    customerName: "Diana",
    customerImage: null,
    customerTitle: null,
    quote: "Tasty",
    headline: null,
    rating: 5,
    isVerified: true,
    isFeatured: false,
    location: "Cebu",
    product: null,
    date: null,
  },
];

let mockLoading = false;
let mockError: string | null = null;
let mockData = mockTestimonials;

jest.mock("@/hooks/useSanityTestimonials", () => ({
  useHomepageTestimonials: () => ({
    testimonials: mockLoading ? [] : mockData,
    loading: mockLoading,
    error: mockError,
  }),
  formatTestimonialDate: (d: string) => `Formatted: ${d}`,
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("lucide-react", () => ({
  Star: ({ className }: any) => <span data-testid="star" className={className} />,
  Quote: ({ className }: any) => <span data-testid="quote-icon" className={className} />,
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  CheckCircle: () => <span data-testid="check-circle" />,
  MapPin: () => <span data-testid="map-pin" />,
}));

import { TestimonialsSection, CompactTestimonials } from "../TestimonialsSection";

describe("TestimonialsSection", () => {
  beforeEach(() => {
    mockLoading = false;
    mockError = null;
    mockData = mockTestimonials;
  });

  it("renders loading state", () => {
    mockLoading = true;
    render(<TestimonialsSection />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("returns null on error", () => {
    mockError = "Failed";
    const { container } = render(<TestimonialsSection />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when no testimonials", () => {
    mockData = [];
    const { container } = render(<TestimonialsSection />);
    expect(container.innerHTML).toBe("");
  });

  it("renders title and subtitle", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("What Our Customers Say")).toBeInTheDocument();
    expect(screen.getByText("Real reviews from our happy mushroom lovers")).toBeInTheDocument();
  });

  it("renders with custom title and subtitle", () => {
    render(<TestimonialsSection title="Reviews" subtitle="Custom sub" />);
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Custom sub")).toBeInTheDocument();
  });

  it("renders carousel layout by default", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders grid layout", () => {
    render(<TestimonialsSection layout="grid" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders View All link when showAllLink=true", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("View All Reviews")).toBeInTheDocument();
  });

  it("hides View All link when showAllLink=false", () => {
    render(<TestimonialsSection showAllLink={false} />);
    expect(screen.queryByText("View All Reviews")).not.toBeInTheDocument();
  });

  it("renders star ratings", () => {
    render(<TestimonialsSection />);
    const stars = screen.getAllByTestId("star");
    expect(stars.length).toBeGreaterThan(0);
  });

  it("renders verified badge for verified users", () => {
    render(<TestimonialsSection />);
    const checks = screen.getAllByTestId("check-circle");
    expect(checks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders headline when present", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText(/Best Quality/)).toBeInTheDocument();
  });

  it("renders customer image when available", () => {
    render(<TestimonialsSection />);
    const img = screen.getByAltText("Alice");
    expect(img).toBeInTheDocument();
  });

  it("renders initial fallback when no customer image", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("B")).toBeInTheDocument(); // Bob's initial
  });

  it("renders location when present", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("Manila")).toBeInTheDocument();
  });

  it("renders product reference link", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText(/Purchased: Shiitake/)).toBeInTheDocument();
  });

  it("renders formatted dates", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("Formatted: 2024-01-15")).toBeInTheDocument();
  });
});

describe("CompactTestimonials", () => {
  it("returns null when no testimonials", () => {
    const { container } = render(
      <CompactTestimonials testimonials={[]} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and compact cards", () => {
    render(<CompactTestimonials testimonials={mockTestimonials} />);
    expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
    // Should show max 3 testimonials
    const cards = screen.getAllByTestId("card");
    expect(cards.length).toBeLessThanOrEqual(3);
  });

  it("renders with custom title", () => {
    render(
      <CompactTestimonials testimonials={mockTestimonials} title="My Reviews" />
    );
    expect(screen.getByText("My Reviews")).toBeInTheDocument();
  });
});
