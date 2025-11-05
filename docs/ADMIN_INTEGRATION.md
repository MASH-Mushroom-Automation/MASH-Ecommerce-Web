# Admin Dashboard Integration Guide
**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** Ready for Integration

## 🎯 Overview

This document outlines how the MASH E-commerce platform integrates with the admin dashboard (separate repo). The admin dashboard is responsible for platform-wide management, including seller approvals, content moderation, and analytics.

---

## 🔌 Integration Points

### 1. **Authentication & Authorization**

```typescript
// src/types/admin.ts
export interface AdminAuthResponse {
  token: string;
  expiresAt: string;
  permissions: AdminPermission[];
}

export type AdminPermission = 
  | 'manage_sellers'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_users'
  | 'view_analytics';

export interface AdminApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### 2. **API Endpoints for Admin**

All admin endpoints are prefixed with `/api/admin/` and require:
- Bearer token authentication
- Admin role verification
- Rate limiting: 100 requests/minute
- CORS: Only from admin dashboard origin

#### 2.1 Seller Management
```typescript
// Get pending seller applications
GET /api/admin/seller-applications
Query: {
  status: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'name';
  order?: 'asc' | 'desc';
}
Response: {
  data: Array<{
    id: string;
    userId: string;
    businessName: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    documents: string[];
    contactInfo: {
      email: string;
      phone: string;
    };
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// Get single application details
GET /api/admin/seller-applications/:id
Response: {
  data: {
    // Full application details
    id: string;
    userId: string;
    businessName: string;
    businessAddress: string;
    businessType: string;
    registrationNumber?: string;
    documents: Array<{
      type: string;
      url: string;
      uploadedAt: string;
    }>;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    contactPerson: {
      name: string;
      email: string;
      phone: string;
      position: string;
    };
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  };
}

// Approve seller application
PUT /api/admin/seller-applications/:id/approve
Body: {
  reviewNotes?: string;
  approvedCategories?: string[];
  restrictions?: {
    maxProducts?: number;
    maxOrders?: number;
  };
}
Response: {
  success: true;
  message: string;
  data: {
    applicationId: string;
    userId: string;
    status: 'approved';
    approvedAt: string;
  };
}

// Reject seller application
PUT /api/admin/seller-applications/:id/reject
Body: {
  reviewNotes: string; // Required
  rejectionReason: string;
  canReapply: boolean;
  reapplyAfterDays?: number;
}
Response: {
  success: true;
  message: string;
  data: {
    applicationId: string;
    userId: string;
    status: 'rejected';
    rejectedAt: string;
  };
}
```

#### 2.2 Product Management
```typescript
// Get all products (across all sellers)
GET /api/admin/products
Query: {
  status?: 'active' | 'inactive' | 'pending_review';
  sellerId?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// Update product status
PUT /api/admin/products/:id/status
Body: {
  status: 'active' | 'inactive' | 'pending_review';
  reviewNotes?: string;
}

// Delete product
DELETE /api/admin/products/:id
```

#### 2.3 Order Management
```typescript
// Get all orders
GET /api/admin/orders
Query: {
  status?: OrderStatus;
  sellerId?: string;
  buyerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Get order details
GET /api/admin/orders/:id

// Update order status
PUT /api/admin/orders/:id/status
Body: {
  status: OrderStatus;
  notes?: string;
}

// Handle order disputes
POST /api/admin/orders/:id/disputes
Body: {
  resolution: 'refund' | 'cancel' | 'other';
  notes: string;
  refundAmount?: number;
}
```

#### 2.4 Analytics & Reports
```typescript
// Get platform analytics
GET /api/admin/analytics/overview
Response: {
  data: {
    totalSales: number;
    totalOrders: number;
    activeUsers: number;
    activeSellers: number;
    pendingApplications: number;
    recentDisputes: number;
  };
}

// Get detailed reports
GET /api/admin/reports/:type
Query: {
  startDate: string;
  endDate: string;
  format?: 'json' | 'csv' | 'pdf';
}
```

---

## 🔒 Security Requirements

### 1. **Authentication**
```typescript
// Required headers for all admin API calls
{
  'Authorization': 'Bearer ${adminToken}',
  'X-Admin-Key': '${ADMIN_API_KEY}',
  'X-Request-ID': '${uuid}',
}
```

### 2. **CORS Configuration**
```typescript
// src/config/cors.ts
export const adminCorsConfig = {
  origin: process.env.ADMIN_DASHBOARD_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Authorization',
    'X-Admin-Key',
    'X-Request-ID',
    'Content-Type'
  ],
  maxAge: 86400 // 24 hours
};
```

### 3. **Rate Limiting**
```typescript
// src/middleware/rateLimiter.ts
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from admin dashboard'
});
```

---

## 📡 WebSocket Events

Admin dashboard receives real-time updates via WebSocket:

```typescript
// src/types/websocket.ts
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
```

Example WebSocket setup:
```typescript
// Admin dashboard connection
const ws = new WebSocket(
  `${WEBSOCKET_URL}?token=${adminToken}&type=admin`
);

// Handle events
ws.onmessage = (event) => {
  const { event, data, severity } = JSON.parse(event.data);
  switch (event) {
    case 'seller_application_submitted':
      notifyNewApplication(data);
      break;
    case 'order_disputed':
      notifyDispute(data);
      break;
    // ... handle other events
  }
};
```

---

## 🎨 Response Standards

All admin API responses follow this format:

```typescript
interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
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
```

Error Codes:
- `ADMIN001`: Authentication failed
- `ADMIN002`: Invalid permissions
- `ADMIN003`: Rate limit exceeded
- `ADMIN004`: Invalid request data
- `ADMIN005`: Resource not found
- `ADMIN006`: Action not allowed

---

## 📊 Data Models

### Seller Application
```typescript
interface SellerApplication {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
  registrationNumber?: string;
  documents: Document[];
  bankDetails: BankDetails;
  contactPerson: ContactPerson;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface Document {
  type: string;
  url: string;
  uploadedAt: string;
  verifiedAt?: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  verified: boolean;
}

interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  position: string;
}
```

### Admin Activity Log
```typescript
interface AdminActivity {
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
```

---

## 🧪 Testing

### Integration Test Endpoints
```typescript
// Test admin authentication
POST /api/admin/test/auth
Response: { success: true, token: string }

// Test WebSocket connection
GET /api/admin/test/websocket
Response: { success: true, url: string }

// Test all permissions
GET /api/admin/test/permissions
Response: { success: true, permissions: string[] }
```

### Test Data
```typescript
// src/mock/admin.ts
export const MOCK_ADMIN_DATA = {
  // Mock data for testing
};
```

---

## 📝 Implementation Checklist

### Backend Team
- [ ] Implement all admin API endpoints
- [ ] Set up WebSocket server for admin events
- [ ] Add admin authentication middleware
- [ ] Configure CORS for admin dashboard
- [ ] Set up rate limiting
- [ ] Create admin activity logging
- [ ] Add test endpoints

### Frontend (Admin Dashboard) Team
- [ ] Implement admin authentication flow
- [ ] Set up WebSocket client
- [ ] Create seller application review UI
- [ ] Build order management interface
- [ ] Add product moderation tools
- [ ] Create analytics dashboard
- [ ] Implement activity logging view

### DevOps Team
- [ ] Set up admin API gateway
- [ ] Configure admin-specific rate limits
- [ ] Set up monitoring for admin actions
- [ ] Configure separate logging for admin activities
- [ ] Set up backup system for admin data

---

## 🚀 Deployment

### Environment Variables
```bash
# Admin Integration
ADMIN_DASHBOARD_URL=https://admin.mash-market.com
ADMIN_API_KEY=your_secure_key_here
ADMIN_JWT_SECRET=your_jwt_secret_here
ADMIN_RATE_LIMIT=100
ADMIN_WEBSOCKET_URL=wss://admin-ws.mash-market.com

# Monitoring
ADMIN_SENTRY_DSN=your_sentry_dsn
ADMIN_DATADOG_API_KEY=your_datadog_key
```

### Health Check Endpoint
```typescript
GET /api/admin/health
Response: {
  status: 'ok' | 'degraded' | 'down';
  services: {
    database: 'ok' | 'error';
    cache: 'ok' | 'error';
    websocket: 'ok' | 'error';
  };
  version: string;
  timestamp: string;
}
```

---

## 📚 Related Documents

- `API_Endpoints_Structure.md` - Main API documentation
- `SELLER_APPLICATION_FLOW.md` - Seller onboarding process
- `BACKEND_INTEGRATION_AUDIT_REPORT.md` - Platform readiness report

---

## 🆘 Support

For integration issues:
1. Check the health endpoint
2. Verify admin token and permissions
3. Check CORS configuration
4. Review WebSocket connection
5. Contact backend team lead

---

*End of Documentation*
