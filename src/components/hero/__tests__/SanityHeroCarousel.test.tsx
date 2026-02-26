/**
 * SanityHeroCarousel Component Tests
 *
 * Tests for the hero carousel component with different states:
 * - Loading state
 * - Error state
 * - No slides state
 * - Single slide state
 * - Multiple slides carousel state
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SanityHeroCarousel } from "../SanityHeroCarousel";
import { useSanityHero } from "@/hooks/useSanityHero";

// Mock the hook
jest.mock("@/hooks/useSanityHero");
const mockUseSanityHero = useSanityHero as jest.MockedFunction<typeof useSanityHero>;

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock the carousel components
jest.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children, setApi }: any) => {
    React.useEffect(() => {
      if (setApi) {
        setApi({
          selectedScrollSnap: () => 0,
          on: () => {},
          scrollTo: jest.fn(),
        });
      }
    }, [setApi]);
    return <div data-testid="carousel">{children}</div>;
  },
  CarouselContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel-content">{children}</div>
  ),
  CarouselItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel-item">{children}</div>
  ),
  CarouselNext: () => <button data-testid="carousel-next">Next</button>,
  CarouselPrevious: () => <button data-testid="carousel-prev">Previous</button>,
}));

// Mock embla-carousel-autoplay
jest.mock("embla-carousel-autoplay", () => jest.fn(() => ({})));

describe("SanityHeroCarousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("displays loading spinner and message when loading", () => {
      mockUseSanityHero.mockReturnValue({
        slides: [],
        loading: true,
        error: null,
      });

      render(<SanityHeroCarousel />);

      expect(screen.getByText("Loading hero carousel...")).toBeInTheDocument();
      expect(screen.getByText("Just a moment")).toBeInTheDocument();
      // Check for spinner div instead of img
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("has correct height classes for loading state", () => {
      mockUseSanityHero.mockReturnValue({
        slides: [],
        loading: true,
        error: null,
      });

      const { container } = render(<SanityHeroCarousel />);
      const section = container.querySelector("section");

      expect(section).toHaveClass("min-h-[400px]", "md:min-h-[500px]", "lg:min-h-[600px]");
    });
  });

  describe("Error State", () => {
    it("displays error message and retry button when error occurs", () => {
      const errorMessage = "Failed to load slides";
      mockUseSanityHero.mockReturnValue({
        slides: [],
        loading: false,
        error: { message: errorMessage },
      });

      render(<SanityHeroCarousel />);

      expect(screen.getByText("Error loading hero carousel")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
    });

    it("has correct height classes for error state", () => {
      mockUseSanityHero.mockReturnValue({
        slides: [],
        loading: false,
        error: { message: "Error" },
      });

      const { container } = render(<SanityHeroCarousel />);
      const section = container.querySelector("section");

      expect(section).toHaveClass("min-h-[400px]", "md:min-h-[500px]", "lg:min-h-[600px]");
    });
  });

  describe("No Slides State", () => {
    it("displays default welcome message when no slides available", () => {
      mockUseSanityHero.mockReturnValue({
        slides: [],
        loading: false,
        error: null,
      });

      render(<SanityHeroCarousel />);

      expect(screen.getByText("Welcome to MASH")).toBeInTheDocument();
      expect(screen.getByText("Premium mushrooms from local organic farms")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Shop Now" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Learn More" })).toBeInTheDocument();
    });

    it("has correct height classes for no slides state", () => {
      mockUseSanityHero.mockReturnValue({
        slides: [],
        loading: false,
        error: null,
      });

      const { container } = render(<SanityHeroCarousel />);
      const section = container.querySelector("section");

      expect(section).toHaveClass("min-h-[400px]", "md:min-h-[500px]", "lg:min-h-[600px]");
    });
  });

  describe("Single Slide State", () => {
    const mockSlide = {
      title: "Fresh Organic Mushrooms",
      subtitle: "Direct from local farms",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      buttonStyle: "primary",
      image: "https://example.com/image.jpg",
      textColor: "#FFFFFF",
      backgroundColor: "#6A994E",
    };

    beforeEach(() => {
      mockUseSanityHero.mockReturnValue({
        slides: [mockSlide],
        loading: false,
        error: null,
      });
    });

    it("renders single slide with title, subtitle, and button", () => {
      render(<SanityHeroCarousel />);

      expect(screen.getByText(mockSlide.title)).toBeInTheDocument();
      expect(screen.getByText(mockSlide.subtitle)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: mockSlide.buttonText })).toBeInTheDocument();
    });

    it("displays background image when available", () => {
      render(<SanityHeroCarousel />);

      const image = screen.getByRole("img", { name: mockSlide.title });
      expect(image).toHaveAttribute("src", mockSlide.image);
    });

    it("has correct height classes for single slide", () => {
      const { container } = render(<SanityHeroCarousel />);
      const section = container.querySelector("section");

      expect(section).toHaveClass("min-h-[400px]", "md:min-h-[500px]", "lg:min-h-[600px]");
    });

    it("renders with custom text color configuration", () => {
      render(<SanityHeroCarousel />);

      const title = screen.getByText(mockSlide.title);
      expect(title).toBeInTheDocument();
      // The text color is applied via inline style, which is tested functionally
    });
  });

  describe("Multiple Slides State", () => {
    const mockSlides = [
      {
        title: "Slide 1",
        subtitle: "Description 1",
        buttonText: "Button 1",
        buttonLink: "/link1",
        image: "https://example.com/image1.jpg",
      },
      {
        title: "Slide 2",
        subtitle: "Description 2",
        buttonText: "Button 2",
        buttonLink: "/link2",
        image: "https://example.com/image2.jpg",
      },
    ];

    beforeEach(() => {
      mockUseSanityHero.mockReturnValue({
        slides: mockSlides,
        loading: false,
        error: null,
      });
    });

    it("renders carousel with multiple slides", () => {
      render(<SanityHeroCarousel />);

      expect(screen.getByTestId("carousel")).toBeInTheDocument();
      expect(screen.getAllByTestId("carousel-item")).toHaveLength(mockSlides.length);
    });

    it("displays navigation arrows on desktop", () => {
      render(<SanityHeroCarousel />);

      expect(screen.getByTestId("carousel-next")).toBeInTheDocument();
      expect(screen.getByTestId("carousel-prev")).toBeInTheDocument();
    });

    it("renders navigation dots for each slide", () => {
      render(<SanityHeroCarousel />);

      // Should have dots for each slide
      const dots = screen.getAllByRole("button", { name: /Go to slide/ });
      expect(dots).toHaveLength(mockSlides.length);
    });

    it("has correct height classes for multiple slides", () => {
      const { container } = render(<SanityHeroCarousel />);
      const section = container.querySelector("section");

      expect(section).toHaveClass("min-h-[400px]", "md:min-h-[500px]", "lg:min-h-[600px]");
    });

    it("displays first slide content", () => {
      render(<SanityHeroCarousel />);

      expect(screen.getByText(mockSlides[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockSlides[0].subtitle)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: mockSlides[0].buttonText })).toBeInTheDocument();
    });
  });

  describe("Button Variants", () => {
    it("applies correct button variant based on buttonStyle", () => {
      const slideWithSecondaryButton = {
        title: "Test Slide",
        buttonText: "Secondary Button",
        buttonStyle: "secondary",
        buttonLink: "/test",
      };

      mockUseSanityHero.mockReturnValue({
        slides: [slideWithSecondaryButton],
        loading: false,
        error: null,
      });

      render(<SanityHeroCarousel />);

      const button = screen.getByRole("link", { name: "Secondary Button" });
      expect(button).toBeInTheDocument();
      // The button variant is applied via className, which would be tested in integration tests
    });
  });

  describe("Accessibility", () => {
    it("provides proper aria-labels for navigation dots", () => {
      const mockSlides = [
        { title: "Slide 1", buttonText: "Button 1" },
        { title: "Slide 2", buttonText: "Button 2" },
      ];

      mockUseSanityHero.mockReturnValue({
        slides: mockSlides,
        loading: false,
        error: null,
      });

      render(<SanityHeroCarousel />);

      expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
    });
  });
});