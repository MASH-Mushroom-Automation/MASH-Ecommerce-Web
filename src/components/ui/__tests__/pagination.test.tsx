import { render, screen } from "@testing-library/react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "../pagination";

jest.mock("lucide-react", () => ({
  ChevronLeftIcon: (props: any) => <svg data-testid="chevron-left" {...props} />,
  ChevronRightIcon: (props: any) => <svg data-testid="chevron-right" {...props} />,
  MoreHorizontalIcon: (props: any) => <svg data-testid="more-horizontal" {...props} />,
}));

describe("Pagination", () => {
  it("should render nav with pagination role", () => {
    render(<Pagination data-testid="p">Content</Pagination>);
    const el = screen.getByTestId("p");
    expect(el.tagName).toBe("NAV");
    expect(el).toHaveAttribute("role", "navigation");
    expect(el).toHaveAttribute("aria-label", "pagination");
    expect(el).toHaveAttribute("data-slot", "pagination");
  });
});

describe("PaginationContent", () => {
  it("should render ul with data-slot", () => {
    render(<PaginationContent data-testid="pc">Items</PaginationContent>);
    const el = screen.getByTestId("pc");
    expect(el.tagName).toBe("UL");
    expect(el).toHaveAttribute("data-slot", "pagination-content");
  });
});

describe("PaginationItem", () => {
  it("should render li with data-slot", () => {
    render(<PaginationItem data-testid="pi">Item</PaginationItem>);
    const el = screen.getByTestId("pi");
    expect(el.tagName).toBe("LI");
    expect(el).toHaveAttribute("data-slot", "pagination-item");
  });
});

describe("PaginationLink", () => {
  it("should render inactive link", () => {
    render(<PaginationLink href="#" data-testid="pl">1</PaginationLink>);
    const el = screen.getByTestId("pl");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("data-slot", "pagination-link");
    expect(el).not.toHaveAttribute("aria-current");
  });

  it("should render active link with aria-current=page", () => {
    render(<PaginationLink href="#" isActive data-testid="pl">2</PaginationLink>);
    expect(screen.getByTestId("pl")).toHaveAttribute("aria-current", "page");
  });
});

describe("PaginationPrevious", () => {
  it("should render with previous aria-label", () => {
    render(<PaginationPrevious href="#" />);
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
  });
});

describe("PaginationNext", () => {
  it("should render with next aria-label", () => {
    render(<PaginationNext href="#" />);
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
  });
});

describe("PaginationEllipsis", () => {
  it("should render with aria-hidden and sr-only text", () => {
    const { container } = render(<PaginationEllipsis />);
    const el = container.querySelector('[data-slot="pagination-ellipsis"]');
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("More pages")).toHaveClass("sr-only");
  });
});
