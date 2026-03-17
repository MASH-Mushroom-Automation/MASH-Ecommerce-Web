/**
 * Welcome Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img src={String(props.src || "")} alt={String(props.alt || "")} />
  ),
}));

import WelcomePage from "../page";

describe("WelcomePage", () => {
  it("renders the welcome heading", () => {
    render(<WelcomePage />);
    expect(
      screen.getByRole("heading", { name: /welcome to mash/i })
    ).toBeInTheDocument();
  });

  it("renders Let's Go and Skip buttons", () => {
    render(<WelcomePage />);
    expect(
      screen.getByRole("button", { name: /let's go/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /skip/i })
    ).toBeInTheDocument();
  });

  it("renders the MASH logo image", () => {
    render(<WelcomePage />);
    expect(screen.getByAltText("MASH Logo")).toBeInTheDocument();
  });
});
