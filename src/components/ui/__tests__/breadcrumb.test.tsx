import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "../breadcrumb";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ChevronRight: (p: Record<string, unknown>) => <svg data-testid="chevron-right" {...p} />,
  MoreHorizontal: (p: Record<string, unknown>) => <svg data-testid="more-horizontal" {...p} />,
}));

describe("Breadcrumb", () => {
  it("should render nav with aria-label", () => {
    render(<Breadcrumb data-testid="bc" />);
    const nav = screen.getByTestId("bc");
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("aria-label", "breadcrumb");
    expect(nav).toHaveAttribute("data-slot", "breadcrumb");
  });
});

describe("BreadcrumbList", () => {
  it("should render ol with data-slot", () => {
    render(<BreadcrumbList data-testid="list" />);
    const ol = screen.getByTestId("list");
    expect(ol.tagName).toBe("OL");
    expect(ol).toHaveAttribute("data-slot", "breadcrumb-list");
  });

  it("should apply custom className", () => {
    render(<BreadcrumbList data-testid="list" className="my-class" />);
    expect(screen.getByTestId("list")).toHaveClass("my-class");
  });
});

describe("BreadcrumbItem", () => {
  it("should render li with data-slot", () => {
    render(<BreadcrumbItem data-testid="item">Home</BreadcrumbItem>);
    const li = screen.getByTestId("item");
    expect(li.tagName).toBe("LI");
    expect(li).toHaveAttribute("data-slot", "breadcrumb-item");
  });
});

describe("BreadcrumbLink", () => {
  it("should render anchor by default", () => {
    render(<BreadcrumbLink data-testid="link" href="/test">Link</BreadcrumbLink>);
    const el = screen.getByTestId("link");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("data-slot", "breadcrumb-link");
  });

  it("should render as child when asChild", () => {
    render(
      <BreadcrumbLink asChild>
        <button data-testid="child-btn">Click</button>
      </BreadcrumbLink>
    );
    expect(screen.getByTestId("child-btn")).toHaveAttribute("data-slot", "breadcrumb-link");
  });
});

describe("BreadcrumbPage", () => {
  it("should render span with aria-current page", () => {
    render(<BreadcrumbPage data-testid="page">Current</BreadcrumbPage>);
    const el = screen.getByTestId("page");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("aria-current", "page");
    expect(el).toHaveAttribute("aria-disabled", "true");
  });
});

describe("BreadcrumbSeparator", () => {
  it("should render default chevron icon", () => {
    render(<BreadcrumbSeparator data-testid="sep" />);
    const el = screen.getByTestId("sep");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("should render custom children instead of default", () => {
    render(<BreadcrumbSeparator data-testid="sep">/</BreadcrumbSeparator>);
    expect(screen.getByText("/")).toBeInTheDocument();
  });
});

describe("BreadcrumbEllipsis", () => {
  it("should render with aria-hidden and sr-only text", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    const el = screen.getByTestId("ellipsis");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("More")).toBeInTheDocument();
    expect(screen.getByTestId("more-horizontal")).toBeInTheDocument();
  });
});
