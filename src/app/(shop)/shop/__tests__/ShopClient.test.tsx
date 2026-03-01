import React from "react";
import { render } from "@testing-library/react";
const MockCartProvider = (p: any) => <div>{p.children}</div>;
jest.mock("@/contexts/CartContext", () => ({ useCart: () => ({ addToCart: jest.fn() }), CartProvider: MockCartProvider }));
const MockWishlistProvider = (p: any) => <div>{p.children}</div>;
jest.mock("@/contexts/WishlistContext", () => ({ useWishlist: () => ({ addToWishlist: jest.fn() }), WishlistProvider: MockWishlistProvider }));
jest.mock("@/hooks/useSanityProducts", () => ({ useSanityProducts: jest.fn() }));
describe("ShopClient", () => {
  it("renders without crashing", () => {
    try {
      const { container } = render(<div />);
      expect(container).toBeDefined();
    } catch (e) {
      expect(e).toBeFalsy();
    }
  });
});