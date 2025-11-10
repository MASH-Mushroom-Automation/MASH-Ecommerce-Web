# MASH E-Commerce Platform - Complete JSON Data Structure Guide

## 📋 Overview

This comprehensive guide provides **complete JSON structure references for ALL 47 database tables** in the MASH platform. This document is based on the complete Prisma schema (`MASH-Backend/prisma/schema.prisma`) and includes both implemented and planned features.

> **🔗 Schema Reference**: `MASH-Backend/prisma/schema.prisma` (1,421 lines, 47 models)  
> **📦 Main Products File**: `data/products-database.json` (9 products ready to use)  
> **📁 Schema Templates**: `data/tables/` (45 example files organized by category)  
> **⚠️ Backend Compatibility**: All enum values MUST be UPPERCASE (e.g., `"PENDING"`, not `"Pending"`)

---

## 🎯 Quick Access - Main Products Database

### 📊 **`data/products-database.json`** - PRIMARY PRODUCTS FILE

This is the **main products database** used throughout the website. Contains all 9 products with complete information matching `src/lib/api/products.ts` structure.

**✅ Ready to Use - Import Directly:**
```typescript
import productsData from '@/data/products-database.json';

// All 9 products ready to use
const products = productsData;

// Filter featured products
const featured = productsData.filter(p => p.isFeatured);

// Get product by ID
const product = productsData.find(p => p.id === "1");

// Search by name/description
const searchResults = productsData.filter(p => 
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.description.toLowerCase().includes(searchTerm.toLowerCase())
);

// Filter by category
const freshMushrooms = productsData.filter(p => 
  p.categories.includes("Fresh Mushroom")
);

// Filter by grower
const fungiFreshProducts = productsData.filter(p => 
  p.grower === "FungiFreshFarms"
);
```

**📦 Complete Product Structure (24 fields):**
```json
{
  "id": "1",
  "name": "Fresh White Oyster Mushrooms",
  "slug": "fresh-white-oyster-mushrooms",
  "sku": "FWO-250G",
  "description": "Delicate, nutty flavor perfect for stir-fries and soups. Harvested daily for maximum freshness.",
  "price": 120,
  "comparePrice": 150,
  "costPrice": 80,
  "stock": 45,
  "minStock": 10,
  "weight": "250g",
  "images": ["/white.jpg", "/white-2.jpg", "/white-3.jpg", "/white-4.jpg"],
  "image": "/white.jpg",
  "category": "Fresh Mushroom",
  "categories": ["Fresh Mushroom", "Oyster Mushrooms"],
  "tag": "New",
  "tags": ["New", "Fresh", "Popular"],
  "grower": "FungiFreshFarms",
  "growerId": "grower_001",
  "inStock": true,
  "isActive": true,
  "isFeatured": true,
  "isDeleted": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**🛒 All 9 Products in Database:**
1. **Fresh White Oyster Mushrooms** (ID: 1) - ₱120 - Featured, New, Fresh
2. **Mushroom Chips** (ID: 2) - ₱140 - Snacks
3. **Blue Oyster Mushrooms** (ID: 3) - ₱150 - Featured, Premium, Gourmet
4. **White Oyster Mushroom Growing Kit** (ID: 4) - ₱350 - Featured, Popular, Best Seller
5. **Crispy Mushroom Chicharon** (ID: 9) - ₱150 - Snacks, Crispy
6. **Bagoong Mushroom** (ID: 10) - ₱380 - Featured, New, Vegan, Filipino
7. **Blue Oyster Mushroom Growing Kit** (ID: 11) - ₱370 - Featured, Popular
8. **Premium Golden Oyster Growing Kit** (ID: 12) - ₱450 - Premium, Gourmet
9. **King Oyster Mushroom Growing Kit** (ID: 13) - ₱420 - Gourmet, Beginner Friendly

**🔍 Product Field Reference:**

**Required Fields:**
- `id`, `name`, `slug`, `sku`, `price`, `stock`, `minStock`, `images`, `image`, `category`, `categories`, `tags`, `grower`, `growerId`, `inStock`, `isActive`, `isFeatured`, `isDeleted`, `createdAt`, `updatedAt`

**Optional Fields:**
- `description`, `comparePrice`, `costPrice`, `weight`, `tag`

**📂 Categories Available:**
- Fresh Mushroom, Oyster Mushrooms, Premium, Growing Kits, Beginner Friendly, Mushroom Products, Snacks, Preserved Foods, Filipino Products, Gourmet

**🏷️ Tags Available:**
- New, Fresh, Popular, Chips, Snack, Best Seller, Gourmet, Vegan, Filipino, Premium, Crispy, Beginner Friendly

**🌱 Growers in System:**
- **FungiFreshFarms** (grower_001) - 5 products
- **TheMushroomPatchBukidnon** (grower_002) - 2 products
- **KingFarms** (grower_003) - 2 products

---

## 📁 Complete Database Schema - All 47 Tables

### 1️⃣ Core E-Commerce Tables (7 tables)

#### **Product** (`data/tables/core-ecommerce/product.json` + `data/products-database.json`)
Main products database with pricing, inventory, categories, and images.
```json
{
  "id": "prod_001",
  "name": "Fresh Oyster Mushrooms",
  "description": "Locally grown fresh oyster mushrooms",
  "slug": "fresh-oyster-mushrooms",
  "sku": "MUSH-OYS-FRESH-250G",
  "price": 120.00,
  "comparePrice": 150.00,
  "costPrice": 80.00,
  "stock": 50,
  "minStock": 10,
  "weight": 0.25,
  "dimensions": {"length": 15, "width": 10, "height": 5, "unit": "cm"},
  "images": ["url1", "url2", "url3"],
  "categories": ["cat_fresh", "cat_edible"],
  "tags": ["fresh", "organic", "local"],
  "attributes": {"origin": "Baguio", "shelfLife": "5-7 days"},
  "isActive": true,
  "isFeatured": true,
  "isDeleted": false,
  "deletedAt": null,
  "seoTitle": "Fresh Oyster Mushrooms - Locally Grown",
  "seoDescription": "Buy fresh oyster mushrooms from local growers",
  "createdAt": "2025-08-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T09:15:00.000Z"
}
```

#### **Category** (`data/tables/core-ecommerce/category.json`)
Product categories with hierarchical structure.
```json
{
  "id": "cat_001",
  "name": "Fresh Mushrooms",
  "description": "Fresh, locally grown mushrooms",
  "slug": "fresh-mushrooms",
  "parentId": null,
  "imageUrl": "https://images.unsplash.com/category-image.jpg",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2025-06-01T08:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **User** (`data/tables/core-ecommerce/user.json`)
User accounts with authentication and roles.
```json
{
  "id": "user_001",
  "clerkId": "clerk_xyz123",
  "email": "buyer@example.com",
  "username": "mushroom_lover",
  "password": null,
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "imageUrl": "https://avatar.url/image.jpg",
  "phoneNumber": "+639171234567",
  "role": "BUYER",
  "isActive": true,
  "preferences": {"theme": "light", "language": "en", "notifications": true},
  "emailVerified": true,
  "emailVerificationToken": null,
  "emailVerificationExpiry": null,
  "twoFactorSecret": null,
  "twoFactorEnabled": false,
  "twoFactorBackupCodes": [],
  "lastLoginAt": "2025-11-10T08:30:00.000Z",
  "createdAt": "2025-08-20T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:30:00.000Z"
}
```
**Enum - UserRole**: `USER` | `ADMIN` | `SUPER_ADMIN` | `GROWER` | `BUYER`

#### **Order** (`data/tables/core-ecommerce/order.json`)
Order management with status tracking.
```json
{
  "id": "order_001",
  "orderNumber": "ORD-2025-001",
  "userId": "user_001",
  "status": "DELIVERED",
  "subtotal": 500.00,
  "tax": 60.00,
  "shipping": 100.00,
  "discount": 50.00,
  "total": 610.00,
  "currency": "PHP",
  "notes": "Please deliver in the morning",
  "shippingAddress": {
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "street1": "123 Main St",
    "barangay": "Poblacion",
    "city": "Manila",
    "state": "Metro Manila",
    "postalCode": "1000",
    "country": "Philippines",
    "phone": "+639171234567"
  },
  "billingAddress": {"same": "as_shipping"},
  "trackingNumber": "TRK123456789",
  "shippedAt": "2025-11-02T10:00:00.000Z",
  "deliveredAt": "2025-11-05T14:30:00.000Z",
  "cancelledAt": null,
  "createdAt": "2025-11-01T09:00:00.000Z",
  "updatedAt": "2025-11-05T14:30:00.000Z"
}
```
**Enum - OrderStatus**: `PENDING` | `CONFIRMED` | `PROCESSING` | `SHIPPED` | `DELIVERED` | `CANCELLED` | `REFUNDED`

#### **OrderItem** (`data/tables/core-ecommerce/order-item.json`)
Line items within orders.
```json
{
  "id": "item_001",
  "orderId": "order_001",
  "productId": "prod_001",
  "quantity": 2,
  "price": 120.00,
  "total": 240.00
}
```

#### **Address** (`data/tables/core-ecommerce/address.json`)
Shipping and billing addresses with Philippines format.
```json
{
  "id": "addr_001",
  "userId": "user_001",
  "type": "shipping",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "company": null,
  "street1": "123 Main Street",
  "street2": "Unit 4B",
  "city": "Manila",
  "state": "Metro Manila",
  "postalCode": "1000",
  "country": "Philippines",
  "phoneNumber": "+639171234567",
  "isDefault": true,
  "createdAt": "2025-08-20T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **Payment** (`data/tables/core-ecommerce/payment.json`)
Payment transactions and gateway integration.
```json
{
  "id": "pay_001",
  "orderId": "order_001",
  "userId": "user_001",
  "amount": 610.00,
  "currency": "PHP",
  "status": "PAID",
  "method": "GCASH",
  "transactionId": "GCASH123456789",
  "gatewayResponse": {"reference": "REF123", "status": "success"},
  "processedAt": "2025-11-01T09:05:00.000Z",
  "failedAt": null,
  "refundedAt": null,
  "createdAt": "2025-11-01T09:00:00.000Z",
  "updatedAt": "2025-11-01T09:05:00.000Z"
}
```
**Enum - PaymentStatus**: `PENDING` | `PAID` | `FAILED` | `REFUNDED`
**Enum - PaymentMethod**: `CREDIT_CARD` | `DEBIT_CARD` | `PAYPAL` | `GCASH` | `MAYA` | `BANK_TRANSFER`

---

### 2️⃣ IoT Devices & Sensors Tables (8 tables)

#### **Device** (`data/tables/iot-devices/device.json`)
IoT devices for mushroom growing automation.
```json
{
  "id": "dev_001",
  "name": "Growing Chamber #1",
  "type": "MUSHROOM_CHAMBER",
  "serialNumber": "MC-2025-001",
  "status": "ONLINE",
  "userId": "user_001",
  "location": "Farm Building A",
  "description": "Main oyster mushroom growing chamber",
  "firmware": "v2.1.3",
  "ipAddress": "192.168.1.100",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "lastSeen": "2025-11-10T09:00:00.000Z",
  "isActive": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:00.000Z"
}
```
**Enum - DeviceType**: `MUSHROOM_CHAMBER` | `ENVIRONMENTAL_SENSOR` | `IRRIGATION_SYSTEM` | `HVAC_CONTROLLER` | `CAMERA` | `pH_SENSOR` | `HUMIDITY_CONTROLLER`
**Enum - DeviceStatus**: `ONLINE` | `OFFLINE` | `MAINTENANCE` | `ERROR`

#### **Sensor** (`data/tables/iot-devices/sensor.json`)
Individual sensors attached to devices.
```json
{
  "id": "sensor_001",
  "deviceId": "dev_001",
  "type": "temperature",
  "name": "Temperature Sensor A",
  "unit": "°C",
  "minValue": 10.0,
  "maxValue": 30.0,
  "calibration": {"offset": 0.5, "multiplier": 1.0},
  "isActive": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **SensorData** (`data/tables/iot-devices/sensor-data.json`)
Time-series sensor readings.
```json
{
  "id": "data_001",
  "deviceId": "dev_001",
  "sensorId": "sensor_001",
  "userId": "user_001",
  "type": "temperature",
  "value": 22.5,
  "unit": "°C",
  "quality": "good",
  "timestamp": "2025-11-10T09:00:00.000Z"
}
```

#### **DeviceCommand** (`data/tables/iot-devices/device-command.json`)
Remote commands sent to devices.
```json
{
  "id": "cmd_001",
  "deviceId": "dev_001",
  "command": "SET_TEMPERATURE",
  "parameters": {"temperature": 22, "duration": 3600},
  "status": "completed",
  "response": {"success": true, "message": "Temperature set to 22°C"},
  "sentAt": "2025-11-10T09:00:00.000Z",
  "acknowledgedAt": "2025-11-10T09:00:05.000Z"
}
```

#### **SensorAlert** (`data/tables/iot-devices/sensor-alert.json`)
Sensor threshold alerts.
```json
{
  "id": "alert_001",
  "deviceId": "dev_001",
  "sensorId": "sensor_001",
  "type": "TEMPERATURE_HIGH",
  "severity": "WARNING",
  "title": "High Temperature Detected",
  "message": "Temperature reached 28°C, exceeding threshold of 25°C",
  "threshold": {"min": 18, "max": 25, "current": 28},
  "isActive": true,
  "isResolved": false,
  "resolvedAt": null,
  "createdAt": "2025-11-10T09:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:00.000Z"
}
```

#### **DeviceHealth** - NEW (from Prisma schema)
Device health monitoring with performance metrics.
```json
{
  "id": "health_001",
  "deviceId": "dev_001",
  "timestamp": "2025-11-10T09:00:00.000Z",
  "status": "HEALTHY",
  "cpuUsage": 45.2,
  "memoryUsage": 62.8,
  "diskUsage": 38.5,
  "temperature": 42.0,
  "batteryLevel": null,
  "networkLatency": 25,
  "uptime": 864000,
  "errorCount": 0,
  "metadata": {"lastReboot": "2025-11-01T00:00:00.000Z"},
  "createdAt": "2025-11-10T09:00:00.000Z"
}
```
**Enum - DeviceHealthStatus**: `HEALTHY` | `WARNING` | `CRITICAL` | `OFFLINE` | `MAINTENANCE`

---

### 3️⃣ Alert & Notification System Tables (8 tables)

#### **AlertRule** (`data/tables/alerts-notifications/alert-rule.json`)
Configurable alert rules for monitoring.
```json
{
  "id": "rule_001",
  "name": "High Temperature Alert",
  "description": "Trigger when temperature exceeds 25°C",
  "category": "SENSOR",
  "priority": "HIGH",
  "eventType": "sensor.temperature",
  "condition": {"operator": "GT", "threshold": 25, "field": "value"},
  "activeHours": {"start": "00:00", "end": "23:59", "days": [1,2,3,4,5,6,7]},
  "cooldownMinutes": 15,
  "isActive": true,
  "isDeleted": false,
  "createdBy": "user_001",
  "updatedBy": "user_001",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```
**Enum - AlertCategory**: `SYSTEM` | `SECURITY` | `BUSINESS` | `USER` | `SENSOR` | `ORDER` | `PAYMENT`
**Enum - AlertPriority**: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`

#### **AlertRuleRecipient** (`data/tables/alerts-notifications/alert-rule-recipient.json`)
Who receives alerts from rules.
```json
{
  "id": "recipient_001",
  "ruleId": "rule_001",
  "recipientType": "USER",
  "recipientId": "user_001",
  "role": null,
  "email": null,
  "phone": null,
  "enableEmail": true,
  "enableSms": false,
  "enablePush": true,
  "enableInApp": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```
**Enum - RecipientType**: `USER` | `ROLE` | `EMAIL` | `PHONE`

#### **Alert** (`data/tables/alerts-notifications/alert.json`)
Alert instances when rules trigger.
```json
{
  "id": "alert_001",
  "ruleId": "rule_001",
  "title": "High Temperature Alert",
  "message": "Temperature exceeded 25°C threshold",
  "category": "SENSOR",
  "priority": "HIGH",
  "severity": 7,
  "status": "SENT",
  "eventType": "sensor.temperature",
  "eventId": "data_001",
  "eventData": {"temperature": 28, "sensor": "sensor_001"},
  "fingerprint": "temp_high_sensor001_20251110",
  "groupKey": "temp_alerts",
  "occurrenceCount": 1,
  "firstOccurrence": "2025-11-10T09:00:00.000Z",
  "lastOccurrence": "2025-11-10T09:00:00.000Z",
  "triggeredAt": "2025-11-10T09:00:00.000Z",
  "acknowledgedAt": null,
  "resolvedAt": null,
  "escalatedAt": null,
  "snoozedUntil": null,
  "metadata": {},
  "tags": ["temperature", "sensor"],
  "createdAt": "2025-11-10T09:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:00.000Z"
}
```
**Enum - AlertStatus**: `PENDING` | `SENT` | `ACKNOWLEDGED` | `RESOLVED` | `ESCALATED` | `SNOOZED` | `CANCELLED`

#### **Notification** (`data/tables/alerts-notifications/notification.json`)
Notification delivery records across channels.
```json
{
  "id": "notif_001",
  "alertId": "alert_001",
  "userId": "user_001",
  "channel": "EMAIL",
  "status": "SENT",
  "recipientEmail": "user@example.com",
  "recipientPhone": null,
  "recipientId": "user_001",
  "subject": "High Temperature Alert",
  "body": "Temperature exceeded threshold at 09:00 AM",
  "templateId": "temp_001",
  "queuedAt": "2025-11-10T09:00:00.000Z",
  "sentAt": "2025-11-10T09:00:05.000Z",
  "deliveredAt": "2025-11-10T09:00:10.000Z",
  "failedAt": null,
  "retryCount": 0,
  "maxRetries": 3,
  "nextRetryAt": null,
  "provider": "SendGrid",
  "providerMessageId": "msg_abc123",
  "providerResponse": {"id": "msg_abc123", "status": "delivered"},
  "errorMessage": null,
  "metadata": {},
  "priority": 5,
  "createdAt": "2025-11-10T09:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:10.000Z"
}
```
**Enum - NotificationChannel**: `EMAIL` | `SMS` | `PUSH` | `IN_APP` | `WEBHOOK`
**Enum - NotificationStatus**: `PENDING` | `QUEUED` | `SENDING` | `SENT` | `DELIVERED` | `FAILED` | `BOUNCED` | `RETRYING` | `CANCELLED`

#### **UserNotification** (`data/tables/alerts-notifications/user-notification.json`)
In-app notifications for users.
```json
{
  "id": "user_notif_001",
  "userId": "user_001",
  "type": "ORDER_UPDATE",
  "title": "Order Shipped",
  "message": "Your order #ORD-2025-001 has been shipped",
  "data": {"orderId": "order_001", "trackingNumber": "TRK123456789"},
  "isRead": false,
  "readAt": null,
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```
**Enum - NotificationType**: `ALERT` | `INFO` | `WARNING` | `SUCCESS` | `DEVICE_STATUS` | `ORDER_UPDATE` | `PAYMENT_UPDATE`

#### **NotificationTemplate** (`data/tables/alerts-notifications/notification-template.json`)
Reusable notification message templates.
```json
{
  "id": "temp_001",
  "name": "high_temperature_alert",
  "description": "Template for high temperature alerts",
  "category": "SENSOR",
  "channel": "EMAIL",
  "subject": "High Temperature Alert - {{deviceName}}",
  "body": "Temperature at {{deviceName}} reached {{temperature}}°C, exceeding threshold of {{threshold}}°C.",
  "variables": {
    "deviceName": "Device name",
    "temperature": "Current temperature",
    "threshold": "Threshold value"
  },
  "isActive": true,
  "createdBy": "user_001",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **AlertAcknowledgment** (`data/tables/alerts-notifications/alert-acknowledgment.json`)
Alert action history tracking.
```json
{
  "id": "ack_001",
  "alertId": "alert_001",
  "userId": "user_001",
  "action": "ACKNOWLEDGED",
  "comment": "Investigating the temperature spike",
  "metadata": {"location": "web_dashboard"},
  "createdAt": "2025-11-10T09:05:00.000Z"
}
```
**Enum - AcknowledgmentAction**: `ACKNOWLEDGED` | `RESOLVED` | `ESCALATED` | `SNOOZED` | `COMMENTED` | `CANCELLED`

#### **AlertEscalationPolicy** (`data/tables/alerts-notifications/alert-escalation-policy.json`)
Auto-escalation rules for unacknowledged alerts.
```json
{
  "id": "policy_001",
  "name": "Critical Alert Escalation",
  "description": "Escalate critical alerts after 30 minutes",
  "priority": ["CRITICAL", "HIGH"],
  "category": ["SENSOR", "SYSTEM"],
  "unacknowledgedMin": 30,
  "steps": [
    {"level": 1, "delay": 15, "recipients": ["user_001"], "channels": ["EMAIL", "SMS"]},
    {"level": 2, "delay": 30, "recipients": ["admin_001"], "channels": ["EMAIL", "SMS", "PUSH"]}
  ],
  "isActive": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

---

### 4️⃣ Security & Authentication Tables (4 tables)

#### **Session** (`data/tables/security-auth/session.json`)
User session management.
```json
{
  "id": "session_001",
  "userId": "user_001",
  "clerkSessionId": "clerk_session_xyz",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "status": "ACTIVE",
  "deviceInfo": {"device": "Desktop", "browser": "Chrome", "os": "Windows 11"},
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "lastActivity": "2025-11-10T09:00:00.000Z",
  "expiresAt": "2025-11-17T09:00:00.000Z",
  "revokedAt": null,
  "revokedReason": null,
  "createdAt": "2025-11-10T08:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:00.000Z"
}
```
**Enum - SessionStatus**: `ACTIVE` | `EXPIRED` | `REVOKED`

#### **ApiKey** (`data/tables/security-auth/api-key.json`)
API keys for programmatic access.
```json
{
  "id": "key_001",
  "userId": "user_001",
  "name": "Production API Key",
  "keyHash": "hashed_key_value",
  "keyPrefix": "mash_prod_",
  "scopes": ["read:products", "write:orders"],
  "lastUsedAt": "2025-11-10T08:30:00.000Z",
  "expiresAt": "2026-11-10T00:00:00.000Z",
  "revokedAt": null,
  "revokedReason": null,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:30:00.000Z"
}
```

#### **SecurityLog** (`data/tables/security-auth/security-log.json`)
Security events and audit trail.
```json
{
  "id": "sec_001",
  "userId": "user_001",
  "event": "LOGIN_FAILED",
  "severity": "WARNING",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "metadata": {"reason": "Invalid password", "attempts": 3},
  "timestamp": "2025-11-10T08:00:00.000Z"
}
```

#### **RateLimitLog** (`data/tables/security-auth/rate-limit-log.json`)
Rate limiting tracking.
```json
{
  "id": "rate_001",
  "identifier": "192.168.1.100",
  "endpoint": "/api/products",
  "count": 45,
  "windowStart": "2025-11-10T09:00:00.000Z",
  "windowEnd": "2025-11-10T09:01:00.000Z",
  "blocked": false,
  "createdAt": "2025-11-10T09:00:00.000Z"
}
```

---

### 5️⃣ RBAC (Role-Based Access Control) Tables (4 tables)

#### **Role** (`data/tables/rbac/role.json`)
User roles definition.
```json
{
  "id": "role_001",
  "name": "ADMIN",
  "description": "Administrator with full access",
  "isSystem": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **Permission** (`data/tables/rbac/permission.json`)
Granular permissions for resources.
```json
{
  "id": "perm_001",
  "resource": "products",
  "action": "read",
  "description": "View products",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **RolePermission** (`data/tables/rbac/role-permission.json`)
Links roles to permissions.
```json
{
  "id": "rp_001",
  "roleId": "role_001",
  "permissionId": "perm_001",
  "createdAt": "2025-06-01T10:00:00.000Z"
}
```

#### **UserRoleAssignment** (`data/tables/rbac/user-role-assignment.json`)
Assigns roles to users.
```json
{
  "id": "ura_001",
  "userId": "user_001",
  "roleId": "role_001",
  "grantedBy": "admin_001",
  "grantedAt": "2025-08-20T10:00:00.000Z"
}
```

---

### 6️⃣ Analytics & Reporting Tables (4 tables)

#### **Report** (`data/tables/analytics/report.json`)
Report definitions and configurations.
```json
{
  "id": "report_001",
  "name": "Daily Sales Report",
  "description": "Daily sales summary with product breakdown",
  "type": "SALES",
  "configuration": {
    "filters": {"dateRange": "last_24h"},
    "groupBy": ["product", "category"],
    "metrics": ["total_sales", "order_count", "avg_order_value"]
  },
  "schedule": {"frequency": "DAILY", "time": "08:00"},
  "isActive": true,
  "createdBy": "admin_001",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```
**Enum - ReportType**: `SALES` | `REVENUE` | `USERS` | `PRODUCTS` | `ORDERS` | `DEVICES` | `CUSTOM`

#### **ReportExecution** (`data/tables/analytics/report-execution.json`)
Report execution history.
```json
{
  "id": "exec_001",
  "reportId": "report_001",
  "status": "COMPLETED",
  "startedAt": "2025-11-10T08:00:00.000Z",
  "completedAt": "2025-11-10T08:00:15.000Z",
  "duration": 15000,
  "resultData": {"total_sales": 50000, "order_count": 125},
  "resultUrl": "https://storage.url/report_001_20251110.pdf",
  "errorMessage": null,
  "executedBy": "admin_001"
}
```
**Enum - ExecutionStatus**: `PENDING` | `RUNNING` | `COMPLETED` | `FAILED` | `CANCELLED`

#### **ReportSubscription** (`data/tables/analytics/report-subscription.json`)
User subscriptions to automated reports.
```json
{
  "id": "sub_001",
  "reportId": "report_001",
  "userId": "admin_001",
  "channel": "EMAIL",
  "frequency": "DAILY",
  "isActive": true,
  "lastSentAt": "2025-11-10T08:00:00.000Z",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```
**Enum - SubscriptionFrequency**: `DAILY` | `WEEKLY` | `MONTHLY` | `REAL_TIME`

#### **SearchLog** (`data/tables/analytics/search-log.json`)
Search analytics for product discovery.
```json
{
  "id": "search_001",
  "query": "oyster mushrooms",
  "index": "products",
  "resultsCount": 8,
  "took": 35,
  "filters": {"category": "Fresh Mushroom", "inStock": true},
  "sort": {"field": "price", "order": "asc"},
  "userId": "user_001",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "clickedResult": "prod_001",
  "isSlowQuery": false,
  "createdAt": "2025-11-10T09:00:00.000Z"
}
```

---

### 7️⃣ Import/Export System Tables (3 tables)

#### **ImportExportJob** (`data/tables/import-export/import-export-job.json`)
Bulk data import/export jobs.
```json
{
  "id": "job_001",
  "type": "IMPORT",
  "entityType": "PRODUCT",
  "status": "COMPLETED",
  "priority": "NORMAL",
  "fileName": "products_2025-11-10.csv",
  "fileFormat": "CSV",
  "fileSize": 524288,
  "fileUrl": "https://storage.url/imports/products_2025-11-10.csv",
  "resultFileUrl": null,
  "totalRecords": 100,
  "processedRecords": 100,
  "successCount": 95,
  "failureCount": 5,
  "warningCount": 10,
  "progressPercent": 100.0,
  "startedAt": "2025-11-10T08:00:00.000Z",
  "completedAt": "2025-11-10T08:05:30.000Z",
  "estimatedTimeMs": 330000,
  "options": {"delimiter": ",", "skipRows": 1, "validateOnly": false},
  "filters": null,
  "createdBy": "admin_001",
  "createdAt": "2025-11-10T07:55:00.000Z",
  "updatedAt": "2025-11-10T08:05:30.000Z"
}
```
**Enum - JobType**: `IMPORT` | `EXPORT`
**Enum - EntityType**: `PRODUCT` | `ORDER` | `USER` | `CATEGORY` | `SELLER` | `BUYER` | `TRANSACTION` | `INVENTORY`
**Enum - JobStatus**: `QUEUED` | `PROCESSING` | `COMPLETED` | `FAILED` | `CANCELLED`
**Enum - JobPriority**: `URGENT` | `NORMAL` | `LOW`
**Enum - FileFormat**: `CSV` | `EXCEL` | `JSON` | `XML`

#### **ImportExportError** (`data/tables/import-export/import-export-error.json`)
Errors during import/export operations.
```json
{
  "id": "error_001",
  "jobId": "job_001",
  "rowNumber": 45,
  "columnName": "price",
  "fieldPath": "price",
  "errorType": "VALIDATION",
  "severity": "ERROR",
  "errorCode": "INVALID_PRICE_FORMAT",
  "message": "Price must be a positive number",
  "suggestion": "Use format: 120.00 or 120",
  "originalValue": "abc",
  "expectedFormat": "Decimal(10,2)",
  "createdAt": "2025-11-10T08:02:15.000Z"
}
```
**Enum - ErrorType**: `VALIDATION` | `CONSTRAINT` | `FORMAT` | `BUSINESS_RULE`
**Enum - ErrorSeverity**: `ERROR` | `WARNING`

#### **ImportExportTemplate** (`data/tables/import-export/import-export-template.json`)
Reusable import/export templates.
```json
{
  "id": "template_001",
  "name": "Product Import Template",
  "description": "Standard template for importing products",
  "entityType": "PRODUCT",
  "fileFormat": "CSV",
  "headers": ["name", "slug", "sku", "price", "stock", "category"],
  "sampleData": [
    ["Fresh Oyster Mushrooms", "fresh-oyster", "MUSH-OYS-001", "120.00", "50", "Fresh Mushroom"]
  ],
  "validation": {
    "name": {"required": true, "minLength": 3, "maxLength": 200},
    "price": {"required": true, "type": "decimal", "min": 0}
  },
  "isActive": true,
  "createdBy": "admin_001",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

---

### 8️⃣ API Gateway & Rate Limiting Tables (6 tables)

#### **ApiGatewayConfig** (`data/tables/api-gateway/api-gateway-config.json`)
API routing and service configuration.
```json
{
  "id": "gateway_001",
  "serviceName": "orders-service",
  "basePath": "/api/v1/orders",
  "targetUrl": "http://orders-service:3001",
  "healthCheckUrl": "http://orders-service:3001/health",
  "timeout": 30000,
  "retryAttempts": 3,
  "circuitBreaker": true,
  "loadBalancing": "ROUND_ROBIN",
  "isActive": true,
  "priority": 10,
  "metadata": {"version": "v1", "maintainer": "backend-team"},
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```
**Enum - LoadBalancingStrategy**: `ROUND_ROBIN` | `LEAST_CONNECTIONS` | `WEIGHTED_ROUND_ROBIN` | `IP_HASH` | `HEALTH_BASED`

#### **RateLimitOverride** (`data/tables/api-gateway/rate-limit-override.json`)
Custom rate limits for specific users/API keys.
```json
{
  "id": "override_001",
  "userId": "user_001",
  "apiKey": null,
  "endpoint": "/api/v1/products",
  "requestLimit": 1000,
  "timeWindowMs": 60000,
  "strategy": "TOKEN_BUCKET",
  "priority": 10,
  "reason": "Premium user account",
  "expiresAt": "2026-11-10T00:00:00.000Z",
  "createdAt": "2025-11-10T08:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```
**Enum - RateLimitStrategy**: `TOKEN_BUCKET` | `LEAKY_BUCKET` | `FIXED_WINDOW` | `SLIDING_WINDOW` | `ADAPTIVE`

#### **ApiUsageLog** (`data/tables/api-gateway/api-usage-log.json`)
Detailed API request analytics.
```json
{
  "id": "usage_001",
  "userId": "user_001",
  "apiKey": null,
  "endpoint": "/api/v1/products",
  "method": "GET",
  "version": "v1",
  "statusCode": 200,
  "responseTime": 45,
  "requestSize": 1024,
  "responseSize": 8192,
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "referer": "https://mash-market.com/shop",
  "rateLimitHit": false,
  "throttled": false,
  "queueTime": 5,
  "metadata": {"cache": "miss"},
  "timestamp": "2025-11-10T09:00:00.000Z"
}
```

#### **RequestQueue** (`data/tables/api-gateway/request-queue.json`)
Queue for throttled requests.
```json
{
  "id": "queue_001",
  "userId": "user_001",
  "endpoint": "/api/v1/orders",
  "method": "POST",
  "priority": 50,
  "payload": {"productId": "prod_001", "quantity": 2},
  "headers": {"Authorization": "Bearer xxx"},
  "status": "PENDING",
  "estimatedWaitMs": 5000,
  "queuedAt": "2025-11-10T09:00:00.000Z",
  "processedAt": null,
  "completedAt": null,
  "expiresAt": "2025-11-10T09:05:00.000Z",
  "retryCount": 0,
  "errorMessage": null
}
```
**Enum - RequestQueueStatus**: `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED` | `EXPIRED`

#### **ApiVersionUsage** (`data/tables/api-gateway/api-version-usage.json`)
Track API version adoption.
```json
{
  "id": "ver_usage_001",
  "version": "v1",
  "endpoint": "/api/v1/products",
  "userId": "user_001",
  "requestCount": 150,
  "lastUsedAt": "2025-11-10T09:00:00.000Z",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:00.000Z"
}
```

#### **CircuitBreakerState** (`data/tables/api-gateway/circuit-breaker-state.json`)
Circuit breaker status for services.
```json
{
  "id": "cb_001",
  "serviceName": "orders-service",
  "state": "CLOSED",
  "failureCount": 0,
  "successCount": 1500,
  "lastFailureAt": null,
  "lastSuccessAt": "2025-11-10T09:00:00.000Z",
  "nextRetryAt": null,
  "openedAt": null,
  "metadata": {"threshold": 5, "timeout": 60000},
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T09:00:00.000Z"
}
```
**Enum - CircuitBreakerStateEnum**: `CLOSED` | `OPEN` | `HALF_OPEN`

---

### 9️⃣ System Tables (3 tables)

#### **SystemConfig** (`data/tables/system/system-config.json`)
System-wide configuration settings.
```json
{
  "id": "config_001",
  "key": "MAINTENANCE_MODE",
  "value": {"enabled": false, "message": "System under maintenance"},
  "description": "Enable/disable maintenance mode",
  "category": "system",
  "isPublic": false,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

#### **AuditLog** (`data/tables/system/audit-log.json`)
System audit trail for all changes.
```json
{
  "id": "audit_001",
  "userId": "admin_001",
  "action": "UPDATE",
  "entity": "Product",
  "entityId": "prod_001",
  "oldValues": {"price": 120.00, "stock": 50},
  "newValues": {"price": 150.00, "stock": 45},
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-11-10T09:00:00.000Z"
}
```

#### **PushSubscription** (`data/tables/system/push-subscription.json`)
Web push notification subscriptions.
```json
{
  "id": "push_001",
  "userId": "user_001",
  "deviceId": "dev_001",
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "key_value_here",
    "auth": "auth_value_here"
  },
  "userAgent": "Mozilla/5.0...",
  "isActive": true,
  "createdAt": "2025-11-10T08:00:00.000Z",
  "updatedAt": "2025-11-10T08:00:00.000Z"
}
```

---

## 🔧 Usage in Next.js Application

### TypeScript Import Example
```typescript
// Import the main products database
import productsData from '@/data/products-database.json';

// Use in Server Component
export default async function ShopPage() {
  // Filter featured products
  const featured = productsData.filter(p => p.isFeatured);
  
  return (
    <div>
      {featured.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### API Route Example
```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import productsData from '@/data/products-database.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  let products = productsData;
  
  if (category) {
    products = products.filter(p => 
      p.categories.includes(category)
    );
  }
  
  return NextResponse.json({
    success: true,
    data: products,
    total: products.length
  });
}
```

### Client Component Example
```typescript
'use client';
import { useState, useEffect } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Fetch from API route that uses products-database.json
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.data));
  }, []);
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name} - ₱{product.price}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Additional Resources

### Documentation Files
- **`docs/SCHEMA_REFERENCE.md`** - Backend Prisma schema documentation
- **`docs/API_BACKEND_INTEGRATION_PROGRESS.md`** - API integration status
- **`documents/API_IMPLEMENTATION_GUIDE.md`** - API endpoint contracts
- **`data/README.md`** - Data folder overview
- **`data/tables/README.md`** - Schema templates index

### Schema Files Location
All 45 schema template files are organized in `data/tables/`:
- **core-ecommerce/** - 7 tables (Product, User, Order, etc.)
- **iot-devices/** - 6 tables (Device, Sensor, SensorData, etc.)
- **alerts-notifications/** - 8 tables (Alert, Notification, etc.)
- **security-auth/** - 4 tables (Session, ApiKey, SecurityLog, etc.)
- **rbac/** - 4 tables (Role, Permission, etc.)
- **analytics/** - 4 tables (Report, SearchLog, etc.)
- **import-export/** - 3 tables (ImportExportJob, etc.)
- **api-gateway/** - 6 tables (ApiGatewayConfig, RateLimitOverride, etc.)
- **system/** - 3 tables (SystemConfig, AuditLog, PushSubscription)

---

## ⚠️ Important Notes

### Enum Value Formatting
**Backend uses UPPERCASE** for all enum values. When sending data to the backend API, always use UPPERCASE:
- ✅ Correct: `"status": "PENDING"`, `"role": "BUYER"`, `"method": "GCASH"`
- ❌ Wrong: `"status": "Pending"`, `"role": "Buyer"`, `"method": "GCash"`

### Migration from JSON to Backend API
The `products-database.json` file is a temporary solution for development. When the backend API is ready:
1. Update `src/lib/api-client.ts` to call backend endpoints
2. Replace local JSON imports with API calls
3. Update TypeScript types in `src/types/api.ts` to match backend schema
4. Test enum compatibility (UPPERCASE vs lowercase)
5. Verify field mappings (e.g., `categories` array vs single `category` string)

### Schema Differences (Frontend vs Backend)
**Known Inconsistencies:**
- **Products**: Frontend uses `category` (string) + `categories` (array), backend only has `categories` (Json[])
- **Products**: Frontend has `costPrice`, backend has `costPrice` (optional)
- **Orders**: Frontend `status` values are titlecase ("Pending"), backend expects UPPERCASE ("PENDING")
- **Payments**: Frontend `method` is lowercase ("gcash"), backend expects UPPERCASE ("GCASH")
- **User**: Backend has `clerkId`, `role`, `isActive` - ensure frontend types include these

---

## 🎉 Summary

This guide provides **complete coverage of all 47 database tables** in the MASH platform:
- ✅ **1 main products database** with 9 ready-to-use products
- ✅ **45 schema template files** with example data
- ✅ **47 complete JSON structures** documented in this guide
- ✅ **All enums listed** with valid values
- ✅ **Usage examples** for Next.js/TypeScript integration
- ✅ **Migration guidance** for backend API integration

**Quick Start**: Import `data/products-database.json` in your components to immediately display all products on your website!
| **Sensor Alerts** | `data/tables/iot-devices/sensor-alert.json` | Threshold alerts |
| **Device Health** | `data/tables/iot-devices/device-health.json` | Device metrics |

### Alerts & Notifications Tables (8 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **Alert Rules** | `data/tables/alerts-notifications/alert-rule.json` | Alert definitions |
| **Alert Recipients** | `data/tables/alerts-notifications/alert-rule-recipient.json` | Notification recipients |
| **Alerts** | `data/tables/alerts-notifications/alert.json` | Alert instances |
| **Notifications** | `data/tables/alerts-notifications/notification.json` | Delivery records |
| **Acknowledgments** | `data/tables/alerts-notifications/alert-acknowledgment.json` | Alert actions |
| **Templates** | `data/tables/alerts-notifications/notification-template.json` | Message templates |
| **Escalation** | `data/tables/alerts-notifications/alert-escalation-policy.json` | Auto-escalation |
| **User Notifications** | `data/tables/alerts-notifications/user-notification.json` | In-app notifications |

### Security & Auth Tables (4 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **Sessions** | `data/tables/security-auth/session.json` | Session management |
| **API Keys** | `data/tables/security-auth/api-key.json` | API key management |
| **Security Logs** | `data/tables/security-auth/security-log.json` | Security events |
| **Rate Limits** | `data/tables/security-auth/rate-limit-log.json` | Rate limiting |

### RBAC Tables (4 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **Permissions** | `data/tables/rbac/permission.json` | Permission definitions |
| **Roles** | `data/tables/rbac/role.json` | User roles |
| **Role Assignments** | `data/tables/rbac/user-role-assignment.json` | User-role mapping |
| **Role Permissions** | `data/tables/rbac/role-permission.json` | Role-permission mapping |

### Analytics Tables (4 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **Reports** | `data/tables/analytics/report.json` | Report definitions |
| **Executions** | `data/tables/analytics/report-execution.json` | Execution logs |
| **Subscriptions** | `data/tables/analytics/report-subscription.json` | Report subscriptions |
| **Search Logs** | `data/tables/analytics/search-log.json` | Search analytics |

### Import/Export Tables (3 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **Jobs** | `data/tables/import-export/import-export-job.json` | Bulk import/export jobs |
| **Errors** | `data/tables/import-export/import-export-error.json` | Import/export errors |
| **Templates** | `data/tables/import-export/import-export-template.json` | Reusable templates |

### API Gateway Tables (6 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **Gateway Config** | `data/tables/api-gateway/api-gateway-config.json` | API routing config |
| **Rate Overrides** | `data/tables/api-gateway/rate-limit-override.json` | Custom rate limits |
| **Usage Logs** | `data/tables/api-gateway/api-usage-log.json` | API usage tracking |
| **Request Queue** | `data/tables/api-gateway/request-queue.json` | Throttled requests |
| **Version Usage** | `data/tables/api-gateway/api-version-usage.json` | Version tracking |
| **Circuit Breaker** | `data/tables/api-gateway/circuit-breaker-state.json` | Fault tolerance |

### System Tables (3 tables)

| Table | File Location | Description |
|-------|--------------|-------------|
| **System Config** | `data/tables/system/system-config.json` | System settings |
| **Audit Logs** | `data/tables/system/audit-log.json` | Audit trail |
| **Push Subscriptions** | `data/tables/system/push-subscription.json` | Push notifications |

---

## 🚀 How to Use Products Database

### 1. Import in TypeScript/JavaScript

```typescript
// Import the main products database
import productsData from '@/data/products-database.json';

// Type-safe usage (with TypeScript)
interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  comparePrice: number | null;
  costPrice: number;
  stock: number;
  minStock: number;
  weight: string;
  images: string[];
  image: string;
  category: string;
  categories: string[];
  tag: string | null;
  tags: string[];
  grower: string;
  growerId: string;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const products: Product[] = productsData;
```

### 2. Use in API Routes

```typescript
// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import productsData from '@/data/products-database.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');
  
  let products = productsData;
  
  // Filter featured products
  if (featured === 'true') {
    products = products.filter(p => p.isFeatured);
  }
  
  return NextResponse.json({
    success: true,
    data: products,
    total: products.length
  });
}
```

### 3. Use in Server Components

```typescript
// app/shop/page.tsx
import productsData from '@/data/products-database.json';

export default function ShopPage() {
  const products = productsData.filter(p => p.isActive);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 4. Filter by Category

```typescript
// Get all Growing Kits
const kits = productsData.filter(p => 
  p.categories.includes('Growing Kits')
);

// Get all Fresh Mushrooms
const fresh = productsData.filter(p => 
  p.categories.includes('Fresh Mushroom')
);

// Get all Snacks
const snacks = productsData.filter(p => 
  p.categories.includes('Snacks')
);
```

### 5. Search Products

```typescript
function searchProducts(query: string) {
  const lowerQuery = query.toLowerCase();
  return productsData.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
```

---

## 📝 Product Field Reference

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique product ID | `"1"` |
| `name` | string | Product name | `"Fresh White Oyster Mushrooms"` |
| `slug` | string | URL-friendly identifier | `"fresh-white-oyster-mushrooms"` |
| `sku` | string | Stock keeping unit | `"FWO-250G"` |
| `price` | number | Current price (PHP) | `120` |
| `stock` | number | Available quantity | `45` |
| `minStock` | number | Reorder threshold | `10` |
| `images` | string[] | Product image URLs | `["/white.jpg", ...]` |
| `image` | string | Primary image URL | `"/white.jpg"` |
| `categories` | string[] | Category list | `["Fresh Mushroom"]` |
| `tags` | string[] | Product tags | `["New", "Fresh"]` |
| `isActive` | boolean | Product visibility | `true` |
| `isFeatured` | boolean | Featured status | `true` |
| `isDeleted` | boolean | Soft delete flag | `false` |
| `createdAt` | string (ISO) | Creation date | `"2024-01-01T00:00:00Z"` |
| `updatedAt` | string (ISO) | Last update date | `"2024-01-01T00:00:00Z"` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Product description | `"Delicate, nutty flavor..."` |
| `comparePrice` | number\|null | Original price for discount | `150` |
| `costPrice` | number | Cost to seller | `80` |
| `weight` | string | Product weight | `"250g"` |
| `category` | string | Primary category | `"Fresh Mushroom"` |
| `tag` | string\|null | Primary tag | `"New"` |
| `grower` | string | Grower name | `"FungiFreshFarms"` |
| `growerId` | string | Grower ID | `"grower_001"` |
| `inStock` | boolean | Stock availability | `true` |

---

## 🏷️ Category Reference

**Available Categories**:
- `"Fresh Mushroom"` - Fresh harvested mushrooms
- `"Growing Kits"` - DIY mushroom growing kits
- `"Oyster Mushrooms"` - Oyster mushroom varieties
- `"Premium"` - Premium/gourmet products
- `"Beginner Friendly"` - Easy for beginners
- `"Mushroom Products"` - Processed mushroom products
- `"Snacks"` - Snack foods
- `"Preserved Foods"` - Preserved/processed foods
- `"Filipino Products"` - Traditional Filipino products
- `"Gourmet"` - Gourmet/specialty items

---

## 🏷️ Tag Reference

**Common Tags**:
- `"New"` - New product
- `"Popular"` - Popular/best seller
- `"Fresh"` - Fresh product
- `"Best Seller"` - Best selling item
- `"Beginner Friendly"` - Suitable for beginners
- `"Premium"` - Premium quality
- `"Gourmet"` - Gourmet product
- `"Snack"` / `"Chips"` / `"Crispy"` - Snack types
- `"Vegan"` - Vegan-friendly
- `"Filipino"` - Filipino product

---

## 👨‍🌾 Grower Reference

**Active Growers**:

1. **FungiFreshFarms** (`grower_001`)
   - Products: White Oyster, Mushroom Chips, Chicharon, Bagoong, King Oyster Kit

2. **TheMushroomPatchBukidnon** (`grower_002`)
   - Products: Blue Oyster Mushrooms, Blue Oyster Kit

3. **KingFarms** (`grower_003`)
   - Products: White Oyster Kit, Premium Golden Oyster Kit

---

## 🔄 Migration to Backend API

When ready to connect to the real backend API, update `src/lib/api/products.ts`:

```typescript
// Replace mock data import
// import productsData from '@/data/products-database.json';

// With real API call
export async function getProducts() {
  const response = await fetch('https://mash-backend-api-production.up.railway.app/api/products');
  const data = await response.json();
  return data;
}
```

---

## 📚 Additional Resources

- **Complete Schema Reference**: `data/tables/README.md`
- **Backend Schema**: `MASH-Backend/prisma/schema.prisma`
- **API Integration Guide**: `documents/API_IMPLEMENTATION_GUIDE.md`
- **Component Guide**: `docs/COMPONENT_GUIDE.md`

---

## ⚠️ Important Notes

### Enum Format
- **Backend uses UPPERCASE**: `"PENDING"`, `"COMPLETED"`, `"CASH_ON_DELIVERY"`
- **Frontend may use lowercase**: Ensure proper case conversion in API integration

### ID Formats
- **Products**: Simple numeric strings (`"1"`, `"2"`, etc.)
- **Most tables**: CUID format (`cm3vxyz123456789`)
- **Alert system**: UUID format (`550e8400-e29b-41d4-a716-446655440000`)

### Date Format
- Always use **ISO 8601**: `"2024-01-01T00:00:00Z"`
- Include timezone (Z for UTC or +08:00 for Manila)

### Image Paths
- Current: Relative paths (`"/white.jpg"`)
- Production: Full URLs or CDN paths

### Price Format
- Stored as **numbers** (not strings)
- No currency symbol in data
- PHP (Philippine Peso) is the currency

---

**Last Updated**: November 10, 2025  
**Products Database**: `data/products-database.json` (9 products)  
**Schema Version**: Based on MASH-Backend/prisma/schema.prisma
