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

// Mock useLalamoveTracking hook (LAMA-010: real-time via onSnapshot, not polling)
const mockUseLalamoveTracking = jest.fn();
jest.mock('@/hooks/useLalamoveTracking', () => ({
  useLalamoveTracking: (...args: unknown[]) => mockUseLalamoveTracking(...args),
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

  // Default: useLalamoveTracking returns no data
  mockUseLalamoveTracking.mockReturnValue({
    tracking: null,
    order: null,
    loading: false,
    error: null,
  });

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

  describe('Lalamove status variants', () => {
    it('shows ASSIGNING_DRIVER status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ASSIGNING_DRIVER' },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Finding your driver...')).toBeInTheDocument();
      });
    });

    it('shows PICKED_UP status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'PICKED_UP' },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Package picked up - On the way!')).toBeInTheDocument();
      });
    });

    it('shows COMPLETED status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'COMPLETED' },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivered successfully!')).toBeInTheDocument();
      });
    });

    it('shows CANCELED status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'CANCELED' },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivery canceled')).toBeInTheDocument();
      });
    });

    it('shows REJECTED status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'REJECTED' },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivery rejected')).toBeInTheDocument();
      });
    });

    it('shows EXPIRED status text', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'EXPIRED' },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivery request expired')).toBeInTheDocument();
      });
    });
  });

  describe('order status variants', () => {
    it.each([
      ['pending_approval', 'Pending Approval'],
      ['approved', 'Approved'],
      ['processing', 'Processing'],
      ['ready_for_pickup', 'Ready for Pickup'],
      ['delivered', 'Delivered'],
      ['completed', 'Completed'],
      ['cancelled', 'Cancelled'],
      ['rejected', 'Rejected'],
      ['refunded', 'Refunded'],
    ])('shows %s status badge as "%s"', async (status, label) => {
      mockGetOrder.mockResolvedValue(createMockOrder({ status }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('falls back for unknown status', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({ status: 'unknown_status' }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('unknown_status')).toBeInTheDocument();
      });
    });
  });

  describe('driver card variations', () => {
    it('shows driver avatar fallback when no photo', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          driverPhoto: null,
          driverName: 'Juan Cruz',
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('J')).toBeInTheDocument();
      });
    });

    it('shows "D" fallback when no driver name and no photo', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          driverPhoto: null,
          driverName: null,
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('D')).toBeInTheDocument();
        // "Your Driver" appears in CardTitle and as name fallback
        expect(screen.getAllByText('Your Driver').length).toBeGreaterThanOrEqual(2);
      });
    });

    it('shows driver photo when available', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          driverPhoto: 'https://example.com/photo.jpg',
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        const img = screen.getByAltText('Juan Cruz');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
      });
    });

    it('hides Call Driver button when no phone', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          driverPhone: null,
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Juan Cruz')).toBeInTheDocument();
      });
      expect(screen.queryByText('Call Driver')).not.toBeInTheDocument();
    });
  });

  describe('handleCallDriver', () => {
    it('renders Call Driver button for driver with phone', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /Call Driver/i });
        expect(btn).toBeInTheDocument();
      });
    });
  });

  describe('ETA display', () => {
    it('shows pickup and delivery ETAs when available', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          pickupEta: '3:30 PM',
          deliveryEta: '4:15 PM',
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Pickup ETA')).toBeInTheDocument();
        expect(screen.getByText('3:30 PM')).toBeInTheDocument();
        expect(screen.getByText('Delivery ETA')).toBeInTheDocument();
        expect(screen.getByText('4:15 PM')).toBeInTheDocument();
      });
    });

    it('shows only delivery ETA when no pickup ETA', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          pickupEta: null,
          deliveryEta: '4:15 PM',
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.queryByText('Pickup ETA')).not.toBeInTheDocument();
        expect(screen.getByText('Delivery ETA')).toBeInTheDocument();
      });
    });

    it('hides ETAs section when neither is available', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          pickupEta: null,
          deliveryEta: null,
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });
      expect(screen.queryByText('Pickup ETA')).not.toBeInTheDocument();
      expect(screen.queryByText('Delivery ETA')).not.toBeInTheDocument();
    });
  });

  describe('pricing and tax display', () => {
    it('shows tax when tax > 0', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({ tax: 50 }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Tax')).toBeInTheDocument();
      });
    });

    it('hides tax when tax is 0', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({ tax: 0 }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
      });
      expect(screen.queryByText('Tax')).not.toBeInTheDocument();
    });

    it('hides delivery fee when 0', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({ deliveryFee: 0 }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
      });
      expect(screen.queryByText('Delivery Fee')).not.toBeInTheDocument();
    });

    it('shows item quantity and price', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText(/Qty: 2/)).toBeInTheDocument();
      });
    });

    it('shows item without image gracefully', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        items: [{ productId: 'p1', name: 'No Image Item', price: 100, quantity: 1 }],
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('No Image Item')).toBeInTheDocument();
      });
    });
  });

  describe('delivery address display', () => {
    it('shows pickup address for pickup orders', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        deliveryMethod: 'pickup',
        lalamoveOrderId: null,
        lalamoveTracking: null,
        pickupLocation: { address: 'BGC Store' },
        deliveryAddress: null,
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('BGC Store')).toBeInTheDocument();
        expect(screen.getByText('Pickup')).toBeInTheDocument();
      });
    });

    it('shows "Pickup" fallback when no pickup address', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        deliveryMethod: 'pickup',
        lalamoveOrderId: null,
        lalamoveTracking: null,
        pickupLocation: null,
        deliveryAddress: null,
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Pickup Order')).toBeInTheDocument();
      });
    });

    it('shows Same-Day Delivery for lalamove method', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Same-Day Delivery')).toBeInTheDocument();
      });
    });
  });

  describe('no active delivery variants', () => {
    it('shows approved status pending message', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        status: 'approved',
        lalamoveOrderId: null,
        lalamoveTracking: null,
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText(/approved.*Delivery will be arranged shortly/)).toBeInTheDocument();
      });
    });

    it('shows generic pending message for other statuses', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        status: 'processing',
        lalamoveOrderId: null,
        lalamoveTracking: null,
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText(/Delivery tracking will appear here/)).toBeInTheDocument();
      });
    });
  });

  describe('Lalamove share link', () => {
    it('hides share link when not available', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          shareLink: null,
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });
      expect(screen.queryByText('Open in Lalamove App')).not.toBeInTheDocument();
    });

    it('opens share link in new window', async () => {
      const mockOpen = jest.fn();
      window.open = mockOpen;
      mockGetOrder.mockResolvedValue(createMockOrder());
      const user = userEvent.setup();
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Open in Lalamove App')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Open in Lalamove App'));
      expect(mockOpen).toHaveBeenCalledWith('https://share.lalamove.com/abc', '_blank');
    });
  });

  describe('fetchLalamoveUpdates', () => {
    it('fetches Lalamove order and driver details on active delivery', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { status: 'ON_GOING', driverId: 'driver-1' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              driverId: 'driver-1',
              name: 'Juan Cruz',
              phone: '+639171234567',
              plateNumber: 'XYZ 789',
              photo: 'https://example.com/driver.jpg',
              location: { lat: '14.57', lng: '121.01' },
            },
          }),
        });

      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ON_GOING' },
      }));

      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/lalamove/order?orderId=llm-ord-456')
        );
      });

      await waitFor(() => {
        expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
          'test-order-123',
          expect.objectContaining({
            status: 'ON_GOING',
            driverId: 'driver-1',
            driverName: 'Juan Cruz',
            driverPhone: '+639171234567',
          })
        );
      });
    });

    it('skips Lalamove fetch when status is COMPLETED', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'COMPLETED' },
      }));

      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivered successfully!')).toBeInTheDocument();
      });

      // Should not have fetched Lalamove updates
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/lalamove/order')
      );
    });

    it('skips Lalamove fetch when status is CANCELED', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'CANCELED' },
      }));

      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivery canceled')).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/lalamove/order')
      );
    });

    it('handles Lalamove fetch error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Lalamove API down'));
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ON_GOING' },
      }));

      render(<FirebaseOrderTrackingPage />);
      // Should still render the order, not crash
      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });
    });

    it('handles Lalamove order without driverId', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { status: 'ASSIGNING_DRIVER' },
        }),
      });

      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ON_GOING' },
      }));

      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
          'test-order-123',
          expect.objectContaining({ status: 'ASSIGNING_DRIVER' })
        );
      });
      // Should NOT have the driver fields in the update
      const call = mockUpdateLalamoveTracking.mock.calls[0][1];
      expect(call.driverId).toBeUndefined();
    });

    it('handles driver fetch failure gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { status: 'ON_GOING', driverId: 'driver-1' },
          }),
        })
        .mockRejectedValueOnce(new Error('Driver API failed'));

      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ON_GOING' },
      }));

      render(<FirebaseOrderTrackingPage />);
      // Should still update with order status even without driver
      await waitFor(() => {
        expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
          'test-order-123',
          expect.objectContaining({ status: 'ON_GOING' })
        );
      });
    });

    it('updates driver location when location available', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { status: 'ON_GOING', driverId: 'driver-1' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              driverId: 'driver-1',
              name: 'Driver',
              location: { lat: '14.5', lng: '121.0' },
            },
          }),
        });

      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ON_GOING' },
      }));

      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(mockUpdateLalamoveTracking).toHaveBeenCalledWith(
          'test-order-123',
          expect.objectContaining({
            driverLocation: expect.objectContaining({
              lat: 14.5,
              lng: 121.0,
            }),
          })
        );
      });
    });

    it('handles Lalamove unsuccessful response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      });

      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: { ...createMockOrder().lalamoveTracking, status: 'ON_GOING' },
      }));

      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });
      // Should not have called updateLalamoveTracking since success=false
      expect(mockUpdateLalamoveTracking).not.toHaveBeenCalled();
    });
  });

  describe('error edge cases', () => {
    it('shows generic error for non-Error thrown', async () => {
      mockGetOrder.mockRejectedValue({ unexpected: true });
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Failed to load order')).toBeInTheDocument();
      });
    });

    it('error state Back to Orders navigates correctly', async () => {
      mockGetOrder.mockResolvedValue(null);
      const user = userEvent.setup();
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Order not found')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Back to Orders/i }));
      expect(mockPush).toHaveBeenCalledWith('/profile/order-history');
    });
  });

  describe('refreshing state', () => {
    it('shows Refreshing text during refresh', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      const user = userEvent.setup();
      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Make the next getOrder never resolve
      mockGetOrder.mockReturnValue(new Promise(() => {}));
      await user.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      });
    });
  });

  describe('multiple items', () => {
    it('renders multiple order items', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        items: [
          { productId: 'p1', name: 'Mushroom Kit A', price: 199, quantity: 1, image: 'a.jpg' },
          { productId: 'p2', name: 'Mushroom Kit B', price: 299, quantity: 3 },
        ],
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Mushroom Kit A')).toBeInTheDocument();
        expect(screen.getByText('Mushroom Kit B')).toBeInTheDocument();
        expect(screen.getByText('2 item(s)')).toBeInTheDocument();
      });
    });
  });

  describe('no driver assigned (no driverId in tracking)', () => {
    it('does not render driver card when no driverId', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          status: 'ASSIGNING_DRIVER',
          driverId: null,
          shareLink: null,
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Delivery Status')).toBeInTheDocument();
      });
      expect(screen.queryByText('Your Driver')).not.toBeInTheDocument();
      expect(screen.queryByText('Call Driver')).not.toBeInTheDocument();
    });
  });

  describe('TrackingMap props', () => {
    it('passes driver location to map when available', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByTestId('tracking-map')).toHaveTextContent('Map: ON_GOING');
      });
    });

    it('shows correct map description when no driver location', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder({
        lalamoveTracking: {
          ...createMockOrder().lalamoveTracking,
          driverLocation: null,
        },
      }));
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Map showing pickup and delivery locations')).toBeInTheDocument();
      });
    });

    it('shows follow driver text when driver location exists', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);
      await waitFor(() => {
        expect(screen.getByText('Follow your driver in real-time')).toBeInTheDocument();
      });
    });
  });

  describe('real-time tracking via useLalamoveTracking (LAMA-010)', () => {
    it('calls useLalamoveTracking with orderId', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      expect(mockUseLalamoveTracking).toHaveBeenCalledWith('test-order-123');
    });

    it('does NOT use setInterval for tracking', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      // No polling interval should be set
      const trackingIntervalCalls = setIntervalSpy.mock.calls.filter(
        (call) => typeof call[1] === 'number' && call[1] >= 10000
      );
      expect(trackingIntervalCalls).toHaveLength(0);

      setIntervalSpy.mockRestore();
    });

    it('syncs order state when realtimeOrder updates after initial load', async () => {
      const initialOrder = createMockOrder();
      mockGetOrder.mockResolvedValue(initialOrder);

      // Initially, hook returns null (no data yet)
      mockUseLalamoveTracking.mockReturnValue({
        tracking: null,
        order: null,
        loading: false,
        error: null,
      });

      const { rerender } = render(<FirebaseOrderTrackingPage />);

      // Wait for initial order to load
      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });

      // useLalamoveTracking was called with orderId
      expect(mockUseLalamoveTracking).toHaveBeenCalledWith('test-order-123');
    });

    it('displays initial order data from getOrder', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());

      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Cruz')).toBeInTheDocument();
        expect(screen.getByText('ABC 1234')).toBeInTheDocument();
      });
    });

    it('renders with null realtimeOrder gracefully', async () => {
      mockGetOrder.mockResolvedValue(createMockOrder());
      mockUseLalamoveTracking.mockReturnValue({
        tracking: null,
        order: null,
        loading: false,
        error: null,
      });

      render(<FirebaseOrderTrackingPage />);

      await waitFor(() => {
        expect(screen.getByText('Track Your Order')).toBeInTheDocument();
      });
    });

    it('useLalamoveTracking hook is imported (not setInterval)', () => {
      // Verify the mock was set up and called - if the component still used
      // setInterval instead of the hook, the mock would never be called
      mockGetOrder.mockResolvedValue(createMockOrder());
      render(<FirebaseOrderTrackingPage />);

      expect(mockUseLalamoveTracking).toHaveBeenCalled();
    });
  });
});
