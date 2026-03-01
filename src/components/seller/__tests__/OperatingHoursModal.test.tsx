import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ items: [], addToCart: jest.fn(), removeFromCart: jest.fn(), cartCount: 0 }),
}));
jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({ items: [], addToWishlist: jest.fn(), removeFromWishlist: jest.fn(), isInWishlist: jest.fn(() => false) }),
}));

import OperatingHoursModal from "../../OperatingHoursModal";

describe("OperatingHoursModal", () => {
  it("renders trigger button", () => {
    const { container } = render(<OperatingHoursModal />);
    expect(container.textContent).toMatch(/edit operating hours/i);
  });

  it("renders with custom trigger label", () => {
    const { container } = render(<OperatingHoursModal triggerLabel="View Hours" />);
    expect(container.textContent).toMatch(/view hours/i);
  });

  it("accepts initialHours prop without crashing", () => {
    const hours = { Monday: { closed: false, open: "08:00", close: "18:00" }, Tuesday: { closed: true } };
    const { container } = render(<OperatingHoursModal initialHours={hours} />);
    expect(container).toBeDefined();
  });

  it("accepts onSave callback prop", () => {
    const onSave = jest.fn();
    const { container } = render(<OperatingHoursModal onSave={onSave} />);
    expect(container).toBeDefined();
  });

  it("renders disabled state", () => {
    const { container } = render(<OperatingHoursModal disabled={true} />);
    expect(container).toBeDefined();
  });
});
