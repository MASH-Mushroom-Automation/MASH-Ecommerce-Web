import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccountRecoveryLink } from "../AccountRecoveryLink";

jest.mock("lucide-react", () => ({
  Shield: (props: Record<string, unknown>) => <svg data-testid="shield-icon" {...props} />,
}));

describe("AccountRecoveryLink", () => {
  const mockOnRecoveryClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with correct text", () => {
    render(<AccountRecoveryLink onRecoveryClick={mockOnRecoveryClick} />);
    expect(screen.getByText(/can.t access your phone/i)).toBeInTheDocument();
  });

  it("should render shield icon", () => {
    render(<AccountRecoveryLink onRecoveryClick={mockOnRecoveryClick} />);
    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
  });

  it("should have correct data-testid", () => {
    render(<AccountRecoveryLink onRecoveryClick={mockOnRecoveryClick} />);
    expect(screen.getByTestId("account-recovery-link")).toBeInTheDocument();
  });

  it("should call onRecoveryClick when clicked", () => {
    render(<AccountRecoveryLink onRecoveryClick={mockOnRecoveryClick} />);
    fireEvent.click(screen.getByTestId("account-recovery-link"));
    expect(mockOnRecoveryClick).toHaveBeenCalledTimes(1);
  });

  it("should render as a button element", () => {
    render(<AccountRecoveryLink onRecoveryClick={mockOnRecoveryClick} />);
    const button = screen.getByTestId("account-recovery-link");
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("should apply additional className", () => {
    render(<AccountRecoveryLink onRecoveryClick={mockOnRecoveryClick} className="mt-4" />);
    const button = screen.getByTestId("account-recovery-link");
    expect(button.className).toContain("mt-4");
  });
});
