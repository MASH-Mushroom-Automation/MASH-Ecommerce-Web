# Firebase Collections Schema Documentation (AI-005)

This document defines the Firestore collections for the AI appointment booking system.

## Collection: `availability_slots`

Stores time slots when sellers are available for buyer appointments.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seller_uid` | string | Yes | Firebase Auth UID of the seller |
| `seller_name` | string | Yes | Display name of the seller |
| `available_date` | string | Yes | Date in YYYY-MM-DD format |
| `start_time` | string | Yes | Start time in HH:mm format (24-hour) |
| `end_time` | string | Yes | End time in HH:mm format (24-hour) |
| `scheduled_time` | timestamp | Yes | Combined date/time as Firestore Timestamp |
| `is_available` | boolean | Yes | Whether slot is currently available |
| `created_at` | timestamp | Yes | Creation timestamp (server) |
| `updated_at` | timestamp | Yes | Last update timestamp (server) |

### Indexes

```json
// Query by seller + date + availability
{
  "collectionGroup": "availability_slots",
  "fields": [
    { "fieldPath": "seller_uid", "order": "ASCENDING" },
    { "fieldPath": "available_date", "order": "ASCENDING" },
    { "fieldPath": "is_available", "order": "ASCENDING" }
  ]
}

// Query available slots sorted by date/time
{
  "collectionGroup": "availability_slots",
  "fields": [
    { "fieldPath": "seller_uid", "order": "ASCENDING" },
    { "fieldPath": "is_available", "order": "ASCENDING" },
    { "fieldPath": "available_date", "order": "ASCENDING" },
    { "fieldPath": "start_time", "order": "ASCENDING" }
  ]
}
```

### Security Rules

```javascript
match /availability_slots/{slotId} {
  // Anyone can read available slots (buyers need to see them)
  allow read: if true;
  
  // Only sellers can create/update their own availability slots
  allow create, update: if isSignedIn() && 
                           (request.resource.data.seller_uid == request.auth.uid || isAdmin());
  
  // Only sellers can delete their own slots
  allow delete: if isSignedIn() && 
                  (resource.data.seller_uid == request.auth.uid || isAdmin());
}
```

### Example Document

```json
{
  "seller_uid": "seller_juan_farm_001",
  "seller_name": "Juan's Farm",
  "available_date": "2026-01-10",
  "start_time": "09:00",
  "end_time": "09:30",
  "scheduled_time": Timestamp(2026-01-10T09:00:00Z),
  "is_available": true,
  "created_at": Timestamp(2026-01-08T12:00:00Z),
  "updated_at": Timestamp(2026-01-08T12:00:00Z)
}
```

### Common Queries

```javascript
// Get available slots for a seller in date range
db.collection('availability_slots')
  .where('seller_uid', '==', sellerId)
  .where('is_available', '==', true)
  .where('available_date', '>=', startDate)
  .where('available_date', '<=', endDate)
  .orderBy('available_date', 'asc')
  .orderBy('start_time', 'asc')
  .get();

// Get next 7 days of available slots for seller
const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

db.collection('availability_slots')
  .where('seller_uid', '==', sellerId)
  .where('is_available', '==', true)
  .where('available_date', '>=', today)
  .where('available_date', '<=', nextWeek)
  .limit(21) // 3 slots per day * 7 days
  .get();
```

---

## Collection: `appointments`

Stores booked appointments between buyers and sellers.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `buyer_uid` | string | Yes | Firebase Auth UID of the buyer |
| `buyer_name` | string | Yes | Display name of the buyer |
| `buyer_email` | string | Yes | Email address of the buyer |
| `buyer_phone` | string | Yes | Phone number of the buyer |
| `buyer_location` | string | Yes | Buyer's location (city/address) |
| `seller_uid` | string | Yes | Firebase Auth UID of the seller |
| `seller_name` | string | Yes | Display name of the seller |
| `seller_email` | string | Yes | Email address of the seller |
| `product_type` | string | Yes | Type of mushroom product |
| `quantity` | number | Yes | Quantity in kg |
| `scheduled_date` | string | Yes | Appointment date (YYYY-MM-DD) |
| `scheduled_time` | timestamp | Yes | Appointment date/time as Timestamp |
| `status` | string | Yes | Status: `pending`, `confirmed`, `completed`, `cancelled` |
| `special_requests` | string | No | Additional notes from buyer |
| `created_at` | timestamp | Yes | Creation timestamp (server) |
| `updated_at` | timestamp | Yes | Last update timestamp (server) |
| `confirmed_at` | timestamp | No | When seller confirmed |
| `completed_at` | timestamp | No | When appointment completed |
| `cancelled_at` | timestamp | No | When cancelled |
| `cancellation_reason` | string | No | Reason for cancellation |

### Indexes

```json
// Query buyer appointments by status
{
  "collectionGroup": "appointments",
  "fields": [
    { "fieldPath": "buyer_uid", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "scheduled_time", "order": "DESCENDING" }
  ]
}

// Query seller appointments by status
{
  "collectionGroup": "appointments",
  "fields": [
    { "fieldPath": "seller_uid", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "scheduled_time", "order": "ASCENDING" }
  ]
}

// Query seller appointments by date
{
  "collectionGroup": "appointments",
  "fields": [
    { "fieldPath": "seller_uid", "order": "ASCENDING" },
    { "fieldPath": "scheduled_date", "order": "ASCENDING" },
    { "fieldPath": "scheduled_time", "order": "ASCENDING" }
  ]
}
```

### Security Rules

```javascript
match /appointments/{appointmentId} {
  // Users can read their own appointments (as buyer or seller)
  allow read: if isSignedIn() && 
                 (resource.data.buyer_uid == request.auth.uid || 
                  resource.data.seller_uid == request.auth.uid ||
                  isAdmin());
  
  // Authenticated users can create appointments
  allow create: if isSignedIn() && request.resource.data.buyer_uid == request.auth.uid;
  
  // Buyers/sellers can update their appointments (reschedule/cancel/confirm)
  allow update: if isSignedIn() && 
                   (resource.data.buyer_uid == request.auth.uid || 
                    resource.data.seller_uid == request.auth.uid ||
                    isAdmin());
  
  // Only admins can delete appointments
  allow delete: if isAdmin();
}
```

### Example Document

```json
{
  "buyer_uid": "buyer_test_001",
  "buyer_name": "John Buyer",
  "buyer_email": "john@example.com",
  "buyer_phone": "+639201234567",
  "buyer_location": "Manila",
  "seller_uid": "seller_juan_farm_001",
  "seller_name": "Juan's Farm",
  "seller_email": "juan@example.com",
  "product_type": "Oyster Mushroom",
  "quantity": 10,
  "scheduled_date": "2026-01-10",
  "scheduled_time": Timestamp(2026-01-10T10:00:00Z),
  "status": "confirmed",
  "special_requests": "Please call before delivery",
  "created_at": Timestamp(2026-01-08T12:00:00Z),
  "updated_at": Timestamp(2026-01-08T14:00:00Z),
  "confirmed_at": Timestamp(2026-01-08T14:00:00Z)
}
```

### Common Queries

```javascript
// Get buyer's upcoming appointments
db.collection('appointments')
  .where('buyer_uid', '==', buyerUid)
  .where('status', 'in', ['pending', 'confirmed'])
  .orderBy('scheduled_time', 'asc')
  .get();

// Get seller's appointments for a specific date
db.collection('appointments')
  .where('seller_uid', '==', sellerUid)
  .where('scheduled_date', '==', '2026-01-10')
  .orderBy('scheduled_time', 'asc')
  .get();

// Get all pending appointments for seller
db.collection('appointments')
  .where('seller_uid', '==', sellerUid)
  .where('status', '==', 'pending')
  .orderBy('scheduled_time', 'asc')
  .get();
```

---

## Status Flow

### Appointment Status Transitions

```
pending → confirmed → completed
   ↓
cancelled
```

1. **pending**: Buyer creates appointment, waiting for seller confirmation
2. **confirmed**: Seller accepts appointment
3. **completed**: Appointment successfully finished
4. **cancelled**: Either party cancels (set `cancellation_reason`)

### Availability Slot Management

When an appointment is:
- **Created**: Set slot `is_available = false`
- **Confirmed**: Keep slot `is_available = false`
- **Cancelled**: Set slot `is_available = true`
- **Completed**: Keep slot `is_available = false` (historical)

---

## Deployment

### 1. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

Or deploy both:

```bash
firebase deploy --only firestore
```

### 3. Seed Test Data

```bash
node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
```

This creates:
- 3 sample sellers
- 7 days of availability slots (9 AM - 5 PM, 30-min intervals)
- 2 sample appointments (1 confirmed, 1 pending)

---

## Integration with n8n (AI-006)

The n8n workflow will:

1. **find_sellers**: Query `growers` collection + match with `availability_slots`
2. **get_availability**: Query `availability_slots` for seller
3. **set_appointment**: 
   - Create document in `appointments` (status: pending)
   - Update `availability_slots` (is_available: false)
   - Send email confirmation
4. **cancel_appointment**: 
   - Update `appointments` (status: cancelled)
   - Update `availability_slots` (is_available: true)
5. **get_appointments**: Query `appointments` for buyer_uid/seller_uid

---

## Testing Checklist

- [ ] Security rules deployed
- [ ] Indexes deployed and built (check Firebase Console)
- [ ] Seed data created successfully
- [ ] Query buyer appointments (verify read permissions)
- [ ] Query seller appointments (verify read permissions)
- [ ] Create appointment as authenticated user (verify write permissions)
- [ ] Try to read other user's appointments (verify fails)
- [ ] Try to update appointment as owner (verify succeeds)
- [ ] Try to delete appointment as non-admin (verify fails)
- [ ] Query available slots (verify public read works)

---

## Next Steps (AI-006)

Build n8n workflow with 5 webhook actions:
1. `find_sellers` - Ollama AI matching + availability query
2. `get_availability` - Query seller's available slots
3. `set_appointment` - Create appointment + send email
4. `cancel_appointment` - Update status + free slot
5. `get_appointments` - Get user's appointments

See: `ai-automation-tasks/ai-006-n8n-workflow/README.md`
