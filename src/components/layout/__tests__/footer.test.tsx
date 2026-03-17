import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Sanity hooks
jest.mock("@/hooks/useSanitySiteSettings", () => ({
  useSanitySiteSettings: () => ({ settings: {} }),
  useSanityNavigation: (slug: string) => ({ menu: { items: [] } }),
}));

import { Footer } from "../footer";

describe("Footer component layout changes", () => {
  test("renders Accepted Payment Methods section", () => {
    render(<Footer />);
    expect(screen.getByText(/Accepted Payment Methods/i)).toBeInTheDocument();
  });

  test("renders larger logo fallback when no CMS logo is provided", () => {
    render(<Footer />);
    const logo = screen.getByAltText("MASH Market");
    expect(logo).toBeInTheDocument();
    // The fallback Image uses width={260} height={90}
    expect(logo.getAttribute("width")).toBeDefined();
    expect(logo.getAttribute("width")).toBe("260");
    expect(logo.getAttribute("height")).toBe("90");
  });
});
