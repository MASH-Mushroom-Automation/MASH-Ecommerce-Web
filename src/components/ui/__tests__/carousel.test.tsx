import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { render } from "@testing-library/react";

jest.mock("embla-carousel-react", () => () => [React.createRef(), { canScrollPrev: () => true, canScrollNext: () => true, scrollPrev: jest.fn(), scrollNext: jest.fn(), on: jest.fn(), off: jest.fn() }]);
jest.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));
jest.mock("lucide-react", () => ({ ArrowLeft: () => <span>left</span>, ArrowRight: () => <span>right</span> }));

describe("Carousel UI Components", () => {
  it("renders Carousel with children", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    expect(container.textContent).toContain("Slide 1");
    expect(container.textContent).toContain("Slide 2");
  });

  it("renders CarouselPrevious and CarouselNext buttons", () => {
    const { getByText } = render(
      <Carousel>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    expect(getByText("left")).toBeDefined();
    expect(getByText("right")).toBeDefined();
  });
});
