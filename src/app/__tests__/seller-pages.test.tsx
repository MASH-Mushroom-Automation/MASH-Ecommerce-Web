/**
 * Tests for seller page components (COV-009)
 * Tests: seller/page.tsx (redirect), seller/products/edit/[id]/page.tsx, seller/products/new/page.tsx
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Re-mock next/navigation with local control
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/seller",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: "test-product-123" }),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock seller product form components
jest.mock("@/components/seller/product-form/EditProductForm", () => ({
  EditProductForm: ({ productId }: { productId: string }) => (
    <div data-testid="edit-product-form">Edit Product: {productId}</div>
  ),
}));

jest.mock("@/components/seller/product-form", () => ({
  AddProductForm: () => <div data-testid="add-product-form">Add Product Form</div>,
}));

// ============ SellerIndexPage ============
describe("SellerIndexPage", () => {
  it("should render redirecting message", async () => {
    const { default: SellerIndexPage } = await import("@/app/(seller)/seller/page");
    render(<SellerIndexPage />);
    expect(screen.getByText(/Redirecting to Seller Dashboard/)).toBeInTheDocument();
  });

  it("should call router.push to seller dashboard", async () => {
    const { default: SellerIndexPage } = await import("@/app/(seller)/seller/page");
    render(<SellerIndexPage />);
    expect(mockPush).toHaveBeenCalledWith("/seller/dashboard");
  });
});

// ============ EditProduct Page ============
describe("EditProduct Page", () => {
  it("should render EditProductForm with product id", async () => {
    const { default: EditProduct } = await import(
      "@/app/(seller)/seller/products/edit/[id]/page"
    );
    render(<EditProduct />);
    expect(screen.getByTestId("edit-product-form")).toBeInTheDocument();
    expect(screen.getByText(/test-product-123/)).toBeInTheDocument();
  });
});

// ============ AddNewProductPage ============
describe("AddNewProductPage", () => {
  it("should render AddProductForm", async () => {
    const { default: AddNewProductPage } = await import(
      "@/app/(seller)/seller/products/new/page"
    );
    render(<AddNewProductPage />);
    expect(screen.getByTestId("add-product-form")).toBeInTheDocument();
  });
});
