import { render, screen } from "@testing-library/react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from "../field";

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: (props: any) => <hr data-testid="separator" {...props} />,
}));

describe("FieldSet", () => {
  it("should render a fieldset element", () => {
    render(<FieldSet data-testid="fs">Content</FieldSet>);
    const el = screen.getByTestId("fs");
    expect(el.tagName).toBe("FIELDSET");
    expect(el).toHaveAttribute("data-slot", "field-set");
  });
});

describe("FieldLegend", () => {
  it("should render with default legend variant", () => {
    render(<FieldLegend data-testid="fl">Legend</FieldLegend>);
    const el = screen.getByTestId("fl");
    expect(el.tagName).toBe("LEGEND");
    expect(el).toHaveAttribute("data-variant", "legend");
  });

  it("should accept label variant", () => {
    render(<FieldLegend data-testid="fl" variant="label">Label</FieldLegend>);
    expect(screen.getByTestId("fl")).toHaveAttribute("data-variant", "label");
  });
});

describe("FieldGroup", () => {
  it("should render with data-slot", () => {
    render(<FieldGroup data-testid="fg">Group</FieldGroup>);
    expect(screen.getByTestId("fg")).toHaveAttribute("data-slot", "field-group");
  });
});

describe("Field", () => {
  it("should render with vertical orientation by default", () => {
    render(<Field data-testid="f">Vertical</Field>);
    const el = screen.getByTestId("f");
    expect(el).toHaveAttribute("role", "group");
    expect(el).toHaveAttribute("data-slot", "field");
    expect(el).toHaveAttribute("data-orientation", "vertical");
  });

  it("should render with horizontal orientation", () => {
    render(<Field data-testid="f" orientation="horizontal">Horizontal</Field>);
    expect(screen.getByTestId("f")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("should render with responsive orientation", () => {
    render(<Field data-testid="f" orientation="responsive">Responsive</Field>);
    expect(screen.getByTestId("f")).toHaveAttribute("data-orientation", "responsive");
  });

  it("should accept custom className", () => {
    render(<Field data-testid="f" className="custom-class">Content</Field>);
    expect(screen.getByTestId("f")).toHaveClass("custom-class");
  });
});

describe("FieldContent", () => {
  it("should render with data-slot", () => {
    render(<FieldContent data-testid="fc">Content</FieldContent>);
    expect(screen.getByTestId("fc")).toHaveAttribute("data-slot", "field-content");
  });
});

describe("FieldLabel", () => {
  it("should render a label element", () => {
    render(<FieldLabel data-testid="label">Label</FieldLabel>);
    const el = screen.getByTestId("label");
    expect(el.tagName).toBe("LABEL");
    expect(el).toHaveAttribute("data-slot", "field-label");
  });
});

describe("FieldTitle", () => {
  it("should render with data-slot", () => {
    render(<FieldTitle data-testid="ft">Title</FieldTitle>);
    expect(screen.getByTestId("ft")).toHaveAttribute("data-slot", "field-label");
  });
});

describe("FieldDescription", () => {
  it("should render paragraph with data-slot", () => {
    render(<FieldDescription data-testid="fd">Description</FieldDescription>);
    const el = screen.getByTestId("fd");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-slot", "field-description");
  });
});

describe("FieldSeparator", () => {
  it("should render separator without children", () => {
    render(<FieldSeparator data-testid="fsep" />);
    const el = screen.getByTestId("fsep");
    expect(el).toHaveAttribute("data-slot", "field-separator");
    expect(el).toHaveAttribute("data-content", "false");
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("should render separator with children content", () => {
    render(<FieldSeparator data-testid="fsep">OR</FieldSeparator>);
    const el = screen.getByTestId("fsep");
    expect(el).toHaveAttribute("data-content", "true");
    expect(screen.getByText("OR")).toBeInTheDocument();
  });
});

describe("FieldError", () => {
  it("should return null when no errors and no children", () => {
    const { container } = render(<FieldError />);
    expect(container.innerHTML).toBe("");
  });

  it("should return null when errors is undefined", () => {
    const { container } = render(<FieldError errors={undefined} />);
    expect(container.innerHTML).toBe("");
  });

  it("should render children when provided", () => {
    render(<FieldError>Custom error</FieldError>);
    expect(screen.getByRole("alert")).toHaveTextContent("Custom error");
  });

  it("should prefer children over errors", () => {
    render(
      <FieldError errors={[{ message: "Error msg" }]}>
        Children win
      </FieldError>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Children win");
    expect(screen.queryByText("Error msg")).not.toBeInTheDocument();
  });

  it("should display single error message as text", () => {
    render(<FieldError errors={[{ message: "Required field" }]} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Required field");
    expect(alert.querySelector("ul")).not.toBeInTheDocument();
  });

  it("should display multiple errors as a list", () => {
    render(
      <FieldError
        errors={[{ message: "Too short" }, { message: "Must be unique" }]}
      />
    );
    const alert = screen.getByRole("alert");
    const items = alert.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Too short");
    expect(items[1]).toHaveTextContent("Must be unique");
  });

  it("should skip errors without messages in list", () => {
    render(
      <FieldError
        errors={[{ message: "Valid" }, undefined as any, { message: undefined }]}
      />
    );
    const alert = screen.getByRole("alert");
    const items = alert.querySelectorAll("li");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Valid");
  });

  it("should render empty list for empty errors array", () => {
    // Empty array is truthy, produces an empty <ul> which is rendered
    render(<FieldError errors={[]} />);
    const alert = screen.getByRole("alert");
    expect(alert.querySelector("ul")).toBeInTheDocument();
    expect(alert.querySelectorAll("li")).toHaveLength(0);
  });

  it("should have role=alert and data-slot", () => {
    render(<FieldError errors={[{ message: "Error" }]} />);
    const el = screen.getByRole("alert");
    expect(el).toHaveAttribute("data-slot", "field-error");
  });
});
