/**
 * LalamoveClient Unit Tests
 * Tests HMAC signature generation, API request formatting, error handling
 */

// Use var declarations so jest.mock hoisting can reference them
var mockHmacUpdate = jest.fn().mockReturnThis();
var mockHmacDigest = jest.fn().mockReturnValue('mock-signature-hex');
var mockCreateHmac = jest.fn().mockReturnValue({
  update: mockHmacUpdate,
  digest: mockHmacDigest,
});

jest.mock('crypto', () => ({
  createHmac: (...args: unknown[]) => mockCreateHmac(...args),
}));

// Set env vars before importing client
const originalEnv = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  mockHmacUpdate.mockReturnThis();
  mockHmacDigest.mockReturnValue('mock-signature-hex');
  mockCreateHmac.mockReturnValue({
    update: mockHmacUpdate,
    digest: mockHmacDigest,
  });

  process.env = {
    ...originalEnv,
    LALAMOVE_API_KEY: 'pk_test_testkey123',
    LALAMOVE_API_SECRET: 'sk_test_testsecret456',
    LALAMOVE_HOST: 'https://rest.sandbox.lalamove.com',
    LALAMOVE_MARKET: 'PH',
  };

  // Reset global fetch mock
  (global.fetch as jest.Mock).mockReset();
});

afterAll(() => {
  process.env = originalEnv;
});

// Must import AFTER setting env vars + mocks
import { LalamoveClient, getLalamoveClient } from '../client';
import type { LalamoveQuotationRequest, LalamoveOrderRequest } from '../client';

describe('LalamoveClient', () => {
  describe('constructor', () => {
    it('initializes with environment variables', () => {
      const client = new LalamoveClient();
      expect(client).toBeDefined();
    });

    it('throws error when API key is missing', () => {
      delete process.env.LALAMOVE_API_KEY;
      expect(() => new LalamoveClient()).toThrow('Lalamove API credentials not configured');
    });

    it('throws error when API secret is missing', () => {
      delete process.env.LALAMOVE_API_SECRET;
      expect(() => new LalamoveClient()).toThrow('Lalamove API credentials not configured');
    });

    it('defaults host to sandbox when LALAMOVE_HOST not set', () => {
      delete process.env.LALAMOVE_HOST;
      const client = new LalamoveClient();
      expect(client).toBeDefined();
    });

    it('defaults market to PH when LALAMOVE_MARKET not set', () => {
      delete process.env.LALAMOVE_MARKET;
      const client = new LalamoveClient();
      expect(client).toBeDefined();
    });
  });

  describe('HMAC signature generation', () => {
    it('generates HMAC SHA256 signature with CRLF separators', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { quotationId: 'q123' },
        })),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const client = new LalamoveClient();
      const request: LalamoveQuotationRequest = {
        serviceType: 'MOTORCYCLE',
        stops: [
          { coordinates: { lat: '14.5995', lng: '120.9842' }, address: 'Manila' },
          { coordinates: { lat: '14.5547', lng: '121.0244' }, address: 'Makati' },
        ],
      };

      await client.getQuotation(request);

      // Verify HMAC was created with sha256 and the secret
      expect(mockCreateHmac).toHaveBeenCalledWith('sha256', 'sk_test_testsecret456');

      // Verify the raw signature uses \r\n (CRLF) separators
      const rawSignature = mockHmacUpdate.mock.calls[0][0];
      expect(rawSignature).toContain('\r\n');
      expect(rawSignature).toContain('POST');
      expect(rawSignature).toContain('/v3/quotations');
    });

    it('uses empty string for body in GET requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { quotationId: 'q123' },
        })),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const client = new LalamoveClient();
      await client.getQuotationDetails('q123');

      const rawSignature = mockHmacUpdate.mock.calls[0][0];
      // GET requests should have empty body at the end
      expect(rawSignature).toMatch(/\r\n\r\n$/);
    });
  });

  describe('getQuotation', () => {
    it('sends POST request to /v3/quotations with correct format', async () => {
      const quotationData = {
        quotationId: 'quot-123',
        expiresAt: '2026-02-21T00:00:00Z',
        serviceType: 'MOTORCYCLE',
        language: 'en_PH',
        stops: [],
        isRouteOptimized: false,
        priceBreakdown: {
          base: '49',
          totalExcludePriorityFee: '55',
          total: '55',
          currency: 'PHP',
        },
        distance: { value: '5.2', unit: 'km' },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({ data: quotationData })),
      });

      const client = new LalamoveClient();
      const request: LalamoveQuotationRequest = {
        serviceType: 'MOTORCYCLE',
        stops: [
          { coordinates: { lat: '14.5995', lng: '120.9842' }, address: 'Manila' },
          { coordinates: { lat: '14.5547', lng: '121.0244' }, address: 'Makati' },
        ],
      };

      const result = await client.getQuotation(request);

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/quotations',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"serviceType":"MOTORCYCLE"'),
        })
      );

      // Verify headers include Authorization and Market
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers['Authorization']).toMatch(/^hmac pk_test_testkey123:\d+:mock-signature-hex$/);
      expect(headers['Market']).toBe('PH');
      expect(headers['Content-Type']).toBe('application/json');

      // Verify response
      expect(result.quotationId).toBe('quot-123');
      expect(result.priceBreakdown.total).toBe('55');
    });

    it('includes item details when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { quotationId: 'q456' },
        })),
      });

      const client = new LalamoveClient();
      const request: LalamoveQuotationRequest = {
        serviceType: 'CAR',
        stops: [
          { coordinates: { lat: '14.5995', lng: '120.9842' }, address: 'Manila' },
          { coordinates: { lat: '14.5547', lng: '121.0244' }, address: 'Makati' },
        ],
        item: {
          quantity: '3',
          weight: 'LESS_THAN_10_KG',
          categories: ['FOOD'],
          handlingInstructions: ['FRAGILE'],
        },
      };

      await client.getQuotation(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.data.item.weight).toBe('LESS_THAN_10_KG');
      expect(body.data.item.categories).toEqual(['FOOD']);
    });

    it('includes scheduleAt for scheduled deliveries', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { quotationId: 'q789' },
        })),
      });

      const client = new LalamoveClient();
      const scheduledTime = '2026-02-25T10:00:00Z';
      const request: LalamoveQuotationRequest = {
        serviceType: 'MOTORCYCLE',
        stops: [
          { coordinates: { lat: '14.5995', lng: '120.9842' }, address: 'Manila' },
          { coordinates: { lat: '14.5547', lng: '121.0244' }, address: 'Makati' },
        ],
        scheduleAt: scheduledTime,
      };

      await client.getQuotation(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.data.scheduleAt).toBe(scheduledTime);
    });
  });

  describe('getQuotationDetails', () => {
    it('sends GET request to /v3/quotations/{id}', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { quotationId: 'q123', serviceType: 'MOTORCYCLE' },
        })),
      });

      const client = new LalamoveClient();
      const result = await client.getQuotationDetails('q123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/quotations/q123',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.quotationId).toBe('q123');
    });
  });

  describe('placeOrder', () => {
    it('sends POST request to /v3/orders with sender and recipients', async () => {
      const orderData = {
        orderId: 'ord-456',
        quotationId: 'q123',
        status: 'ASSIGNING_DRIVER',
        shareLink: 'https://share.lalamove.com/abc',
        priceBreakdown: {
          base: '49',
          totalExcludePriorityFee: '55',
          total: '55',
          currency: 'PHP',
        },
        distance: { value: '5.2', unit: 'km' },
        stops: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({ data: orderData })),
      });

      const client = new LalamoveClient();
      const request: LalamoveOrderRequest = {
        quotationId: 'q123',
        sender: { stopId: 'stop-1', name: 'MASH Seller', phone: '+639171234567' },
        recipients: [
          { stopId: 'stop-2', name: 'Customer Name', phone: '+639179876543' },
        ],
      };

      const result = await client.placeOrder(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/orders',
        expect.objectContaining({ method: 'POST' })
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.data.quotationId).toBe('q123');
      expect(body.data.sender.name).toBe('MASH Seller');
      expect(body.data.recipients).toHaveLength(1);

      expect(result.orderId).toBe('ord-456');
      expect(result.status).toBe('ASSIGNING_DRIVER');
      expect(result.shareLink).toBe('https://share.lalamove.com/abc');
    });

    it('includes POD and metadata when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { orderId: 'ord-789', status: 'ASSIGNING_DRIVER' },
        })),
      });

      const client = new LalamoveClient();
      const request: LalamoveOrderRequest = {
        quotationId: 'q456',
        sender: { stopId: 'stop-1', name: 'Seller', phone: '+639171234567' },
        recipients: [{ stopId: 'stop-2', name: 'Buyer', phone: '+639179876543' }],
        isPODEnabled: true,
        metadata: { internalOrderId: 'ORD-12345' },
      };

      await client.placeOrder(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.data.isPODEnabled).toBe(true);
      expect(body.data.metadata.internalOrderId).toBe('ORD-12345');
    });
  });

  describe('getOrderDetails', () => {
    it('sends GET request to /v3/orders/{orderId}', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: {
            orderId: 'ord-123',
            status: 'ON_GOING',
            driverId: 'driver-1',
          },
        })),
      });

      const client = new LalamoveClient();
      const result = await client.getOrderDetails('ord-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/orders/ord-123',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.status).toBe('ON_GOING');
      expect(result.driverId).toBe('driver-1');
    });
  });

  describe('getDriverDetails', () => {
    it('sends GET request to /v3/orders/{orderId}/drivers/{driverId}', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: {
            driverId: 'driver-1',
            name: 'Juan Cruz',
            phone: '+639171111111',
            plateNumber: 'ABC 1234',
            coordinates: {
              lat: '14.5600',
              lng: '121.0000',
              updatedAt: '2026-02-20T15:00:00Z',
            },
          },
        })),
      });

      const client = new LalamoveClient();
      const result = await client.getDriverDetails('ord-123', 'driver-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/orders/ord-123/drivers/driver-1',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.name).toBe('Juan Cruz');
      expect(result.plateNumber).toBe('ABC 1234');
      expect(result.coordinates?.lat).toBe('14.5600');
    });
  });

  describe('cancelOrder', () => {
    it('sends DELETE request to /v3/orders/{orderId}', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Map(),
        text: jest.fn().mockResolvedValue(''),
      });

      const client = new LalamoveClient();
      await client.cancelOrder('ord-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/orders/ord-123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('addPriorityFee', () => {
    it('sends POST to /v3/orders/{orderId}/priority-fee', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { orderId: 'ord-123', status: 'ASSIGNING_DRIVER' },
        })),
      });

      const client = new LalamoveClient();
      const result = await client.addPriorityFee('ord-123', '50');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/orders/ord-123/priority-fee',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"priorityFee":"50"'),
        })
      );
    });
  });

  describe('error handling', () => {
    it('throws with validation error details from API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          errors: [
            { field: 'stops', message: 'At least 2 stops are required' },
            { field: 'serviceType', message: 'Invalid service type' },
          ],
        })),
      });

      const client = new LalamoveClient();
      await expect(client.getQuotation({
        serviceType: 'MOTORCYCLE',
        stops: [],
      })).rejects.toThrow('Validation failed');
    });

    it('throws with error message from API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          message: 'ERR_INVALID_HMAC_SIGNATURE',
        })),
      });

      const client = new LalamoveClient();
      await expect(client.getQuotation({
        serviceType: 'MOTORCYCLE',
        stops: [
          { coordinates: { lat: '14.5', lng: '120.9' }, address: 'A' },
          { coordinates: { lat: '14.6', lng: '121.0' }, address: 'B' },
        ],
      })).rejects.toThrow('ERR_INVALID_HMAC_SIGNATURE');
    });

    it('throws generic error when no error details in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue('{}'),
      });

      const client = new LalamoveClient();
      await expect(client.getOrderDetails('ord-999')).rejects.toThrow('500');
    });

    it('handles non-JSON error responses gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Map([['content-type', 'text/html']]),
        text: jest.fn().mockResolvedValue('<html>Bad Gateway</html>'),
      });

      const client = new LalamoveClient();
      await expect(client.cancelOrder('ord-999')).rejects.toThrow('502');
    });

    it('handles empty JSON response body (content-type application/json, empty text)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(''),
      });

      const client = new LalamoveClient();
      const result = await client.getOrderDetails('ord-empty');
      // Empty response body → responseData stays {}, !responseData.data → returns {} as T
      expect(result).toEqual({});
    });

    it('parses JSON from non-JSON content-type response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/plain']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: { orderId: 'ord-text', status: 'COMPLETED' },
        })),
      });

      const client = new LalamoveClient();
      const result = await client.getOrderDetails('ord-text');
      expect(result.orderId).toBe('ord-text');
    });

    it('returns empty data when response.data is missing on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({ message: 'ok but no data field' })),
      });

      const client = new LalamoveClient();
      const result = await client.getOrderDetails('ord-nodata');
      // !responseData.data is true → returns {} as T
      expect(result).toEqual({});
    });
  });

  describe('getCities', () => {
    it('sends GET request to /v3/cities', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: [{ name: 'Manila', locode: 'PH MNL' }],
        })),
      });

      const client = new LalamoveClient();
      const result = await client.getCities();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.sandbox.lalamove.com/v3/cities',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual([{ name: 'Manila', locode: 'PH MNL' }]);
    });
  });

  describe('validateServiceArea', () => {
    it('returns true when cities are available', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue(JSON.stringify({
          data: [{ name: 'Manila' }],
        })),
      });

      const client = new LalamoveClient();
      const result = await client.validateServiceArea('14.5995', '120.9842');
      expect(result).toBe(true);
    });

    it('returns false on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map([['content-type', 'application/json']]),
        text: jest.fn().mockResolvedValue('{}'),
      });

      const client = new LalamoveClient();
      const result = await client.validateServiceArea('0', '0');
      expect(result).toBe(false);
    });
  });
});

describe('getLalamoveClient', () => {
  it('returns a singleton instance', () => {
    const client1 = getLalamoveClient();
    const client2 = getLalamoveClient();
    expect(client1).toBe(client2);
  });
});

describe('vehicle-types', () => {
  // Import directly to test
  const { LALAMOVE_VEHICLES, calculateEstimate } = require('../vehicle-types');

  it('has 7 vehicle types', () => {
    expect(LALAMOVE_VEHICLES).toHaveLength(7);
  });

  it('motorcycle is the first and cheapest vehicle', () => {
    expect(LALAMOVE_VEHICLES[0].id).toBe('motorcycle');
    expect(LALAMOVE_VEHICLES[0].baseFare).toBe(49);
    expect(LALAMOVE_VEHICLES[0].weightLimit).toBe(20);
  });

  it('FB truck is the largest vehicle', () => {
    const fb = LALAMOVE_VEHICLES[LALAMOVE_VEHICLES.length - 1];
    expect(fb.id).toBe('fb');
    expect(fb.weightLimit).toBe(2000);
    expect(fb.baseFare).toBe(900);
  });

  it('all vehicles have required properties', () => {
    for (const vehicle of LALAMOVE_VEHICLES) {
      expect(vehicle.id).toBeDefined();
      expect(vehicle.name).toBeDefined();
      expect(vehicle.baseFare).toBeGreaterThan(0);
      expect(vehicle.weightLimit).toBeGreaterThan(0);
      expect(vehicle.sizeLimit).toBeDefined();
      expect(vehicle.pricePerKm).toBeDefined();
      expect(vehicle.addStopFee).toBeGreaterThan(0);
    }
  });

  describe('calculateEstimate', () => {
    it('returns base fare + km cost for motorcycle', () => {
      const estimate = calculateEstimate('motorcycle', 3);
      // baseFare(49) + 3km * 18 = 49 + 54 = 103
      expect(estimate).toBe(103);
    });

    it('applies tiered pricing above 5km', () => {
      const estimate = calculateEstimate('motorcycle', 10);
      // baseFare(49) + 5*18 + 5*15 = 49 + 90 + 75 = 214
      expect(estimate).toBe(214);
    });

    it('includes add stop fee', () => {
      const estimate = calculateEstimate('motorcycle', 3, 2);
      // baseFare(49) + 3*18 + 2*40 = 49 + 54 + 80 = 183
      expect(estimate).toBe(183);
    });

    it('returns 0 for unknown vehicle', () => {
      expect(calculateEstimate('unknown-vehicle', 5)).toBe(0);
    });

    it('returns base fare for 0 km', () => {
      const estimate = calculateEstimate('motorcycle', 0);
      expect(estimate).toBe(49);
    });
  });
});
