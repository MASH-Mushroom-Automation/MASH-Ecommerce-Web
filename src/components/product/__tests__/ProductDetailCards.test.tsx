import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductDetailCards } from "../ProductDetailCards";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Snowflake: (p: Record<string, unknown>) => <svg data-testid="snowflake" {...p} />,
  Timer: (p: Record<string, unknown>) => <svg data-testid="timer" {...p} />,
  Thermometer: (p: Record<string, unknown>) => <svg data-testid="thermometer" {...p} />,
  CheckCircle: (p: Record<string, unknown>) => <svg data-testid="check-circle" {...p} />,
  ChefHat: (p: Record<string, unknown>) => <svg data-testid="chef-hat" {...p} />,
  Sparkles: (p: Record<string, unknown>) => <svg data-testid="sparkles" {...p} />,
  Utensils: (p: Record<string, unknown>) => <svg data-testid="utensils" {...p} />,
  Leaf: (p: Record<string, unknown>) => <svg data-testid="leaf" {...p} />,
}));

// Mock Badge
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...rest }: { children: React.ReactNode }) => <span data-testid="badge" {...rest}>{children}</span>,
}));

describe("ProductDetailCards", () => {
  it("should return null when no data provided", () => {
    const { container } = render(<ProductDetailCards />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null when freshness has no content", () => {
    const { container } = render(<ProductDetailCards freshnessInfo={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render Storage & Freshness card with shelf life", () => {
    render(<ProductDetailCards freshnessInfo={{ shelfLife: "5 days" }} />);
    expect(screen.getByText("Storage & Freshness")).toBeInTheDocument();
    expect(screen.getByText("Shelf Life")).toBeInTheDocument();
    expect(screen.getByText("5 days")).toBeInTheDocument();
  });

  it("should render storage instructions", () => {
    render(<ProductDetailCards freshnessInfo={{ storageInstructions: "Keep refrigerated" }} />);
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Keep refrigerated")).toBeInTheDocument();
  });

  it("should render quality indicators", () => {
    render(<ProductDetailCards freshnessInfo={{ qualityIndicators: "Firm to touch" }} />);
    expect(screen.getByText("Quality Signs")).toBeInTheDocument();
    expect(screen.getByText("Firm to touch")).toBeInTheDocument();
  });

  it("should render Cooking & Preparation card with tips", () => {
    render(<ProductDetailCards preparationInfo={{ preparationTips: ["Wash before use", "Slice thin"] }} />);
    expect(screen.getByText("Cooking & Preparation")).toBeInTheDocument();
    expect(screen.getByText("Tips")).toBeInTheDocument();
    expect(screen.getByText("Wash before use")).toBeInTheDocument();
    expect(screen.getByText("Slice thin")).toBeInTheDocument();
  });

  it("should render recipe ideas as badges", () => {
    render(<ProductDetailCards preparationInfo={{ recipeIdeas: ["Stir Fry", "Soup"] }} />);
    expect(screen.getByText("Recipe Ideas")).toBeInTheDocument();
    expect(screen.getByText("Stir Fry")).toBeInTheDocument();
    expect(screen.getByText("Soup")).toBeInTheDocument();
  });

  it("should render Nutrition card with highlights", () => {
    render(<ProductDetailCards nutritionalHighlights={["High in Protein", "Low Fat"]} />);
    expect(screen.getByText("Nutrition & Details")).toBeInTheDocument();
    expect(screen.getByText("High in Protein")).toBeInTheDocument();
    expect(screen.getByText("Low Fat")).toBeInTheDocument();
  });

  it("should render SKU", () => {
    render(<ProductDetailCards sku="MUSH-001" />);
    expect(screen.getByText("SKU")).toBeInTheDocument();
    expect(screen.getByText("MUSH-001")).toBeInTheDocument();
  });

  it("should render weight in grams", () => {
    render(<ProductDetailCards weight={250} />);
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("250g")).toBeInTheDocument();
  });

  it("should render all three cards when all data provided", () => {
    render(
      <ProductDetailCards
        freshnessInfo={{ shelfLife: "3 days", storageInstructions: "Keep cool" }}
        preparationInfo={{ preparationTips: ["Tip1"], recipeIdeas: ["Idea1"] }}
        nutritionalHighlights={["Vitamin D"]}
        sku="SK1"
        weight={100}
      />
    );
    expect(screen.getByText("Storage & Freshness")).toBeInTheDocument();
    expect(screen.getByText("Cooking & Preparation")).toBeInTheDocument();
    expect(screen.getByText("Nutrition & Details")).toBeInTheDocument();
  });

  it("should not render cooking card if prep arrays empty", () => {
    const { container } = render(
      <ProductDetailCards preparationInfo={{ preparationTips: [], recipeIdeas: [] }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
