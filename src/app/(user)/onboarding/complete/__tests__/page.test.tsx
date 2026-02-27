/**
 * Onboarding Complete Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img src={String(props.src || "")} alt={String(props.alt || "")} />
  ),
}));

import OnboardingCompletePage from "../page";

describe("OnboardingCompletePage", () => {
  it("renders the success heading", () => {
    render(<OnboardingCompletePage />);
    expect(
      screen.getByRole("heading", { name: /you're all set/i })
    ).toBeInTheDocument();
  });

  it("renders the Start Shopping button", () => {
    render(<OnboardingCompletePage />);
    expect(
      screen.getByRole("button", { name: /start shopping/i })
    ).toBeInTheDocument();
  });

  it("renders the MASH logo", () => {
    render(<OnboardingCompletePage />);
    expect(screen.getByAltText("MASH Logo")).toBeInTheDocument();
  });
});
