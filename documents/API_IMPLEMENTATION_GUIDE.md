# MASH API Implementation Guide

## Overview
This guide documents the complete API implementation for the MASH Mushroom Marketplace and IoT automation platform.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://mash.market/api`

## Authentication

All authenticated requests require an auth token in cookies:
- Cookie name: `authToken` or `auth-token`
- Token type: JWT (JSON Web Token)

### Login Flow
```typescript
// 1. User logs in
POST /api/v1/auth/login
Body: { email, password }
Response: { accessToken, refreshToken, user }

// 2. Store tokens in cookies/localStorage
// 3. Include token in subsequent requests
```

## API Endpoints

### 1. Authentication & User Management

#### Get Current User
```http
GET /api/auth/me
Authorization: Cookie (authToken)

Response 200:
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "email": "user@mash.market",
    "firstName": "John",
    "lastName": "Grower",
    "role": "customer",
    "isSeller": false,
    "avatar": "/avatars/default.png",
    "preferences": {
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      }
    }
  },
  "timestamp": "2025-11-05T20:00:00Z",
  "requestId": "req_123456"
}
```

#### Update User Profile
```http
PUT /api/auth/me
Authorization: Cookie (authToken)
Body: {
  "firstName": "Jane",
  "lastName": "Farmer",
  "phone": "+63 956 955 2608",
  "bio": "Passionate mushroom grower"
}

Response 200:
{
  "success": true,
  "data": { ...updatedUser },
  "message": "Profile updated successfully"
}
```

#### Session Management
```http
GET /api/auth/session
Authorization: Cookie (authToken)

Response 200:
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "user": { ...userData },
    "expiresAt": "2025-11-06T20:00:00Z",
    "device": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "platform": "web"
    }
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Cookie (authToken)

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2. Products

#### Get All Products
```http
GET /api/products?page=1&limit=12&category=Fresh%20Mushroom&sortBy=price&sortOrder=asc

Query Parameters:
- page: number (default: 1)
- limit: number (default: 12)
- category: string (optional)
- grower: string (optional)
- minPrice: number (optional)
- maxPrice: number (optional)
- search: string (optional)
- sortBy: "name" | "price" | "createdAt" (optional)
- sortOrder: "asc" | "desc" (optional)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Fresh White Oyster Mushrooms",
      "description": "Delicate, nutty flavor...",
      "price": 120,
      "weight": "250g",
      "images": ["/white.jpg"],
      "category": "Fresh Mushroom",
      "grower": "FungiFreshFarms",
      "inStock": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Create Product (Sellers Only)
```http
POST /api/products
Authorization: Cookie (authToken)
Body: {
  "name": "Blue Oyster Mushrooms",
  "description": "Rich umami flavor",
  "price": 150,
  "weight": "200g",
  "category": "Fresh Mushroom",
  "images": ["/blue.jpg"],
  "inStock": true
}

Response 201:
{
  "success": true,
  "data": { ...newProduct },
  "message": "Product created successfully"
}

Error 400:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": { "fields": ["name", "price"] }
  }
}
```

### 3. Orders

#### Get User Orders
```http
GET /api/orders?page=1&status=processing

Query Parameters:
- page: number
- limit: number
- status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
- sortBy: string
- sortOrder: "asc" | "desc"

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "ord_001",
      "orderNumber": "#12345",
      "status": "processing",
      "items": [...],
      "subtotal": 240,
      "shipping": 50,
      "total": 290,
      "paymentMethod": "GCash",
      "trackingNumber": null,
      "createdAt": "2025-11-04T12:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Create Order
```http
POST /api/orders
Authorization: Cookie (authToken)
Body: {
  "items": [
    {
      "productId": "1",
      "name": "White Oyster Mushrooms",
      "quantity": 2,
      "price": 120
    }
  ],
  "shippingAddress": {
    "name": "John Grower",
    "street": "UCC Congressional Campus",
    "city": "Quezon City",
    "province": "Metro Manila",
    "postalCode": "1100",
    "phone": "+63 956 955 2608"
  },
  "paymentMethod": "GCash"
}

Response 201:
{
  "success": true,
  "data": { ...newOrder },
  "message": "Order created successfully"
}
```

### 4. Notifications

#### Get Notifications
```http
GET /api/notifications?page=1&unread=true

Query Parameters:
- page: number
- limit: number
- unread: boolean
- type: "order" | "alert" | "system" | "device"

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "notif_1",
      "type": "order",
      "title": "Order Shipped",
      "message": "Your order #12345 has been shipped",
      "read": false,
      "createdAt": "2025-11-05T18:00:00Z",
      "actionUrl": "/orders/12345"
    }
  ],
  "pagination": { ... }
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count

Response 200:
{
  "success": true,
  "data": {
    "count": 3,
    "hasUnread": true
  }
}
```

#### Update Notification Preferences
```http
POST /api/notifications
Body: {
  "email": true,
  "push": true,
  "sms": false,
  "types": {
    "orders": true,
    "alerts": true,
    "marketing": false
  }
}

Response 200:
{
  "success": true,
  "data": { ...preferences },
  "message": "Notification preferences updated"
}
```

### 5. IoT Devices

#### Get User Devices
```http
GET /api/devices?status=online

Query Parameters:
- page: number
- limit: number
- status: "online" | "offline"
- type: "mushroom_kit"

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "dev_001",
      "name": "Growing Kit #1",
      "type": "mushroom_kit",
      "status": "online",
      "sensors": {
        "temperature": { "value": 26.5, "unit": "°C", "status": "normal" },
        "humidity": { "value": 85, "unit": "%", "status": "normal" },
        "co2": { "value": 12500, "unit": "ppm", "status": "normal" }
      },
      "actuators": {
        "humidifier": { "status": "on", "power": 75 },
        "fan": { "status": "on", "speed": 50 }
      }
    }
  ]
}
```

#### Register New Device
```http
POST /api/devices
Body: {
  "name": "Growing Kit #3",
  "type": "mushroom_kit",
  "model": "MASH-GK-001",
  "location": "Living Room"
}

Response 201:
{
  "success": true,
  "data": { ...newDevice },
  "message": "Device registered successfully"
}
```

## WebSocket Real-Time Events

### Connection
```typescript
// Connect to WebSocket
const ws = getWebSocketClient();
ws.connect(authToken);

// Listen for events
ws.on("notification:new", (data) => {
  console.log("New notification:", data);
});
```

### Available Events

#### Device Status Updates
```typescript
Event: "device:status"
Data: {
  deviceId: "dev_001",
  status: "online",
  timestamp: "2025-11-05T20:00:00Z"
}
```

#### Real-time Sensor Data
```typescript
Event: "sensor:data"
Data: {
  deviceId: "dev_001",
  temperature: 26.5,
  humidity: 85,
  co2: 12500,
  timestamp: "2025-11-05T20:00:00Z"
}
```

#### New Notifications
```typescript
Event: "notification:new"
Data: {
  id: "notif_1",
  type: "order",
  title: "Order Shipped",
  message: "Your order is on its way!"
}
```

#### Order Status Changes
```typescript
Event: "order:status"
Data: {
  orderId: "ord_001",
  status: "shipped",
  trackingNumber: "TRK123456"
}
```

#### New Alerts
```typescript
Event: "alert:new"
Data: {
  id: "alert_001",
  type: "warning",
  message: "Temperature above optimal range",
  deviceId: "dev_001"
}
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | No valid authentication token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource already exists | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## Rate Limiting

- **Public endpoints**: 60 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Premium users**: 5000 requests/hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1699200000
```

## Mobile App Integration

### React Native / Flutter

```typescript
// Example API client
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://mash.market/api',
  timeout: 10000,
  withCredentials: true
});

// Add auth token
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);
```

## Best Practices

### 1. Always Handle Errors
```typescript
try {
  const response = await fetch('/api/products');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error.message);
  }
  
  return data.data;
} catch (error) {
  console.error('Failed to fetch products:', error);
  // Show error to user
}
```

### 2. Use Pagination
```typescript
// Don't fetch all at once
const fetchProducts = async (page = 1) => {
  const response = await fetch(`/api/products?page=${page}&limit=12`);
  return response.json();
};
```

### 3. Implement Caching
```typescript
// Cache responses to reduce API calls
const cache = new Map();

const fetchWithCache = async (url, ttl = 60000) => {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};
```

### 4. Use WebSocket for Real-time Data
```typescript
// Don't poll for sensor data
// ❌ Bad: Polling every second
setInterval(() => {
  fetch('/api/devices/dev_001/sensors');
}, 1000);

// ✅ Good: Use WebSocket
ws.on('sensor:data', (data) => {
  updateSensorDisplay(data);
});
```

## Testing

### cURL Examples

```bash
# Get products
curl http://localhost:3000/api/products

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=YOUR_TOKEN" \
  -d '{
    "items": [{"productId": "1", "quantity": 2}],
    "shippingAddress": {...}
  }'

# Get notifications
curl http://localhost:3000/api/notifications \
  -H "Cookie: authToken=YOUR_TOKEN"
```

## Support

For API support:
- Email: dev@mash.market
- Documentation: https://docs.mash.market
- Status Page: https://status.mash.market
