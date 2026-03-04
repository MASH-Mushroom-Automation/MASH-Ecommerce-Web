/**
 * Tests for TikTokIcon component
 * Targets: src/components/ui/tiktok-icon.tsx (1fn, 2br)
 */
import React from "react";
import { render } from "@testing-library/react";
import { TikTokIcon } from "../tiktok-icon";

describe("TikTokIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<TikTokIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses default size of 24", () => {
    const { container } = render(<TikTokIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("accepts custom size", () => {
    const { container } = render(<TikTokIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("applies custom className", () => {
    const { container } = render(<TikTokIcon className="text-red-500" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
  });

  it("uses empty className by default", () => {
    const { container } = render(<TikTokIcon />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toBe("");
  });

  it("contains a path element", () => {
    const { container } = render(<TikTokIcon />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });
});
