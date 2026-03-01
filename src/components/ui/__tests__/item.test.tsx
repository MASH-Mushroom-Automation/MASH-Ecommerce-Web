import { render, screen } from "@testing-library/react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from "../item";

jest.mock("@/components/ui/separator", () => ({
  Separator: (props: any) => <hr data-testid="separator" {...props} />,
}));

describe("ItemGroup", () => {
  it("should render with role=list and data-slot", () => {
    render(<ItemGroup data-testid="g">Items</ItemGroup>);
    const el = screen.getByTestId("g");
    expect(el).toHaveAttribute("role", "list");
    expect(el).toHaveAttribute("data-slot", "item-group");
  });
});

describe("ItemSeparator", () => {
  it("should render separator with data-slot", () => {
    render(<ItemSeparator data-testid="sep" />);
    const el = screen.getByTestId("sep");
    expect(el).toHaveAttribute("data-slot", "item-separator");
    expect(el.tagName).toBe("HR");
  });
});

describe("Item", () => {
  it("should render div with default variant and size", () => {
    render(<Item data-testid="item">Content</Item>);
    const el = screen.getByTestId("item");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveAttribute("data-slot", "item");
    expect(el).toHaveAttribute("data-variant", "default");
    expect(el).toHaveAttribute("data-size", "default");
  });

  it("should render with outline variant", () => {
    render(<Item data-testid="item" variant="outline">Outline</Item>);
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "outline");
  });

  it("should render with muted variant", () => {
    render(<Item data-testid="item" variant="muted">Muted</Item>);
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "muted");
  });

  it("should render with sm size", () => {
    render(<Item data-testid="item" size="sm">Small</Item>);
    expect(screen.getByTestId("item")).toHaveAttribute("data-size", "sm");
  });

  it("should render as Slot when asChild is true", () => {
    render(
      <Item asChild>
        <a href="/test" data-testid="link">Link item</a>
      </Item>
    );
    const el = screen.getByTestId("link");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/test");
    expect(el).toHaveAttribute("data-slot", "item");
  });

  it("should accept custom className", () => {
    render(<Item data-testid="item" className="custom">Content</Item>);
    expect(screen.getByTestId("item")).toHaveClass("custom");
  });
});

describe("ItemMedia", () => {
  it("should render with default variant", () => {
    render(<ItemMedia data-testid="media">Media</ItemMedia>);
    const el = screen.getByTestId("media");
    expect(el).toHaveAttribute("data-slot", "item-media");
    expect(el).toHaveAttribute("data-variant", "default");
  });

  it("should render with icon variant", () => {
    render(<ItemMedia data-testid="media" variant="icon">Icon</ItemMedia>);
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "icon");
  });

  it("should render with image variant", () => {
    render(<ItemMedia data-testid="media" variant="image">Img</ItemMedia>);
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "image");
  });
});

describe("ItemContent", () => {
  it("should render with data-slot", () => {
    render(<ItemContent data-testid="c">Content</ItemContent>);
    expect(screen.getByTestId("c")).toHaveAttribute("data-slot", "item-content");
  });
});

describe("ItemTitle", () => {
  it("should render with data-slot", () => {
    render(<ItemTitle data-testid="t">Title</ItemTitle>);
    expect(screen.getByTestId("t")).toHaveAttribute("data-slot", "item-title");
  });
});

describe("ItemDescription", () => {
  it("should render paragraph with data-slot", () => {
    render(<ItemDescription data-testid="d">Description</ItemDescription>);
    const el = screen.getByTestId("d");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-slot", "item-description");
  });
});

describe("ItemActions", () => {
  it("should render with data-slot", () => {
    render(<ItemActions data-testid="a">Actions</ItemActions>);
    expect(screen.getByTestId("a")).toHaveAttribute("data-slot", "item-actions");
  });
});

describe("ItemHeader", () => {
  it("should render with data-slot", () => {
    render(<ItemHeader data-testid="h">Header</ItemHeader>);
    expect(screen.getByTestId("h")).toHaveAttribute("data-slot", "item-header");
  });
});

describe("ItemFooter", () => {
  it("should render with data-slot", () => {
    render(<ItemFooter data-testid="f">Footer</ItemFooter>);
    expect(screen.getByTestId("f")).toHaveAttribute("data-slot", "item-footer");
  });
});
