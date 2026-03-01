import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LegalModal } from "../legal-modal";

// Mock Dialog to render children directly
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("lucide-react", () => ({
  FileText: () => <svg data-testid="file-text-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
}));

jest.mock("@/components/legal/legal-content", () => ({
  TermsContent: () => <div data-testid="terms-content">Terms Content</div>,
  PrivacyContent: () => <div data-testid="privacy-content">Privacy Content</div>,
}));

describe("LegalModal", () => {
  const mockOnClose = jest.fn();
  const mockOnAccept = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<LegalModal type="terms" isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should render terms modal with correct title", () => {
    render(<LegalModal type="terms" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("should render privacy modal with correct title", () => {
    render(<LegalModal type="privacy" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("should display FileText icon for terms modal", () => {
    render(<LegalModal type="terms" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
  });

  it("should display Shield icon for privacy modal", () => {
    render(<LegalModal type="privacy" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
  });

  it("should render TermsContent for terms type", () => {
    render(<LegalModal type="terms" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId("terms-content")).toBeInTheDocument();
    expect(screen.queryByTestId("privacy-content")).not.toBeInTheDocument();
  });

  it("should render PrivacyContent for privacy type", () => {
    render(<LegalModal type="privacy" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId("privacy-content")).toBeInTheDocument();
    expect(screen.queryByTestId("terms-content")).not.toBeInTheDocument();
  });

  it("should show Close button by default (no accept)", () => {
    render(<LegalModal type="terms" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.queryByText("I Accept")).not.toBeInTheDocument();
  });

  it("should call onClose when Close button clicked", () => {
    render(<LegalModal type="terms" isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should show Accept and Cancel buttons when showAcceptButton is true", () => {
    render(
      <LegalModal
        type="terms"
        isOpen={true}
        onClose={mockOnClose}
        onAccept={mockOnAccept}
        showAcceptButton={true}
      />
    );
    expect(screen.getByText("I Accept")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("should call onAccept and onClose when I Accept clicked", () => {
    render(
      <LegalModal
        type="terms"
        isOpen={true}
        onClose={mockOnClose}
        onAccept={mockOnAccept}
        showAcceptButton={true}
      />
    );
    fireEvent.click(screen.getByText("I Accept"));
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Cancel clicked", () => {
    render(
      <LegalModal
        type="terms"
        isOpen={true}
        onClose={mockOnClose}
        onAccept={mockOnAccept}
        showAcceptButton={true}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should display last updated badge", () => {
    render(<LegalModal type="terms" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Last Updated: January 2025")).toBeInTheDocument();
  });
});
