import React from "react";
import OrdersPage from "@/app/(seller)/orders/page";
import { render } from "@testing-library/react";

jest.mock("@/hooks/useSanityOrders", () => ({ useSanityOrders: () => ({
  orders: [{ id: "1", customer: "Test", status: "pending" }],
  summary: {
    totalOrders: 1,
    deliveredOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 1,
    processingOrders: 0,
    shippedOrders: 0,
    totalRevenue: 1000,
    averageOrderValue: 1000,
    priorityOrders: 0,
  },
  loading: false,
  error: null,
  searchOrders: jest.fn(() => [{ id: "1", customer: "Test", status: "pending" }]),
  refetch: jest.fn(),
}) }));
jest.mock("@/components/orders/OrderCard", () => ({ OrderList: ({ orders }: any) => <div>OrderList: {orders.length}</div> }));
jest.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div>{children}</div>, CardContent: ({ children }: any) => <div>{children}</div>, CardHeader: ({ children }: any) => <div>{children}</div>, CardTitle: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));
jest.mock("@/components/ui/input", () => ({ Input: (props: any) => <input {...props} /> }));
jest.mock("@/components/ui/select", () => ({ Select: ({ children, ...props }: any) => <select {...props}>{children}</select>, SelectContent: ({ children }: any) => <div>{children}</div>, SelectItem: ({ children, ...props }: any) => <option {...props}>{children}</option>, SelectTrigger: ({ children }: any) => <div>{children}</div>, SelectValue: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/badge", () => ({ Badge: ({ children }: any) => <span>{children}</span> }));
jest.mock("lucide-react", () => ({ Package: () => <span>icon</span>, DollarSign: () => <span>icon</span>, Clock: () => <span>icon</span>, TrendingUp: () => <span>icon</span>, Search: () => <span>icon</span>, Filter: () => <span>icon</span>, Download: () => <span>icon</span> }));

describe("OrdersPage", () => {
  it("renders without crashing (try/catch)", () => {
    let error = null;
    try {
      const { container } = render(<OrdersPage />);
      expect(container.textContent).toBeDefined();
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });
});
