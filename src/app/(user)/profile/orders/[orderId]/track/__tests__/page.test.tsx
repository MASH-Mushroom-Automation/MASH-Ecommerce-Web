/**
 * Firebase Order Tracking Page Tests
 * Tests rendering states, auth redirect, order display, and refresh functionality
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FirebaseOrderTrackingPage from '../page';

// Mock child components to avoid deep rendering
jest.mock('@/components/delivery/TrackingMap', () => {
  return function MockTrackingMap(props: { pickup: { address: string }; dropoff: { address: string }; status: string }) {
    return <div data-testid="tracking-map">Map: {props.status}</div>;
  };
});

jest.mock('@/components/delivery/StatusTimeline', () => {
  return function MockStatusTimeline(props: { currentStatus: string }) {
    return <div data-testid="status-timeline">Timeline: {props.currentStatus}</div>;
  };
});

// Mock FirebaseOrdersService
const mockGetOrder = jest.fn();
const mockUpdateLalamoveTracking = jest.fn();

jest.mock('@/lib/firebase/orders', () => ({
  FirebaseOrdersService: {
    getOrder: (...args: unknown[]) => mockGetOrder(...args),
    updateLalamoveTracking: (...args: unknown[]) => mockUpdateLalamoveTracking(...args),
  },
}));

// Base order data
const createMockOrder = (overrides = {}) => ({
  id: 'test-order-123',
  userId: 'test-user-id',
  orderNumber: 'ORD-2026-001',
  status: 'shipped' as const,
  items: [
    {
      productId: 'prod-1',
      name: 'Premium Mushroom Kit',
      price: 299,
      quantity: 2,
      image: 'https://cdn.example.com/mushroom.jpg',
    },
  ],
  subtotal: 598,
  deliveryFee: 55,
  tax: 0,
  total: 653,
  deliveryMethod: 'lalamove' as const,
  deliveryAddress: {
    address: '123 Main St, Manila',
    lat: 14.5995,
    lng: 120.9842,
  },
  pickupLocation: null,
  lalamoveOrderId: 'llm-ord-456',
  lalamoveTracking: {
    status: 'ON_GOING',
    driverId: 'driver-1',
    driverName: 'Juan Cruz',
    driverPhone: '+639171234567',
    driverPlateNumber: 'ABC 1234',
    driverPhoto: null,
    driverLocation: { lat: 14.56, lng: 121.0, updatedAt: '2026-02-20T15:00:00Z' },
    shareLink: 'https://share.lalamove.com/abc',
  },
  createdAt: '2026-02-20T10:00:00Z',
  ...overrides,
});

// Override next/navigation mock for this test file
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  useParams: jest.fn(() => ({ orderId: 'test-order-123' })),
  usePathname: jest.fn(() => '/profile/orders/test-order-123/track'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetOrder.mockReset();
  mockUpdateLalamoveTracking.mockReset();
  mockPush.mockReset();

  // Default: authenticated user via global.__mockAuthContext
  (global as Record<string, unknown>).__mockAuthContext = {
    user: { id: 'test-user-id', email: 'test@example.com', displayName: 'Test User' },
    isAuthenticated: true,
    loading: false,
    signInWithGoogle: jest.fn(),
    signInWithEmailPassword: jest.fn(),
    signOut: jest.fn(),
  };

  // Default: fetch returns success for Lalamove API calls
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, data: { status: 'ON_GOING' } }),
  });
});

describe('FirebaseOrderTrackingPage', () => {
  describe('loading state', () => {
    it('shows loading spinner while fetching order', () => {
      mockGetOrder.mockReturnValue(new Promise(() => {})); // Never resolves
      render(<FirebaseOrderTrackingPage />);
      expect(screen.getByText('Loading order details...')).toBeInTheDocument();
    });
  });

  describe('authentication', () => {
    it('redirects to login when not authenticated', async () => {
      (global as Record<string, unknown>).__mockAuthContext = {
        user: null,
        isAuthenticated: false,
        loading: false,
        signInWithGoogle: jest.fn(),
        signInWithEmailPassword: jest.fn(),
        signOut: jest.fn(),
      };

      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=/profile/orders');
      });
    });

    it('shows loading while auth is loading', () => {
      (global as Record<string, unknown>).__mockAuthContext = {
        user: null,
        isAuthenticated: false,
        loading: true,
        signInWithGoogle: jest.fn(),
        signInWithEmailPassword: jest.fn(),
        signOut: jest.fn(),
      };

      render(<FirebaseOrderTrackingPage />);
      expect(screen.getByText('Loading order details...')).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('shows error when order not found', async () => {
      mockGetOrder.mockResolvedValue(null);
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Order not found')).toBeInTheDocument();
      });
    });

    it('shows error when order belongs to different user', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({ userId: 'different-user-id' }));
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Order not found')).toBeInTheDocument();
      });
    });

    it('shows error message on fetch failure', async () => {
      mockGetOrder.mockRejectedValue(new Error('Network error'));
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows Back to Orders button on error', async () => {
      mockGetOrder.mockResolvedValue(null);
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Back to Orders')).toBeInTheDocument();
      });
    });
  });

  describe('order display', () => {
    it('displays order number and status', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
        expect(screen.getByText('Order #ORD-2026-001')).toBeInTheDocument();
      });
    });

    it('shows order status badge', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
      });
    });

    it('shows delivery address', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('123 Main St, Manila')).toBeInTheDocument();
      });
    });

    it('shows order items', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Premium Mushroom Kit')).toBeInTheDocument();
      });
    });

    it('shows pricing breakdown', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
        expect(screen.getByText('Delivery Fee')).toBeInTheDocument();
      });
    });
  });

  describe('active delivery tracking', () => {
    it('renders StatusTimeline with current status', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-timeline')).toBeInTheDocument();
        expect(screen.getByText('Timeline: ON_GOING')).toBeInTheDocument();
      });
    });

    it('renders TrackingMap', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('tracking-map')).toBeInTheDocument();
      });
    });

    it('shows driver details when driver assigned', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Cruz')).toBeInTheDocument();
        expect(screen.getByText('ABC 1234')).toBeInTheDocument();
      });
    });

    it('shows Call Driver button when phone available', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Call Driver')).toBeInTheDocument();
      });
    });

    it('shows Lalamove share link button', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Open in Lalamove App')).toBeInTheDocument();
      });
    });

    it('shows delivery status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Driver on the way to pickup')).toBeInTheDocument();
      });
    });
  });

  describe('no active delivery', () => {
    it('shows pending message for lalamove order without tracking', async () => {
      mockGetOrder.mockResolvedValue(
        createMockOrder({
          status: 'pending_approval',
          lalamoveOrderId: null,
          lalamoveTracking: null,
        })
      );
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Delivery Not Yet Started')).toBeInTheDocument();
        expect(
          screen.getByText(/waiting for seller approval/)
        ).toBeInTheDocument();
      });
    });

    it('shows pickup message for pickup orders', async () => {
      mockGetOrder.mockResolvedValue(
        createMockOrder({
          deliveryMethod: 'pickup',
          lalamoveOrderId: null,
          lalamoveTracking: null,
          pickupLocation: { address: 'MASH Store, BGC' },
        })
      );
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Pickup Order')).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('Back to Orders button navigates to order history', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      const user = userEvent.setup();
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });

      const backButtons = screen.getAllByText('Back to Orders');
      await user.click(backButtons[0]);

      expect(mockPush).toHaveBeenCalledWith('/profile/order-history');
    });

    it('Contact Support button navigates to contact page', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      const user = userEvent.setup();
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Contact Support')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Contact Support'));
      expect(mockPush).toHaveBeenCalledWith('/contact');
    });
  });

  describe('refresh', () => {
    it('shows Refresh button', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
    });

    it('calls fetchOrder when refresh clicked', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      const user = userEvent.setup();
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Clear mock to track new calls
      mockGetOrder.mockClear();
      mockGetOrder.mockResolvedValue(createMockOrder());

      await user.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(mockGetOrder).toHaveBeenCalledWith('test-order-123');
      });
    });
  });

  describe('support section', () => {
    it('shows support help text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Need help with your order?')).toBeInTheDocument();
        expect(screen.getByText('Our support team is here to help')).toBeInTheDocument();
      });
    });
  });
});
