/**
 * Lalamove API Client
 * Handles same-day delivery integration with HMAC authentication
 * 
 * API Documentation: https://developers.lalamove.com
 * Test Credentials: Sandbox environment (no real deliveries)
 * Production: Switch LALAMOVE_HOST to https://rest.lalamove.com
 */

import crypto from 'crypto';

export interface LalamoveCoordinates {
  lat: string;
  lng: string;
}

export interface LalamoveStop {
  stopId?: string;
  coordinates: LalamoveCoordinates;
  address: string;
  name?: string;
  phone?: string;
  remarks?: string;
}

export interface LalamoveQuotationRequest {
  serviceType: 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK';
  language?: string;
  stops: LalamoveStop[];
  item?: {
    quantity?: string;
    weight?: 'LESS_THAN_3_KG' | 'LESS_THAN_5_KG' | 'LESS_THAN_10_KG' | 'LESS_THAN_15_KG';
    categories?: string[];
    handlingInstructions?: string[];
  };
  scheduleAt?: string; // ISO 8601 format
}

export interface LalamovePriceBreakdown {
  base: string;
  extraMileage?: string;
  adminFee?: string;
  totalBeforeOptimization?: string;
  totalExcludePriorityFee: string;
  total: string;
  currency: string;
  priorityFee?: string;
}

export interface LalamoveQuotationResponse {
  quotationId: string;
  scheduleAt?: string;
  expiresAt: string;
  serviceType: string;
  language: string;
  stops: LalamoveStop[];
  isRouteOptimized: boolean;
  priceBreakdown: LalamovePriceBreakdown;
  distance: {
    value: string;
    unit: string;
  };
}

export interface LalamoveOrderRequest {
  quotationId: string;
  sender: {
    stopId: string;
    name: string;
    phone: string;
  };
  recipients: Array<{
    stopId: string;
    name: string;
    phone: string;
    remarks?: string;
  }>;
  isPODEnabled?: boolean;
  partner?: string;
  metadata?: Record<string, string>;
}

export interface LalamoveOrderResponse {
  orderId: string;
  quotationId: string;
  priceBreakdown: LalamovePriceBreakdown;
  driverId?: string;
  shareLink: string;
  status: 'ASSIGNING_DRIVER' | 'ON_GOING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';
  distance: {
    value: string;
    unit: string;
  };
  stops: LalamoveStop[];
}

export interface LalamoveDriverDetails {
  driverId: string;
  name: string;
  phone: string;
  plateNumber: string;
  photo?: string;
  coordinates?: {
    lat: string;
    lng: string;
    updatedAt: string;
  };
}

export class LalamoveClient {
  private apiKey: string;
  private apiSecret: string;
  private host: string;
  private market: string;

  constructor() {
    this.apiKey = process.env.LALAMOVE_API_KEY!;
    this.apiSecret = process.env.LALAMOVE_API_SECRET!;
    this.host = process.env.LALAMOVE_HOST || 'https://rest.sandbox.lalamove.com';
    this.market = process.env.LALAMOVE_MARKET || 'PH';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Lalamove API credentials not configured. Check environment variables.');
    }
  }

  /**
   * Generate HMAC SHA256 signature for authentication
   * CRITICAL: Must match Lalamove's exact signature format
   */
  private generateSignature(
    timestamp: string,
    method: string,
    path: string,
    body: string
  ): string {
    // CRITICAL: Use \r\n (CRLF) as line separator
    const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;
    
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(rawSignature)
      .digest('hex');
  }

  /**
   * Make authenticated request to Lalamove API
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<{ data: T }> {
    const timestamp = new Date().getTime().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method, path, bodyString);
    const token = `${this.apiKey}:${timestamp}:${signature}`;

    const url = `${this.host}${path}`;
    const headers: HeadersInit = {
      'Authorization': `hmac ${token}`,
      'Market': this.market,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    console.log('[Lalamove] Request:', {
      method,
      url,
      market: this.market,
      timestamp,
      hasBody: !!body,
    });

    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Lalamove] Error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });
      throw new Error(
        responseData.message || 
        `Lalamove API error: ${response.status} ${response.statusText}`
      );
    }

    console.log('[Lalamove] Success:', {
      status: response.status,
      data: responseData.data,
    });

    return responseData;
  }

  /**
   * PHASE 1: Get delivery price quotation
   * Use this to show delivery price before order confirmation
   */
  async getQuotation(
    request: LalamoveQuotationRequest
  ): Promise<LalamoveQuotationResponse> {
    const response = await this.request<LalamoveQuotationResponse>(
      'POST',
      '/v3/quotations',
      { data: request }
    );
    return response.data;
  }

  /**
   * PHASE 1: Get quotation details by ID
   */
  async getQuotationDetails(
    quotationId: string
  ): Promise<LalamoveQuotationResponse> {
    const response = await this.request<LalamoveQuotationResponse>(
      'GET',
      `/v3/quotations/${quotationId}`
    );
    return response.data;
  }

  /**
   * PHASE 2: Place delivery order
   * Call this after customer confirms order
   */
  async placeOrder(
    request: LalamoveOrderRequest
  ): Promise<LalamoveOrderResponse> {
    const response = await this.request<LalamoveOrderResponse>(
      'POST',
      '/v3/orders',
      { data: request }
    );
    return response.data;
  }

  /**
   * PHASE 3: Get order details and tracking status
   */
  async getOrderDetails(orderId: string): Promise<LalamoveOrderResponse> {
    const response = await this.request<LalamoveOrderResponse>(
      'GET',
      `/v3/orders/${orderId}`
    );
    return response.data;
  }

  /**
   * PHASE 4: Get assigned driver details
   * Available 1 hour before scheduled time or when driver arrives at pickup
   */
  async getDriverDetails(
    orderId: string,
    driverId: string
  ): Promise<LalamoveDriverDetails> {
    const response = await this.request<LalamoveDriverDetails>(
      'GET',
      `/v3/orders/${orderId}/drivers/${driverId}`
    );
    return response.data;
  }

  /**
   * PHASE 5: Cancel order
   * Can only cancel when status is ASSIGNING_DRIVER or within 5 minutes of driver matching
   */
  async cancelOrder(orderId: string): Promise<void> {
    await this.request<void>('DELETE', `/v3/orders/${orderId}`);
  }

  /**
   * PHASE 7: Add priority fee (express delivery)
   * Must be called before driver accepts the order
   */
  async addPriorityFee(orderId: string, priorityFee: string): Promise<LalamoveOrderResponse> {
    const response = await this.request<LalamoveOrderResponse>(
      'POST',
      `/v3/orders/${orderId}/priority-fee`,
      { data: { priorityFee } }
    );
    return response.data;
  }

  /**
   * Get available cities and services
   */
  async getCities(): Promise<any> {
    const response = await this.request<any>('GET', '/v3/cities');
    return response.data;
  }

  /**
   * Check if coordinates are within service area
   */
  async validateServiceArea(lat: string, lng: string): Promise<boolean> {
    try {
      const cities = await this.getCities();
      // Simple validation - for production, implement proper geofencing
      return cities && cities.length > 0;
    } catch (error) {
      console.error('[Lalamove] Service area validation failed:', error);
      return false;
    }
  }
}

// Singleton instance
let lalamoveClient: LalamoveClient | null = null;

/**
 * Get LalamoveClient instance
 * Use this in API routes
 */
export function getLalamoveClient(): LalamoveClient {
  if (!lalamoveClient) {
    lalamoveClient = new LalamoveClient();
  }
  return lalamoveClient;
}
