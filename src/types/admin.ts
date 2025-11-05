// Admin API Types for MASH E-commerce Platform
// These types are shared between the main platform and admin dashboard

export type AdminPermission = 
  | 'manage_sellers'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_users'
  | 'view_analytics';

export interface AdminAuthResponse {
  token: string;
  expiresAt: string;
  permissions: AdminPermission[];
}

export interface AdminApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AdminApiError;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
  };
}

// Seller Application Types
export interface SellerApplication {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
  registrationNumber?: string;
  documents: SellerDocument[];
  bankDetails: SellerBankDetails;
  contactPerson: SellerContactPerson;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface SellerDocument {
  type: string;
  url: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface SellerBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  verified: boolean;
}

export interface SellerContactPerson {
  name: string;
  email: string;
  phone: string;
  position: string;
}

// Admin Activity Types
export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  targetType: 'seller' | 'product' | 'order' | 'user';
  targetId: string;
  changes: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// WebSocket Event Types
export type AdminWebSocketEvent =
  | 'seller_application_submitted'
  | 'order_disputed'
  | 'product_reported'
  | 'high_risk_transaction'
  | 'system_alert';

export interface AdminWebSocketPayload {
  event: AdminWebSocketEvent;
  data: any;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

// Analytics Types
export interface PlatformAnalytics {
  totalSales: number;
  totalOrders: number;
  activeUsers: number;
  activeSellers: number;
  pendingApplications: number;
  recentDisputes: number;
  periodStart: string;
  periodEnd: string;
}

// Health Check Types
export interface AdminHealthCheck {
  status: 'ok' | 'degraded' | 'down';
  services: {
    database: 'ok' | 'error';
    cache: 'ok' | 'error';
    websocket: 'ok' | 'error';
  };
  version: string;
  timestamp: string;
}
