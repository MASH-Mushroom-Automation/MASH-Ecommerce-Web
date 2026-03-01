import { render, screen, fireEvent } from "@testing-library/react";
import { BackToTop } from "../back-to-top";

jest.mock("lucide-react", () => ({
  ChevronUp: (props: any) => <svg data-testid="chevron-up" {...props} />,
}));

describe("BackToTop", () => {
  let scrollToSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    scrollToSpy = jest.fn();
    window.scrollTo = scrollToSpy as any;
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true, configurable: true });
  });

  it("should render a back-to-top button", () => {
    render(<BackToTop />);
    expect(screen.getByLabelText("Back to top")).toBeInTheDocument();
  });

  it("should be hidden initially (scrollY=0)", () => {
    render(<BackToTop />);
    const btn = screen.getByLabelText("Back to top");
    expect(btn).toHaveClass("opacity-0");
    expect(btn).toHaveClass("pointer-events-none");
  });

  it("should become visible after scrolling past viewport height", () => {
    render(<BackToTop />);

    Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });
    fireEvent.scroll(window);

    const btn = screen.getByLabelText("Back to top");
    expect(btn).toHaveClass("opacity-100");
  });

  it("should scroll to top when clicked", () => {
    render(<BackToTop />);

    Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });
    fireEvent.scroll(window);

    fireEvent.click(screen.getByLabelText("Back to top"));
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("should hide when scrolled back to top", () => {
    render(<BackToTop />);

    // Scroll down
    Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });
    fireEvent.scroll(window);
    expect(screen.getByLabelText("Back to top")).toHaveClass("opacity-100");

    // Scroll back up
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    fireEvent.scroll(window);
    expect(screen.getByLabelText("Back to top")).toHaveClass("opacity-0");
  });
});
