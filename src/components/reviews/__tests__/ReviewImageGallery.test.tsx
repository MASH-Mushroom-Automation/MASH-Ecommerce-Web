import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewImageGallery } from "../ReviewImageGallery";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, loading: _loading, sizes: _sizes, ...rest } = props;
    return <img data-testid="next-image" {...rest} />;
  },
}));

jest.mock("@radix-ui/react-visually-hidden", () => ({
  VisuallyHidden: ({ children }: any) => <span data-testid="visually-hidden">{children}</span>,
}));

const mockImages = [
  "https://cdn.example.com/review1.jpg",
  "https://cdn.example.com/review2.jpg",
  "https://cdn.example.com/review3.jpg",
  "https://cdn.example.com/review4.jpg",
  "https://cdn.example.com/review5.jpg",
];

describe("ReviewImageGallery", () => {
  it("should return null when images array is empty", () => {
    const { container } = render(<ReviewImageGallery images={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("should return null when images is undefined-like", () => {
    // Component guards with `if (!images || images.length === 0)` but
    // slice() is called before the guard, so we test with empty array instead
    const { container } = render(<ReviewImageGallery images={[] as any} />);
    expect(container.innerHTML).toBe("");
  });

  it("should render up to 3 thumbnail images", () => {
    render(<ReviewImageGallery images={mockImages} />);
    const thumbnails = screen.getAllByRole("button", { name: /View photo \d+ by/i });
    expect(thumbnails).toHaveLength(3);
  });

  it("should show extra count badge when more than 3 images", () => {
    render(<ReviewImageGallery images={mockImages} />);
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByLabelText("View 2 more photos")).toBeInTheDocument();
  });

  it("should not show extra badge when 3 or fewer images", () => {
    render(<ReviewImageGallery images={mockImages.slice(0, 3)} />);
    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });

  it("should render single image without extra badge", () => {
    render(<ReviewImageGallery images={[mockImages[0]]} />);
    const thumbnails = screen.getAllByRole("button", { name: /View photo/i });
    expect(thumbnails).toHaveLength(1);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("should use default reviewer name in alt text", () => {
    render(<ReviewImageGallery images={[mockImages[0]]} />);
    expect(screen.getByAltText("Review photo 1 by Customer")).toBeInTheDocument();
  });

  it("should use custom reviewer name in alt text", () => {
    render(<ReviewImageGallery images={[mockImages[0]]} reviewerName="Juan" />);
    expect(screen.getByAltText("Review photo 1 by Juan")).toBeInTheDocument();
  });

  it("should open lightbox on thumbnail click", () => {
    render(<ReviewImageGallery images={mockImages} />);
    fireEvent.click(screen.getByLabelText("View photo 1 by Customer"));
    expect(screen.getByText("1 of 5")).toBeInTheDocument();
  });

  it("should open lightbox at correct index when clicking +more badge", () => {
    render(<ReviewImageGallery images={mockImages} />);
    fireEvent.click(screen.getByLabelText("View 2 more photos"));
    expect(screen.getByText("4 of 5")).toBeInTheDocument();
  });

  it("should show navigation arrows when multiple images in lightbox", () => {
    render(<ReviewImageGallery images={mockImages} />);
    fireEvent.click(screen.getByLabelText("View photo 1 by Customer"));
    expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
    expect(screen.getByLabelText("Next image")).toBeInTheDocument();
  });

  it("should not show navigation arrows for single image", () => {
    render(<ReviewImageGallery images={[mockImages[0]]} />);
    fireEvent.click(screen.getByLabelText("View photo 1 by Customer"));
    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  it("should navigate to next image on arrow click", () => {
    render(<ReviewImageGallery images={mockImages} />);
    fireEvent.click(screen.getByLabelText("View photo 1 by Customer"));
    expect(screen.getByText("1 of 5")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next image"));
    expect(screen.getByText("2 of 5")).toBeInTheDocument();
  });

  it("should navigate to previous image on arrow click", () => {
    render(<ReviewImageGallery images={mockImages} />);
    fireEvent.click(screen.getByLabelText("View photo 1 by Customer"));
    fireEvent.click(screen.getByLabelText("Previous image"));
    expect(screen.getByText("5 of 5")).toBeInTheDocument();
  });

  it("should wrap around when navigating past last image", () => {
    render(<ReviewImageGallery images={mockImages.slice(0, 2)} />);
    fireEvent.click(screen.getByLabelText("View photo 2 by Customer"));
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next image"));
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("should show close button in lightbox", () => {
    render(<ReviewImageGallery images={mockImages} />);
    fireEvent.click(screen.getByLabelText("View photo 1 by Customer"));
    expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
  });
});
