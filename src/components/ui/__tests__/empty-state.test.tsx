import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../empty-state";
import { ShoppingCart } from "lucide-react";

describe("EmptyState", () => {
  it("should render icon, title, and description", () => {
    render(
      <EmptyState
        icon={ShoppingCart}
        title="No items"
        description="Your cart is empty"
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("should render action button when actionLabel and onAction provided", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        icon={ShoppingCart}
        title="No items"
        description="Your cart is empty"
        actionLabel="Shop now"
        onAction={onAction}
      />
    );
    const button = screen.getByRole("button", { name: /shop now/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("should not render action button when only actionLabel is provided", () => {
    render(
      <EmptyState
        icon={ShoppingCart}
        title="No items"
        description="desc"
        actionLabel="Shop now"
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingCart}
        title="Title"
        description="Desc"
        className="my-custom"
      />
    );
    expect(container.firstChild).toHaveClass("my-custom");
  });
});
