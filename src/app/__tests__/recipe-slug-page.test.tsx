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

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

jest.mock("@/components/content/YouTubeEmbed", () => ({
  YouTubeEmbed: ({ videoId, title }: any) => <div data-testid="youtube-embed">{title}</div>,
}));

jest.mock("lucide-react", () => ({
  Clock: () => <span />,
  ChefHat: () => <span />,
  Users: () => <span />,
  Printer: () => <span />,
  Share2: () => <span />,
  BookmarkPlus: () => <span />,
  ShoppingCart: () => <span />,
  ArrowLeft: () => <span />,
  Check: () => <span />,
  Lightbulb: () => <span />,
}));

import { render, screen } from "@testing-library/react";

let RecipePage: any;
let generateMetadata: any;

beforeAll(async () => {
  const mod = await import("../recipes/[slug]/page");
  RecipePage = mod.default;
  generateMetadata = mod.generateMetadata;
});

describe("RecipePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRecipe = {
    _id: "recipe-1",
    title: "Creamy Mushroom Risotto",
    slug: { current: "creamy-mushroom-risotto" },
    description: "A delicious creamy risotto with fresh mushrooms",
    excerpt: "Rich and creamy mushroom risotto",
    mainImage: { asset: { _ref: "image-1" } },
    difficulty: "intermediate",
    cuisine: "Italian",
    mealType: ["Dinner"],
    prepTime: 15,
    cookTime: 30,
    totalTime: 45,
    servings: 4,
    tags: ["risotto", "mushroom"],
    ingredientGroups: [
      {
        groupName: "Main Ingredients",
        ingredients: [
          { quantity: "300g", name: "Arborio rice", preparation: "rinsed" },
          { quantity: "200g", name: "Fresh oyster mushrooms", isOptional: false, product: { _id: "p1", name: "Fresh Oyster", slug: { current: "fresh-oyster" }, price: 120, image: null } },
          { quantity: "1 cup", name: "White wine", isOptional: true },
        ],
      },
    ],
    instructions: [
      { stepNumber: 1, title: "Prep", instruction: "Slice the mushrooms", tip: "Use a sharp knife", duration: 5 },
      { stepNumber: 2, title: "Cook Rice", instruction: "Add rice to the pan and stir" },
    ],
    nutritionFacts: { calories: 450, protein: 12, carbs: 65, fat: 14, fiber: 3 },
    chefNotes: "Use homemade stock for best results",
    relatedProducts: [],
    relatedRecipes: [],
  };

  it("should call notFound when recipe is null", async () => {
    mockFetch.mockResolvedValue(null);
    const params = Promise.resolve({ slug: "nonexistent" });
    try {
      await RecipePage({ params });
    } catch {
      // notFound throws
    }
    expect(notFound).toHaveBeenCalled();
  });

  it("should render recipe title", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("Creamy Mushroom Risotto")).toBeInTheDocument();
  });

  it("should render difficulty badge", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
  });

  it("should render cuisine and meal type", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
  });

  it("should render time stats", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
  });

  it("should render ingredient groups", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("Main Ingredients")).toBeInTheDocument();
    expect(screen.getByText(/Arborio rice/)).toBeInTheDocument();
  });

  it("should render instructions", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("Prep")).toBeInTheDocument();
    expect(screen.getByText("Slice the mushrooms")).toBeInTheDocument();
    expect(screen.getByText("Cook Rice")).toBeInTheDocument();
  });

  it("should render nutrition facts", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("450")).toBeInTheDocument();
    expect(screen.getByText("Calories")).toBeInTheDocument();
    expect(screen.getByText("Protein")).toBeInTheDocument();
  });

  it("should render chef notes", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText("Use homemade stock for best results")).toBeInTheDocument();
  });

  it("should render action buttons", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const result = await RecipePage({ params });
    render(result);
    expect(screen.getByText(/Print Recipe/)).toBeInTheDocument();
    expect(screen.getByText(/Share/)).toBeInTheDocument();
    expect(screen.getByText(/Save/)).toBeInTheDocument();
  });

  it("should generate metadata for existing recipe", async () => {
    mockFetch.mockResolvedValue(mockRecipe);
    const params = Promise.resolve({ slug: "creamy-mushroom-risotto" });
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toContain("Creamy Mushroom Risotto");
  });

  it("should generate fallback metadata when recipe not found", async () => {
    mockFetch.mockResolvedValue(null);
    const params = Promise.resolve({ slug: "nonexistent" });
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toBe("Recipe Not Found | MASH");
  });
});
