import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Radix UI navigation-menu primitives
jest.mock("@radix-ui/react-navigation-menu", () => {
  const React = require("react");
  const fw = (tag: string, slot: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
      const { children, ...rest } = props;
      return React.createElement(tag, { ...rest, ref, "data-radix-slot": slot }, children);
    });
  return {
    Root: fw("nav", "root"),
    List: fw("ul", "list"),
    Item: fw("li", "item"),
    Trigger: fw("button", "trigger"),
    Content: fw("div", "content"),
    Link: fw("a", "link"),
    Indicator: fw("div", "indicator"),
    Viewport: fw("div", "viewport"),
  };
});

jest.mock("class-variance-authority", () => ({
  cva: (base: string) => (extra?: Record<string, unknown>) => base,
}));

jest.mock("lucide-react", () => ({
  ChevronDownIcon: (p: Record<string, unknown>) => <svg data-testid="chevron-down" {...p} />,
}));

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from "../navigation-menu";

describe("NavigationMenu components", () => {
  it("NavigationMenu renders nav with data-slot", () => {
    render(<NavigationMenu data-testid="nm">Content</NavigationMenu>);
    const el = screen.getByTestId("nm");
    expect(el).toHaveAttribute("data-slot", "navigation-menu");
  });

  it("NavigationMenu applies className", () => {
    render(<NavigationMenu data-testid="nm" className="custom">X</NavigationMenu>);
    expect(screen.getByTestId("nm")).toHaveClass("custom");
  });

  it("NavigationMenuList renders ul", () => {
    render(<NavigationMenuList data-testid="nml">Items</NavigationMenuList>);
    const el = screen.getByTestId("nml");
    expect(el.tagName).toBe("UL");
    expect(el).toHaveAttribute("data-slot", "navigation-menu-list");
  });

  it("NavigationMenuItem renders", () => {
    render(<NavigationMenuItem data-testid="nmi">Item</NavigationMenuItem>);
    expect(screen.getByTestId("nmi")).toHaveAttribute("data-slot", "navigation-menu-item");
  });

  it("NavigationMenuTrigger renders with chevron", () => {
    render(<NavigationMenuTrigger data-testid="nmt">Menu</NavigationMenuTrigger>);
    expect(screen.getByTestId("nmt")).toHaveAttribute("data-slot", "navigation-menu-trigger");
    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
  });

  it("NavigationMenuContent renders", () => {
    render(<NavigationMenuContent data-testid="nmc">Content</NavigationMenuContent>);
    expect(screen.getByTestId("nmc")).toHaveAttribute("data-slot", "navigation-menu-content");
  });

  it("NavigationMenuLink renders anchor", () => {
    render(<NavigationMenuLink data-testid="nmlk" href="/test">Link</NavigationMenuLink>);
    const el = screen.getByTestId("nmlk");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("data-slot", "navigation-menu-link");
  });

  it("NavigationMenuIndicator renders", () => {
    render(<NavigationMenuIndicator data-testid="nmi2" />);
    expect(screen.getByTestId("nmi2")).toHaveAttribute("data-slot", "navigation-menu-indicator");
  });
});
