import { render, screen } from "@testing-library/react";
import { AspectRatio } from "../aspect-ratio";

describe("AspectRatio", () => {
  it("should render with data-slot attribute", () => {
    render(
      <AspectRatio ratio={16 / 9} data-testid="ar">
        <div>content</div>
      </AspectRatio>
    );
    expect(screen.getByTestId("ar")).toHaveAttribute("data-slot", "aspect-ratio");
  });

  it("should render children", () => {
    render(
      <AspectRatio ratio={1}>
        <span>child</span>
      </AspectRatio>
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
