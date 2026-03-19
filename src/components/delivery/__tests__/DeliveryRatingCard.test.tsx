import { fireEvent, render, screen } from "@testing-library/react";
import DeliveryRatingCard from "../DeliveryRatingCard";

describe("DeliveryRatingCard", () => {
  it("should render 5 star buttons", () => {
    render(<DeliveryRatingCard onSubmit={jest.fn()} />);
    const stars = screen.getAllByRole("button", { name: /Rate \d stars?/i });
    expect(stars).toHaveLength(5);
  });

  it("should set rating when a star is clicked", () => {
    render(<DeliveryRatingCard onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Rate 4 stars/i }));
    expect(
      screen.getByRole("button", { name: /Rate 4 stars/i }).querySelector("svg")
    ).toHaveClass("fill-emerald-500");
  });

  it("should call onSubmit with selected rating", () => {
    const onSubmit = jest.fn();
    render(<DeliveryRatingCard onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /Rate 5 stars/i }));
    fireEvent.click(screen.getByRole("button", { name: /Submit rating/i }));

    expect(onSubmit).toHaveBeenCalledWith(5, "");
  });

  it("should include comment when provided", () => {
    const onSubmit = jest.fn();
    render(<DeliveryRatingCard onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /Rate 3 stars/i }));
    fireEvent.change(screen.getByLabelText(/Comment/i), {
      target: { value: "Driver was very polite" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit rating/i }));

    expect(onSubmit).toHaveBeenCalledWith(3, "Driver was very polite");
  });

  it("should disable interactions after submission", () => {
    render(<DeliveryRatingCard onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Rate 2 stars/i }));
    fireEvent.click(screen.getByRole("button", { name: /Submit rating/i }));

    expect(screen.getByRole("button", { name: /Rating submitted/i })).toBeDisabled();
    expect(screen.getByLabelText(/Comment/i)).toBeDisabled();
  });

  it("should show existing rating", () => {
    render(
      <DeliveryRatingCard
        onSubmit={jest.fn()}
        existingRating={4}
        existingComment="Already rated"
      />
    );

    expect(screen.getAllByText(/Submitted/i).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("Already rated")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rating submitted/i })).toBeDisabled();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryRatingCard onSubmit={jest.fn()} className="custom-rating-card" />
    );

    expect(container.firstChild).toHaveClass("custom-rating-card");
  });
});
