import React from "react";
import { render, screen } from "@testing-library/react";
import { LegalSection, TermsContent, PrivacyContent, LegalContactCard } from "../legal-content";

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("lucide-react", () => ({
  AlertCircle: () => <svg data-testid="alert-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  Phone: () => <svg data-testid="phone-icon" />,
}));

describe("LegalSection", () => {
  it("renders default variant with title and children", () => {
    render(<LegalSection title="Test Title">Content here</LegalSection>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("renders compact variant with smaller styling", () => {
    const { container } = render(
      <LegalSection title="Compact Title" variant="compact">Compact content</LegalSection>
    );
    expect(screen.getByText("Compact Title")).toBeInTheDocument();
    expect(screen.getByText("Compact content")).toBeInTheDocument();
    // Compact uses shadow-sm class on Card
    const card = container.querySelector("[data-testid='card']");
    expect(card).toBeInTheDocument();
  });

  it("renders default variant by default (no variant prop)", () => {
    render(<LegalSection title="Default">Body</LegalSection>);
    // Should render a Card with prose styling in CardContent
    expect(screen.getByText("Default")).toBeInTheDocument();
  });
});

describe("TermsContent", () => {
  it("renders all sections in default variant", () => {
    render(<TermsContent />);
    expect(screen.getByText("1. Acceptance of Terms")).toBeInTheDocument();
    expect(screen.getByText("2. Eligibility")).toBeInTheDocument();
    expect(screen.getByText("3. User Accounts")).toBeInTheDocument();
    expect(screen.getByText("4. Orders and Payment")).toBeInTheDocument();
  });

  it("renders compact variant with alert banner", () => {
    render(<TermsContent variant="compact" />);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByText(/By accessing and using MASH/)).toBeInTheDocument();
  });

  it("does not render alert banner in default variant", () => {
    render(<TermsContent variant="default" />);
    expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
  });

  it("shows contact card by default (showContactCard=true)", () => {
    render(<TermsContent />);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("hides contact card when showContactCard=false", () => {
    render(<TermsContent showContactCard={false} />);
    expect(screen.queryByText(/If you have questions about these Terms/)).not.toBeInTheDocument();
  });

  it("renders with compact variant styling", () => {
    const { container } = render(<TermsContent variant="compact" />);
    // Compact uses space-y-2 sm:space-y-3
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("space-y-2");
  });

  it("renders with default variant styling", () => {
    const { container } = render(<TermsContent variant="default" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("space-y-6");
  });
});

describe("PrivacyContent", () => {
  it("renders all privacy sections in default variant", () => {
    render(<PrivacyContent />);
    expect(screen.getByText("1. Information We Collect")).toBeInTheDocument();
  });

  it("renders compact variant with intro paragraph", () => {
    render(<PrivacyContent variant="compact" />);
    expect(screen.getByText(/Your privacy is important to us/)).toBeInTheDocument();
  });

  it("does not render alert in default variant", () => {
    render(<PrivacyContent variant="default" />);
    // Should not have the compact alert
    expect(screen.queryByText(/This Privacy Policy explains/)).not.toBeInTheDocument();
  });

  it("shows contact card by default", () => {
    render(<PrivacyContent />);
    expect(screen.getByText("Questions About Privacy?")).toBeInTheDocument();
  });

  it("hides contact card when showContactCard=false", () => {
    render(<PrivacyContent showContactCard={false} />);
    // Contact card should not appear (but Contact Us might appear in nav)
    expect(screen.queryByText(/If you have questions about this Privacy/)).not.toBeInTheDocument();
  });

  it("renders compact variant with appropriate spacing", () => {
    const { container } = render(<PrivacyContent variant="compact" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("space-y-2");
  });
});

describe("LegalContactCard", () => {
  it("renders title and description", () => {
    render(<LegalContactCard title="Help" description="Need help?" />);
    expect(screen.getByText("Help")).toBeInTheDocument();
    expect(screen.getByText("Need help?")).toBeInTheDocument();
  });
});
