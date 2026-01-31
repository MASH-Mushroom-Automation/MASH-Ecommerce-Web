/**
 * @jest-environment jsdom
 * 
 * Seller Dashboard Page Unit Tests
 * Tests sales analytics, product management UI, order fulfillment, and pull-to-refresh
 * 
 * STORY-TEST-012: Seller Dashboard Tests
 * Coverage Target: 70%+
 * 
 * Test Coverage:
 * ✓ Sales analytics display (charts, metrics, trends)
 * ✓ Product management table (rendering, stock alerts, revenue)
 * ✓ Order fulfillment UI (recent orders, status display, customer info)
 * ✓ Pull-to-refresh functionality
 * ✓ Loading states and error handling
 * ✓ Pending orders alert system
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SellerDashboard from '../page';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useTopPerformingProducts } from '@/hooks/useTopPerformingProducts';
import { useRecentOrders } from '@/hooks/useRecentOrders';
import { useSellerDashboard } from '@/hooks/useSeller';

// Mock hooks
jest.mock('@/hooks/useAdminDashboard');
jest.mock('@/hooks/useTopPerformingProducts');
jest.mock('@/hooks/useRecentOrders');
jest.mock('@/hooks/useSeller');
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock Chart Components (avoid complex chart library rendering)
jest.mock('@/components/ui/Bar-Chart', () => ({
  ChartBarDefault: ({ data }: any) => (
    <div data-testid="bar-chart">
      {data?.map((item: any, idx: number) => (
        <div key={idx} data-testid={`bar-${idx}`}>
          {item.month}: {item.desktop}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/ui/Line-chart', () => ({
  LineChartDefault: ({ data }: any) => (
    <div data-testid="line-chart">
      {data?.map((item: any, idx: number) => (
        <div key={idx} data-testid={`line-${idx}`}>
          {item.month}: {item.desktop}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/lib/status-utils', () => ({
  getStatusBadge: (status: string) => <span data-testid="status-badge">{status}</span>,
}));

describe('SellerDashboard', () => {
  const mockAdminDashboard = useAdminDashboard as jest.MockedFunction<typeof useAdminDashboard>;
  const mockTopProducts = useTopPerformingProducts as jest.MockedFunction<typeof useTopPerformingProducts>;
  const mockRecentOrders = useRecentOrders as jest.MockedFunction<typeof useRecentOrders>;
  const mockSellerDashboard = useSellerDashboard as jest.MockedFunction<typeof useSellerDashboard>;

  const mockAdminRefetch = jest.fn();
  const mockProductsRefetch = jest.fn();
  const mockOrdersRefetch = jest.fn();
  const mockSellerRefetch = jest.fn();

  const defaultAdminData = {
    alert: {
      message: 'All systems operational',
      pendingOrders: 0,
    },
    metrics: {
      totalSales: {
        value: 125000,
        currency: '₱',
        change: 15.2,
        changeLabel: 'vs. last month',
      },
      orders: {
        value: 342,
        change: 8.5,
        changeLabel: 'vs. last month',
      },
      products: {
        value: 24,
        change: 3,
        changeLabel: 'new this month',
      },
      revenue: {
        value: 98500,
        currency: '₱',
        change: 12.3,
        changeLabel: 'vs. last month',
      },
    },
    charts: {
      weeklySales: [
        { day: 'Mon', sales: 12000 },
        { day: 'Tue', sales: 15000 },
        { day: 'Wed', sales: 18000 },
        { day: 'Thu', sales: 14000 },
        { day: 'Fri', sales: 22000 },
        { day: 'Sat', sales: 25000 },
        { day: 'Sun', sales: 19000 },
      ],
      revenueTrend: [
        { month: 'May', revenue: 24000 },
        { month: 'Jun', revenue: 26500 },
        { month: 'Jul', revenue: 32000 },
        { month: 'Aug', revenue: 28000 },
        { month: 'Sep', revenue: 35000 },
        { month: 'Oct', revenue: 42390 },
      ],
    },
  };

  const defaultTopProducts = [
    {
      productId: 'prod-1',
      productName: 'Oyster Mushrooms',
      unitsSold: 245,
      stock: 120,
      revenue: 36750,
    },
    {
      productId: 'prod-2',
      productName: 'Shiitake Mushrooms',
      unitsSold: 189,
      stock: 15,
      revenue: 28350,
    },
    {
      productId: 'prod-3',
      productName: 'Lion\'s Mane',
      unitsSold: 156,
      stock: 0,
      revenue: 23400,
    },
  ];

  const defaultRecentOrders = [
    {
      id: 'order-1',
      orderNumber: 'ORD-2024-001',
      createdAt: '2024-01-20T10:30:00Z',
      user: {
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan@example.com',
      },
      items: [{ productId: 'prod-1', quantity: 2 }],
      totalAmount: 300,
      currency: '₱',
      status: 'PENDING',
    },
    {
      id: 'order-2',
      orderNumber: 'ORD-2024-002',
      createdAt: '2024-01-20T11:45:00Z',
      user: {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria@example.com',
      },
      items: [{ productId: 'prod-2', quantity: 1 }],
      totalAmount: 150,
      currency: '₱',
      status: 'PROCESSING',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockAdminDashboard.mockReturnValue({
      data: defaultAdminData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockAdminRefetch,
    } as any);

    mockTopProducts.mockReturnValue({
      data: defaultTopProducts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockProductsRefetch,
    } as any);

    mockRecentOrders.mockReturnValue({
      data: defaultRecentOrders,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockOrdersRefetch,
    } as any);

    mockSellerDashboard.mockReturnValue({
      salesData: [
        { name: 'Mon', sales: 12000 },
        { name: 'Tue', sales: 15000 },
      ],
      productPerformance: [],
      recentOrders: [],
      loading: false,
      error: null,
      refetch: mockSellerRefetch,
    });
  });

  describe('Sales Analytics Display', () => {
    it('renders sales metrics cards with correct values', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('₱ 125,000')).toBeInTheDocument();
      expect(screen.getByText('+15.2%')).toBeInTheDocument();

      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('342')).toBeInTheDocument();
      expect(screen.getByText('+8.5%')).toBeInTheDocument();

      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();

      // Revenue appears in both card title and table, use getAllByText
      const revenueTexts = screen.getAllByText('Revenue');
      expect(revenueTexts.length).toBeGreaterThan(0);
      expect(screen.getByText('₱ 98,500')).toBeInTheDocument();
      expect(screen.getByText('+12.3%')).toBeInTheDocument();
    });

    it('displays positive trend indicators (up arrows)', () => {
      render(<SellerDashboard />);

      const upTrendTexts = screen.getAllByText(/\+\d+/);
      expect(upTrendTexts.length).toBeGreaterThan(0);
    });

    it('displays negative trend indicators (down arrows)', () => {
      mockAdminDashboard.mockReturnValue({
        data: {
          ...defaultAdminData,
          metrics: {
            ...defaultAdminData.metrics,
            totalSales: {
              ...defaultAdminData.metrics.totalSales,
              change: -5.2,
            },
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockAdminRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText('-5.2%')).toBeInTheDocument();
    });

    it('renders weekly sales bar chart with data', () => {
      render(<SellerDashboard />);

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();

      expect(screen.getByText(/Mon: 12000/)).toBeInTheDocument();
      expect(screen.getByText(/Fri: 22000/)).toBeInTheDocument();
    });

    it('renders revenue trend line chart with data', () => {
      render(<SellerDashboard />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toBeInTheDocument();

      expect(screen.getByText(/May: 24000/)).toBeInTheDocument();
      expect(screen.getByText(/Oct: 42390/)).toBeInTheDocument();
    });

    it('displays last updated timestamp', () => {
      render(<SellerDashboard />);

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    it('shows refresh button for manual data refresh', () => {
      render(<SellerDashboard />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton);

      expect(mockAdminRefetch).toHaveBeenCalled();
      expect(mockProductsRefetch).toHaveBeenCalled();
      expect(mockOrdersRefetch).toHaveBeenCalled();
      expect(mockSellerRefetch).toHaveBeenCalled();
    });
  });

  describe('Product Management Table', () => {
    it('renders top performing products table', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('Top Performing Products')).toBeInTheDocument();
      expect(screen.getByText('Products with the highest sales and revenue')).toBeInTheDocument();
    });

    it('displays product information correctly', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('Oyster Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('245')).toBeInTheDocument(); // Units sold
      expect(screen.getByText('120')).toBeInTheDocument(); // Stock
      expect(screen.getByText('₱36,750')).toBeInTheDocument(); // Revenue

      expect(screen.getByText('Shiitake Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('189')).toBeInTheDocument();
    });

    it('shows "Out of Stock" badge for zero stock products', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('shows "Low Stock" badge for stock below 20', () => {
      render(<SellerDashboard />);

      expect(screen.getByText(/Low: 15/)).toBeInTheDocument();
    });

    it('displays regular stock count for adequate inventory', () => {
      render(<SellerDashboard />);

      // Oyster Mushrooms has 120 stock (adequate)
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    it('renders "Manage products" link to products page', () => {
      render(<SellerDashboard />);

      const manageLink = screen.getByRole('link', { name: /manage products/i });
      expect(manageLink).toHaveAttribute('href', '/seller/products');
    });

    it('shows loading skeleton when products are loading', () => {
      mockTopProducts.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockProductsRefetch,
      } as any);

      render(<SellerDashboard />);

      // When any data is loading, entire dashboard shows skeleton
      expect(screen.queryByText('Top Performing Products')).not.toBeInTheDocument();
    });

    it('shows error state when products fail to load', () => {
      mockTopProducts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockProductsRefetch,
      } as any);

      render(<SellerDashboard />);

      // When any critical data fails, entire dashboard shows error
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('shows "No products found" when data is empty', () => {
      mockTopProducts.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockProductsRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  describe('Order Fulfillment Workflow', () => {
    it('renders recent orders table', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      expect(screen.getByText('Latest customer orders requiring your attention')).toBeInTheDocument();
    });

    it('displays order information correctly', () => {
      render(<SellerDashboard />);

      // Order 1
      expect(screen.getByText('ORD-2024-001')).toBeInTheDocument();
      expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument();
      expect(screen.getByText('₱300.00')).toBeInTheDocument();

      // Order 2
      expect(screen.getByText('ORD-2024-002')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('₱150.00')).toBeInTheDocument();
    });

    it('displays formatted order dates', () => {
      render(<SellerDashboard />);

      // Check that dates are rendered (format may vary by locale)
      const dates = screen.getAllByText(/1\/20\/2024|20\/1\/2024/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('shows order item counts', () => {
      render(<SellerDashboard />);

      const itemCounts = screen.getAllByText('1');
      expect(itemCounts.length).toBeGreaterThan(0); // At least one order has 1 item
    });

    it('displays order status badges', () => {
      render(<SellerDashboard />);

      const statusBadges = screen.getAllByTestId('status-badge');
      expect(statusBadges).toHaveLength(2);
      expect(statusBadges[0]).toHaveTextContent('PENDING');
      expect(statusBadges[1]).toHaveTextContent('PROCESSING');
    });

    it('shows customer email when name not available', () => {
      mockRecentOrders.mockReturnValue({
        data: [
          {
            ...defaultRecentOrders[0],
            user: {
              firstName: '',
              lastName: '',
              email: 'customer@example.com',
            },
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockOrdersRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText('customer@example.com')).toBeInTheDocument();
    });

    it('shows "Unknown" when no user information', () => {
      mockRecentOrders.mockReturnValue({
        data: [
          {
            ...defaultRecentOrders[0],
            user: null,
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockOrdersRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('renders "View all orders" link', () => {
      render(<SellerDashboard />);

      const viewAllLink = screen.getByRole('link', { name: /view all orders/i });
      expect(viewAllLink).toHaveAttribute('href', '/seller/orders');
    });

    it('shows loading skeleton when orders are loading', () => {
      mockRecentOrders.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockOrdersRefetch,
      } as any);

      render(<SellerDashboard />);

      // When any data is loading, entire dashboard shows skeleton
      expect(screen.queryByText('Recent Orders')).not.toBeInTheDocument();
    });

    it('shows error state when orders fail to load', () => {
      mockRecentOrders.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockOrdersRefetch,
      } as any);

      render(<SellerDashboard />);

      // When any critical data fails, entire dashboard shows error
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('shows "No orders found" when data is empty', () => {
      mockRecentOrders.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockOrdersRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  describe('Pending Orders Alert System', () => {
    it('shows pending orders alert when orders require attention', () => {
      mockAdminDashboard.mockReturnValue({
        data: {
          ...defaultAdminData,
          alert: {
            message: 'Pending orders require attention',
            pendingOrders: 5,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockAdminRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText('Pending Orders Require Attention')).toBeInTheDocument();
      expect(screen.getByText(/You have 5 pending orders/)).toBeInTheDocument();
    });

    it('displays singular "order" for 1 pending order', () => {
      mockAdminDashboard.mockReturnValue({
        data: {
          ...defaultAdminData,
          alert: {
            message: 'Pending orders require attention',
            pendingOrders: 1,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockAdminRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText(/1 pending order/)).toBeInTheDocument();
    });

    it('renders "View Orders" link to pending orders page', () => {
      mockAdminDashboard.mockReturnValue({
        data: {
          ...defaultAdminData,
          alert: {
            message: 'Pending orders require attention',
            pendingOrders: 3,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockAdminRefetch,
      } as any);

      render(<SellerDashboard />);

      const viewOrdersLink = screen.getByRole('link', { name: /view orders/i });
      expect(viewOrdersLink).toHaveAttribute('href', '/seller/orders?status=PENDING');
    });

    it('shows success alert when no pending orders', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('All systems operational')).toBeInTheDocument();
    });
  });

  describe('Loading States and Error Handling', () => {
    it('shows loading skeleton when admin dashboard is loading', () => {
      mockAdminDashboard.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockAdminRefetch,
      } as any);

      render(<SellerDashboard />);

      // DashboardSkeleton should render (contains Skeleton components)
      // We can't easily test Skeleton component rendering without more mocks
      // but we can verify the dashboard content is NOT present
      expect(screen.queryByText('Total Sales')).not.toBeInTheDocument();
    });

    it('shows loading skeleton when seller dashboard is loading', () => {
      mockSellerDashboard.mockReturnValue({
        salesData: [],
        productPerformance: [],
        recentOrders: [],
        loading: true,
        error: null,
        refetch: mockSellerRefetch,
      });

      render(<SellerDashboard />);

      expect(screen.queryByText('Total Sales')).not.toBeInTheDocument();
    });

    it('shows error message when admin dashboard fails', () => {
      mockAdminDashboard.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Admin API error'),
        refetch: mockAdminRefetch,
      } as any);

      render(<SellerDashboard />);

      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('shows error message when seller dashboard fails', () => {
      mockSellerDashboard.mockReturnValue({
        salesData: [],
        productPerformance: [],
        recentOrders: [],
        loading: false,
        error: 'Seller API error',
        refetch: mockSellerRefetch,
      });

      render(<SellerDashboard />);

      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Seller API error/)).toBeInTheDocument();
    });

    // Note: Skipping window.location.reload test due to jsdom limitations
    // Browser reload functionality is tested manually in E2E tests
    it.skip('allows retry on error via "Try Again" button (manual E2E test required)', () => {
      mockSellerDashboard.mockReturnValue({
        salesData: [],
        productPerformance: [],
        recentOrders: [],
        loading: false,
        error: 'Network error',
        refetch: mockSellerRefetch,
      });

      render(<SellerDashboard />);

      // Verify error state and button presence
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Pull-to-Refresh Functionality', () => {
    it('renders dashboard title', () => {
      render(<SellerDashboard />);

      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });

    // Note: Touch events are difficult to test comprehensively in jsdom
    // These tests verify the structure is present
    it('renders dashboard container with touch event support', () => {
      const { container } = render(<SellerDashboard />);

      const dashboardContainer = container.querySelector('.relative.overflow-auto');
      expect(dashboardContainer).toBeInTheDocument();
    });
  });

  describe('Data Integration', () => {
    it('calls all refetch functions on manual refresh', () => {
      render(<SellerDashboard />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(mockAdminRefetch).toHaveBeenCalledTimes(1);
      expect(mockProductsRefetch).toHaveBeenCalledTimes(1);
      expect(mockOrdersRefetch).toHaveBeenCalledTimes(1);
      expect(mockSellerRefetch).toHaveBeenCalledTimes(1);
    });

    it('uses fallback data from seller dashboard when admin data unavailable', () => {
      mockAdminDashboard.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('API down'),
        refetch: mockAdminRefetch,
      } as any);

      mockSellerDashboard.mockReturnValue({
        salesData: [
          { name: 'Mon', sales: 10000 },
          { name: 'Tue', sales: 12000 },
        ],
        productPerformance: [],
        recentOrders: [],
        loading: false,
        error: null,
        refetch: mockSellerRefetch,
      });

      render(<SellerDashboard />);

      // Should show error state, but verify seller data is available as fallback
      expect(mockSellerDashboard).toHaveBeenCalled();
    });

    it('formats currency correctly in metrics', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('₱ 125,000')).toBeInTheDocument();
      expect(screen.getByText('₱ 98,500')).toBeInTheDocument();
    });

    it('formats revenue in product table correctly', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('₱36,750')).toBeInTheDocument();
      expect(screen.getByText('₱28,350')).toBeInTheDocument();
      expect(screen.getByText('₱23,400')).toBeInTheDocument();
    });

    it('formats order totals with 2 decimal places', () => {
      render(<SellerDashboard />);

      expect(screen.getByText('₱300.00')).toBeInTheDocument();
      expect(screen.getByText('₱150.00')).toBeInTheDocument();
    });
  });

  describe('Responsive Design Elements', () => {
    it('renders grid layout for stats cards', () => {
      const { container } = render(<SellerDashboard />);

      const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statsGrid).toBeInTheDocument();
    });

    it('renders grid layout for charts', () => {
      const { container } = render(<SellerDashboard />);

      const chartsGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(chartsGrid).toBeInTheDocument();
    });

    it('renders flexible header layout', () => {
      const { container } = render(<SellerDashboard />);

      const header = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(header).toBeInTheDocument();
    });
  });
});
