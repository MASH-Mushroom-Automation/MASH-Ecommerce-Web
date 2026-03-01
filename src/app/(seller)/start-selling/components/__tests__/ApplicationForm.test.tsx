import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, type, variant, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked || false}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <div data-testid="select-root">{children}</div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children, ...props }: any) => <div data-testid="form-wrapper" {...props}>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render, name }: any) => {
    const field = {
      value: name === "mushroomTypes" ? [] : "",
      onChange: jest.fn(),
      name,
    };
    return <div data-testid={`form-field-${name}`}>{render({ field, fieldState: {} })}</div>;
  },
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => null,
  FormDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("lucide-react", () => ({
  ChevronRight: () => <span data-testid="chevron-right" />,
  Loader2: () => <span data-testid="loader" />,
  Upload: () => <span data-testid="upload" />,
  FileText: () => <span data-testid="file-text" />,
  X: () => <span data-testid="x-icon" />,
  CheckCircle2: () => <span data-testid="check-circle" />,
}));

// Import after mocks
import { ApplicationForm } from "../ApplicationForm";

const mockOnSubmit = jest.fn();
const mockOnBack = jest.fn();

function createMockForm(overrides: any = {}) {
  return {
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      return fn({});
    },
    formState: { isSubmitting: false, ...overrides.formState },
    ...overrides,
  } as any;
}

describe("ApplicationForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render form header", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Seller Application Form")).toBeInTheDocument();
    expect(
      screen.getByText(/Please fill in all required fields/)
    ).toBeInTheDocument();
  });

  it("should render Business Information section", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Business Information")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-businessName")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-businessType")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-taxId")).toBeInTheDocument();
  });

  it("should render Contact Details section", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Contact Details")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-fullName")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-email")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-phone")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-city")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-region")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-address")).toBeInTheDocument();
  });

  it("should render Product Information section with mushroom types", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Product Information")).toBeInTheDocument();
    expect(screen.getByText("Oyster Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Shiitake")).toBeInTheDocument();
    expect(screen.getByText("Button Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Enoki")).toBeInTheDocument();
    expect(screen.getByText("King Oyster")).toBeInTheDocument();
    expect(screen.getByText("Lion's Mane")).toBeInTheDocument();
    expect(screen.getByText("Reishi")).toBeInTheDocument();
    expect(screen.getByText("Maitake")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("should render Required Documents section", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Required Documents")).toBeInTheDocument();
    expect(screen.getByText("Valid ID of Business Owner")).toBeInTheDocument();
    expect(screen.getByText("BIR Certificate")).toBeInTheDocument();
    expect(screen.getByText("Business Certificate")).toBeInTheDocument();
  });

  it("should render Payment Information coming soon section", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Payment Information")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon:")).toBeInTheDocument();
    expect(screen.getByText("PayMongo")).toBeInTheDocument();
    expect(screen.getByText("GCash")).toBeInTheDocument();
    expect(screen.getByText("Maya")).toBeInTheDocument();
  });

  it("should render Terms and Conditions checkbox", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/Terms and Conditions/)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
    expect(screen.getByTestId("form-field-agreeToTerms")).toBeInTheDocument();
  });

  it("should render Submit and Cancel buttons", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Submit Application")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should call onBack when back button is clicked", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText("Back"));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("should call onBack when Cancel button is clicked", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("should show submitting state when isSubmitting prop is true", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isSubmitting={true}
      />
    );

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    // Cancel should be disabled
    expect(screen.getByText("Cancel")).toBeDisabled();
  });

  it("should show submitting state when form.formState.isSubmitting is true", () => {
    render(
      <ApplicationForm
        form={createMockForm({ formState: { isSubmitting: true } })}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  it("should show Submit Application when not submitting", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("Submit Application")).toBeInTheDocument();
    expect(screen.queryByText("Submitting...")).not.toBeInTheDocument();
  });

  it("should disable buttons when submitting", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isSubmitting={true}
      />
    );

    expect(screen.getByText("Cancel")).toBeDisabled();
    // Submit button should also be disabled
    const submitBtn = screen.getByText("Submitting...").closest("button");
    expect(submitBtn).toBeDisabled();
  });

  it("should render document upload fields", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId("form-field-validIdFile")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-birCertificateFile")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-businessCertificateFile")).toBeInTheDocument();
  });

  it("should render production capacity and certifications fields", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId("form-field-productionCapacity")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-certifications")).toBeInTheDocument();
  });

  it("should link to terms and privacy policy pages", () => {
    render(
      <ApplicationForm
        form={createMockForm()}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    const termsLink = screen.getByText("Terms and Conditions");
    expect(termsLink.closest("a")).toHaveAttribute("href", "/terms");

    const privacyLink = screen.getByText("Privacy Policy");
    expect(privacyLink.closest("a")).toHaveAttribute("href", "/privacy");
  });
});
