import { render, screen } from "@testing-library/react";
import { CMSFAQSection } from "../FAQSection";

jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, ...props }: any) => <div data-testid="accordion" {...props}>{children}</div>,
  AccordionContent: ({ children }: any) => <div data-testid="accordion-content">{children}</div>,
  AccordionItem: ({ children, ...props }: any) => <div data-testid="accordion-item" {...props}>{children}</div>,
  AccordionTrigger: ({ children }: any) => <button data-testid="accordion-trigger">{children}</button>,
}));

const mockFAQGroup = (overrides = {}) => ({
  id: "faq-1",
  name: "Ordering",
  isActive: true,
  displayOrder: 1,
  questions: [
    {
      id: "q1",
      question: "How do I place an order?",
      answer: "Add items to cart and checkout.",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: "q2",
      question: "Can I cancel an order?",
      answer: "Yes, before shipping.",
      isActive: true,
      displayOrder: 2,
    },
  ],
  ...overrides,
});

describe("CMSFAQSection", () => {
  it("should render loading skeleton when loading", () => {
    render(<CMSFAQSection faqs={[]} loading={true} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render error state with message", () => {
    render(<CMSFAQSection faqs={[]} error="Something went wrong" />);
    expect(screen.getByText("Error: Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should render empty state when no faqs", () => {
    render(<CMSFAQSection faqs={[]} />);
    expect(screen.getByText("No FAQ content available.")).toBeInTheDocument();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("should render FAQ categories with questions", () => {
    render(<CMSFAQSection faqs={[mockFAQGroup()]} />);
    expect(screen.getByText("Ordering")).toBeInTheDocument();
    expect(screen.getByText("How do I place an order?")).toBeInTheDocument();
    expect(screen.getByText("Can I cancel an order?")).toBeInTheDocument();
  });

  it("should filter out inactive categories", () => {
    const faqs = [
      mockFAQGroup({ id: "active", name: "Active Category", isActive: true }),
      mockFAQGroup({ id: "inactive", name: "Inactive Category", isActive: false }),
    ];
    render(<CMSFAQSection faqs={faqs} />);
    expect(screen.getByText("Active Category")).toBeInTheDocument();
    expect(screen.queryByText("Inactive Category")).not.toBeInTheDocument();
  });

  it("should filter out inactive questions", () => {
    const faq = mockFAQGroup({
      questions: [
        { id: "q1", question: "Active Q", answer: "Yes", isActive: true, displayOrder: 1 },
        { id: "q2", question: "Inactive Q", answer: "No", isActive: false, displayOrder: 2 },
      ],
    });
    render(<CMSFAQSection faqs={[faq]} />);
    expect(screen.getByText("Active Q")).toBeInTheDocument();
    expect(screen.queryByText("Inactive Q")).not.toBeInTheDocument();
  });

  it("should sort categories by displayOrder", () => {
    const faqs = [
      mockFAQGroup({ id: "second", name: "Second", displayOrder: 2 }),
      mockFAQGroup({ id: "first", name: "First", displayOrder: 1 }),
    ];
    render(<CMSFAQSection faqs={faqs} />);
    const headings = screen.getAllByText(/First|Second/);
    expect(headings[0].textContent).toBe("First");
    expect(headings[1].textContent).toBe("Second");
  });

  it("should sort questions by displayOrder", () => {
    const faq = mockFAQGroup({
      questions: [
        { id: "q2", question: "Second Question", answer: "B", isActive: true, displayOrder: 2 },
        { id: "q1", question: "First Question", answer: "A", isActive: true, displayOrder: 1 },
      ],
    });
    render(<CMSFAQSection faqs={[faq]} />);
    const triggers = screen.getAllByTestId("accordion-trigger");
    expect(triggers[0].textContent).toBe("First Question");
    expect(triggers[1].textContent).toBe("Second Question");
  });

  it("should render contact CTA section", () => {
    render(<CMSFAQSection faqs={[mockFAQGroup()]} />);
    expect(screen.getByText("Still have questions?")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("should render answer content", () => {
    render(<CMSFAQSection faqs={[mockFAQGroup()]} />);
    expect(screen.getByText("Add items to cart and checkout.")).toBeInTheDocument();
  });
});
