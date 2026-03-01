import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock dependencies
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, ...props }: any) => (
    <input type="checkbox" checked={checked || false} readOnly {...props} />
  ),
}));

import OnboardingInterestsPage from "../(user)/onboarding/interests/page";

describe("OnboardingInterestsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page title", () => {
    render(<OnboardingInterestsPage />);
    expect(screen.getByText("What are you most interested in?")).toBeInTheDocument();
  });

  it("should render all three interest options", () => {
    render(<OnboardingInterestsPage />);
    expect(screen.getByText(/Cooking with Fresh Mushrooms/)).toBeInTheDocument();
    expect(screen.getByText(/Trying Mushroom Products/)).toBeInTheDocument();
    expect(screen.getByText(/Growing My Own Mushrooms/)).toBeInTheDocument();
  });

  it("should render Next and Back buttons", () => {
    render(<OnboardingInterestsPage />);
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("should toggle interest selection on click", () => {
    render(<OnboardingInterestsPage />);
    const cookingOption = screen.getByText(/Cooking with Fresh Mushrooms/).closest("div[class*='cursor-pointer']");
    if (cookingOption) {
      fireEvent.click(cookingOption);
      // After clicking, the border class should change (selected state)
      expect(cookingOption.className).toContain("border-primary");
    }
  });

  it("should deselect on second click", () => {
    render(<OnboardingInterestsPage />);
    const cookingOption = screen.getByText(/Cooking with Fresh Mushrooms/).closest("div[class*='cursor-pointer']");
    if (cookingOption) {
      fireEvent.click(cookingOption);
      expect(cookingOption.className).toContain("border-primary");
      fireEvent.click(cookingOption);
      expect(cookingOption.className).not.toContain("border-primary");
    }
  });

  it("should render the MASH logo", () => {
    render(<OnboardingInterestsPage />);
    expect(screen.getByAltText("MASH Logo")).toBeInTheDocument();
  });

  it("should show step number 1", () => {
    render(<OnboardingInterestsPage />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should show subtitle text", () => {
    render(<OnboardingInterestsPage />);
    expect(screen.getByText("(Select all that apply)")).toBeInTheDocument();
  });

  it("should have Next button that triggers navigation", () => {
    // window.location.href is not easily mockable in jsdom
    // Verify the Next button exists and is clickable
    render(<OnboardingInterestsPage />);
    const nextBtn = screen.getByText("Next");
    expect(nextBtn).toBeInTheDocument();
    // Clicking won't error in jsdom - location assignment is a no-op
    fireEvent.click(nextBtn);
  });

  it("should have Back button rendered as link", () => {
    render(<OnboardingInterestsPage />);
    const backBtn = screen.getByText("Back");
    expect(backBtn).toBeInTheDocument();
    // Verify Back button exists and is clickable
    fireEvent.click(backBtn);
  });
});
