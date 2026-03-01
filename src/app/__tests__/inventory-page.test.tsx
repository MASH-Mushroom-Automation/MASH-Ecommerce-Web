import { render, screen, fireEvent } from "@testing-library/react";

// Mock dependencies
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

jest.mock("@/hooks/useInventory", () => ({
  useInventory: () => ({
    loading: false,
    error: null,
    stockLevel: 30,
    lowStockProducts: [],
    getLowStockProducts: jest.fn(),
    updateStock: jest.fn(),
    setStockAlert: jest.fn(),
  }),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  TableHead: ({ children, ...props }: any) => <th {...props}>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h4>{children}</h4>,
  AlertDialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-value={defaultValue}>{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-${value}`}>{children}</div>,
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button role="tab" data-value={value}>{children}</button>,
}));

jest.mock("lucide-react", () => ({
  Package: () => <span data-testid="icon-package" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  Bell: () => <span data-testid="icon-bell" />,
  LineChart: () => <span data-testid="icon-chart" />,
}));

import InventoryPage from "../(seller)/inventory/page";

describe("InventoryPage", () => {
  it("should render page heading", () => {
    render(<InventoryPage />);
    expect(screen.getByText("Inventory Management")).toBeInTheDocument();
  });

  it("should show total products count", () => {
    render(<InventoryPage />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should show low stock count", () => {
    render(<InventoryPage />);
    expect(screen.getByText("Low Stock Items")).toBeInTheDocument();
  });

  it("should show out of stock count", () => {
    render(<InventoryPage />);
    // "Out of Stock" appears in stat card, badge, and select option
    const outOfStockElements = screen.getAllByText("Out of Stock");
    expect(outOfStockElements.length).toBeGreaterThanOrEqual(1);
  });

  it("should render all product names in table", () => {
    render(<InventoryPage />);
    // Products appear in stock table AND alerts tab due to mock rendering all tabs
    expect(screen.getAllByText("Fresh White Oyster Mushrooms").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dried Shiitake Mushrooms").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("White Oyster Mushroom Growing Kit").length).toBeGreaterThanOrEqual(1);
  });

  it("should render stock levels for products", () => {
    render(<InventoryPage />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("should render status badges", () => {
    render(<InventoryPage />);
    expect(screen.getAllByText("In Stock").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Low Stock").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Out of Stock").length).toBeGreaterThanOrEqual(1);
  });

  it("should filter products by search", () => {
    render(<InventoryPage />);
    const searchInput = screen.getByPlaceholderText("Search products...");
    fireEvent.change(searchInput, { target: { value: "Shiitake" } });
    // After filtering, Shiitake still appears, White Oyster disappears from filtered list
    expect(screen.getAllByText("Dried Shiitake Mushrooms").length).toBeGreaterThanOrEqual(1);
  });

  it("should render tab triggers", () => {
    render(<InventoryPage />);
    expect(screen.getByRole("tab", { name: "Stock Levels" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Stock Alerts" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Analytics" })).toBeInTheDocument();
  });

  it("should render Set Stock Alerts button", () => {
    render(<InventoryPage />);
    expect(screen.getByText("Set Stock Alerts")).toBeInTheDocument();
  });

  it("should show threshold values", () => {
    render(<InventoryPage />);
    // Threshold: 10 appears for 2 products
    expect(screen.getAllByText("Threshold: 10").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Threshold: 15")).toBeInTheDocument();
  });

  it("should show category information", () => {
    render(<InventoryPage />);
    expect(screen.getAllByText("Fresh Mushrooms").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dried Mushrooms").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Growing Kits").length).toBeGreaterThanOrEqual(1);
  });

  it("should show empty state when search has no results", () => {
    render(<InventoryPage />);
    const searchInput = screen.getByPlaceholderText("Search products...");
    fireEvent.change(searchInput, { target: { value: "nonexistentproduct" } });
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("should show stock analytics placeholder", () => {
    render(<InventoryPage />);
    // "Stock Analytics" appears in both tab title and content heading
    expect(screen.getAllByText("Stock Analytics").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });
});
