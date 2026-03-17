/**
 * Start Selling Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock hooks and sub-components
const mockGoToForm = jest.fn();
const mockGoToHero = jest.fn();
const mockOnSubmit = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/lib/auth", () => ({
  isAuthenticated: jest.fn(() => true),
}));

jest.mock("../hooks/useSellerApplicationForm", () => ({
  useSellerApplicationForm: () => ({
    form: {},
    onSubmit: mockOnSubmit,
    currentStep: 0,
    showSuccessModal: false,
    isSubmitting: false,
    goToForm: mockGoToForm,
    goToHero: mockGoToHero,
  }),
}));

jest.mock("../components/HeroSection", () => ({
  HeroSection: ({ onContinue }: { onContinue: () => void }) => (
    <div data-testid="hero-section">
      <button onClick={onContinue}>Continue</button>
    </div>
  ),
}));

jest.mock("../components/ApplicationForm", () => ({
  ApplicationForm: () => <div data-testid="application-form" />,
}));

jest.mock("../components/SuccessModal", () => ({
  SuccessModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="success-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

import StartSellingPage from "../page";

describe("StartSellingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders HeroSection at step 0", () => {
    render(<StartSellingPage />);
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });

  it("calls goToForm when Continue is clicked", () => {
    render(<StartSellingPage />);
    screen.getByText("Continue").click();
    expect(mockGoToForm).toHaveBeenCalled();
  });
});
