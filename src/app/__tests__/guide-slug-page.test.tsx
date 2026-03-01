import { notFound } from "next/navigation";

// Mock Sanity client
const mockFetch = jest.fn();
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: (...args: any[]) => mockFetch(...args) },
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => "https://example.com/image.jpg" }), url: () => "https://example.com/image.jpg" }), url: () => "https://example.com/image.jpg" }),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: any) => <div>{children}</div>,
  AccordionContent: ({ children }: any) => <div>{children}</div>,
  AccordionItem: ({ children }: any) => <div>{children}</div>,
  AccordionTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/content/YouTubeEmbed", () => ({
  YouTubeEmbed: ({ videoId, title }: any) => <div data-testid="youtube-embed">{title}</div>,
}));

jest.mock("lucide-react", () => ({
  Clock: () => <span />,
  Leaf: () => <span />,
  Sprout: () => <span />,
  Thermometer: () => <span />,
  Droplets: () => <span />,
  Sun: () => <span />,
  Wind: () => <span />,
  ArrowLeft: () => <span />,
  AlertTriangle: () => <span />,
  CheckCircle: () => <span />,
  ShoppingCart: () => <span />,
  BookOpen: () => <span />,
  Play: () => <span />,
  ChefHat: () => <span />,
  Lightbulb: () => <span />,
}));

import { render, screen } from "@testing-library/react";

// Dynamic import needed because it's a server component
let GuidePage: any;
let generateMetadata: any;

beforeAll(async () => {
  const mod = await import("../guides/[slug]/page");
  GuidePage = mod.default;
  generateMetadata = mod.generateMetadata;
});

describe("GuidePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGuide = {
    _id: "guide-1",
    title: "How to Grow White Oyster Mushrooms",
    slug: { current: "white-oyster-guide" },
    description: "Complete guide to growing white oyster mushrooms at home",
    coverImage: { asset: { _ref: "image-123" } },
    mushroomType: "oyster",
    difficulty: "beginner",
    timeToFirstHarvest: "10-14 days",
    expectedYield: "300-500g",
    harvestWindow: "7 days",
    growingSteps: [
      { stepNumber: 1, title: "Prepare Kit", instruction: "Open the bag and soak overnight", tip: "Use filtered water" },
      { stepNumber: 2, title: "Misting", instruction: "Mist 3 times daily", day: "Day 3" },
    ],
    idealConditions: {
      temperature: "18-24°C",
      humidity: "80-90%",
      light: "Indirect light",
      airflow: "Moderate",
    },
    suppliesNeeded: ["Growing kit", "Spray bottle", "Sharp knife"],
    troubleshooting: [
      { problem: "No pinning", cause: "Low humidity", solution: "Increase misting frequency" },
    ],
    harvestGuide: {
      signs: ["Cap edges flatten", "Gills visible"],
      technique: "Twist and pull at the base",
      storage: "Paper bag in fridge for up to 7 days",
    },
    relatedProduct: {
      _id: "prod-1",
      name: "White Oyster Kit",
      slug: { current: "white-oyster-kit" },
      price: 350,
      image: { asset: { _ref: "img-1" } },
      description: "Everything you need",
    },
    relatedRecipes: [],
    tags: ["oyster", "beginner"],
  };

  it("should call notFound when guide is null", async () => {
    mockFetch.mockResolvedValue(null);
    const params = Promise.resolve({ slug: "nonexistent" });
    try {
      await GuidePage({ params });
    } catch {
      // notFound throws
    }
    expect(notFound).toHaveBeenCalled();
  });

  it("should render guide title", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("How to Grow White Oyster Mushrooms")).toBeInTheDocument();
  });

  it("should render difficulty badge", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText(/Beginner/)).toBeInTheDocument();
  });

  it("should render quick stats", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("10-14 days")).toBeInTheDocument();
    expect(screen.getByText("300-500g")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expect(screen.getByText("2 steps")).toBeInTheDocument();
  });

  it("should render growing steps", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("Prepare Kit")).toBeInTheDocument();
    expect(screen.getByText("Misting")).toBeInTheDocument();
    expect(screen.getByText("Open the bag and soak overnight")).toBeInTheDocument();
  });

  it("should render ideal conditions", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("18-24°C")).toBeInTheDocument();
    expect(screen.getByText("80-90%")).toBeInTheDocument();
  });

  it("should render supplies needed", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("Growing kit")).toBeInTheDocument();
    expect(screen.getByText("Spray bottle")).toBeInTheDocument();
  });

  it("should render troubleshooting section", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("No pinning")).toBeInTheDocument();
  });

  it("should render harvest guide", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("Twist and pull at the base")).toBeInTheDocument();
  });

  it("should render related product with buy button", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const result = await GuidePage({ params });
    render(result);
    expect(screen.getByText("White Oyster Kit")).toBeInTheDocument();
  });

  it("should generate metadata for existing guide", async () => {
    mockFetch.mockResolvedValue(mockGuide);
    const params = Promise.resolve({ slug: "white-oyster-guide" });
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toContain("How to Grow White Oyster Mushrooms");
  });

  it("should generate fallback metadata when guide not found", async () => {
    mockFetch.mockResolvedValue(null);
    const params = Promise.resolve({ slug: "nonexistent" });
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toBe("Guide Not Found | MASH");
  });
});
