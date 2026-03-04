/**
 * Tests for AuthLayout component
 * Targets: src/components/layout/auth-layout.tsx (1fn, 1br)
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("../simple-header", () => ({
  SimpleHeader: () => <header data-testid="simple-header">Header</header>,
}));

import { AuthLayout } from "../auth-layout";

describe("AuthLayout", () => {
  it("renders children", () => {
    render(<AuthLayout>Test Content</AuthLayout>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders SimpleHeader", () => {
    render(<AuthLayout>Content</AuthLayout>);
    expect(screen.getByTestId("simple-header")).toBeInTheDocument();
  });

  it("renders footer with copyright", () => {
    render(<AuthLayout>Content</AuthLayout>);
    expect(screen.getByText(/MASH Marketplace/)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it("renders with showLogo true by default", () => {
    const { container } = render(<AuthLayout>Content</AuthLayout>);
    expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
  });

  it("renders with showLogo false", () => {
    render(<AuthLayout showLogo={false}>Content</AuthLayout>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
