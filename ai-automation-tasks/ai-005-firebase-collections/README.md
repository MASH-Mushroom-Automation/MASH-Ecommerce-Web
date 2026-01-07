# AI-005: Firebase Collections

**Status:** ✅ Complete  
**Time Spent:** ~30 minutes  
**Completed:** January 8, 2026

---

## Overview

Created two Firestore collections to enable the AI appointment booking system:
- `availability_slots` - When sellers are available for appointments
- `appointments` - Booked appointments between buyers and sellers

---

## Quick Start

### 1. Deploy to Firebase

```bash
firebase deploy --only firestore
```

### 2. Run Seed Data Script

```bash
node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
```

This creates:
- **3 sellers** (Juan's Farm, Maria's Mushrooms, Pedro's Organic)
- **672 availability slots** (7 days, 9 AM - 5 PM, 30-min intervals)
- **2 sample appointments** (1 confirmed, 1 pending)

---

## Files

| File | Description |
|------|-------------|
| [COLLECTION_SCHEMA.md](./COLLECTION_SCHEMA.md) | Complete schema reference with field descriptions, security rules, indexes, query examples |
| [seed-appointment-data.js](./seed-appointment-data.js) | Seed data script to create test sellers, slots, and appointments |
| [PROGRESS.md](./PROGRESS.md) | Phase-by-phase progress tracker (6 phases) |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Step-by-step deployment instructions with troubleshooting |
| [README.md](./README.md) | This file |

---

## Collections

### `availability_slots`

**Purpose:** Store seller availability for appointment booking

**Schema:**
```typescript
{
  seller_uid: string;        // Firebase Auth UID
  seller_name: string;       // Display name
  available_date: string;    // YYYY-MM-DD
  start_time: string;        // HH:mm (24-hour)
  end_time: string;          // HH:mm (24-hour)
  scheduled_time: Timestamp; // Combined date/time
  is_available: boolean;     // Currently available
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

**Security:**
- Public read (buyers need to see available slots)
- Seller-only write for own slots
- Admin can manage all slots

**Indexes:**
- seller_uid + available_date + is_available
- seller_uid + is_available + available_date + start_time

---

### `appointments`

**Purpose:** Store booked appointments

**Schema:**
```typescript
{
  // Buyer info
  buyer_uid: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_location: string;
  
  // Seller info
  seller_uid: string;
  seller_name: string;
  seller_email: string;
  
  // Appointment details
  product_type: string;
  quantity: number;
  scheduled_date: string;    // YYYY-MM-DD
  scheduled_time: Timestamp;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  
  // Timestamps
  created_at: Timestamp;
  updated_at: Timestamp;
  confirmed_at?: Timestamp;
  completed_at?: Timestamp;
  cancelled_at?: Timestamp;
  cancellation_reason?: string;
}
```

**Security:**
- Buyer/seller read for own appointments
- Buyer create (own buyer_uid only)
- Buyer/seller update (reschedule/cancel)
- Admin-only delete

**Indexes:**
- buyer_uid + status + scheduled_time (DESC)
- seller_uid + status + scheduled_time (ASC)
- seller_uid + scheduled_date + scheduled_time

---

## Common Queries

### Get Available Slots for Seller

```javascript
db.collection('availability_slots')
  .where('seller_uid', '==', 'seller_juan_farm_001')
  .where('is_available', '==', true)
  .where('available_date', '>=', '2026-01-10')
  .orderBy('available_date', 'asc')
  .orderBy('start_time', 'asc')
  .limit(21) // Next 3 days
  .get();
```

### Get Buyer's Upcoming Appointments

```javascript
db.collection('appointments')
  .where('buyer_uid', '==', buyerUid)
  .where('status', 'in', ['pending', 'confirmed'])
  .orderBy('scheduled_time', 'asc')
  .get();
```

### Get Seller's Appointments for Today

```javascript
const today = new Date().toISOString().split('T')[0];

db.collection('appointments')
  .where('seller_uid', '==', sellerUid)
  .where('scheduled_date', '==', today)
  .orderBy('scheduled_time', 'asc')
  .get();
```

---

## Status Flow

```
pending → confirmed → completed
   ↓
cancelled
```

1. **pending**: Buyer creates appointment, waiting for seller confirmation
2. **confirmed**: Seller accepts appointment
3. **completed**: Appointment successfully finished
4. **cancelled**: Either party cancels

---

## Integration with n8n (AI-006)

The n8n workflow will interact with these collections:

| Action | Collection | Operation |
|--------|-----------|-----------|
| `find_sellers` | availability_slots | Query available slots by product type |
| `get_availability` | availability_slots | Query slots for specific seller |
| `set_appointment` | appointments + availability_slots | Create appointment + mark slot unavailable |
| `cancel_appointment` | appointments + availability_slots | Update status + free slot |
| `get_appointments` | appointments | Query by buyer_uid or seller_uid |

---

## Testing

### Manual Test in Firebase Console

1. Go to https://console.firebase.google.com/project/mash-ddf8d/firestore/data
2. Navigate to `availability_slots` collection
3. Find a document with `is_available: true`
4. Manually create an appointment in `appointments` collection referencing that slot
5. Update the slot to `is_available: false`
6. Verify security rules prevent unauthorized access

### Automated Test

```bash
# Install Firebase Testing Library
npm install --save-dev @firebase/rules-unit-testing

# Run tests (after creating test file)
npm test
```

---

## Deployment Checklist

- [ ] Run `firebase deploy --only firestore`
- [ ] Verify all 5 indexes show "Enabled" in Firebase Console
- [ ] Run seed data script
- [ ] Verify 672 slots + 2 appointments created
- [ ] Test query: Get available slots for Juan's Farm
- [ ] Test query: Get buyer appointments
- [ ] Test query: Get seller appointments
- [ ] Test security: Try to read other user's appointments (should fail)

---

## Next Steps

### Immediate (Manual Steps)

1. **Deploy to Firebase**
   ```bash
   firebase deploy --only firestore
   ```

2. **Run Seed Data**
   ```bash
   node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
   ```

3. **Verify in Console**
   - Check Firestore > Indexes (all "Enabled")
   - Check Firestore > Data (672 slots + 2 appointments)

### AI-006: n8n Workflow (Next Task)

Build n8n workflow with 5 webhook actions:

1. **find_sellers** - Ollama AI matching + availability query
2. **get_availability** - Query availability_slots for seller
3. **set_appointment** - Create appointment + mark slot unavailable + send email
4. **cancel_appointment** - Update status + free slot + notify
5. **get_appointments** - Get user's appointments (buyer or seller)

**Estimated Time:** 2-3 hours  
**Dependencies:** AI-002 (n8n), AI-003 (Ollama), AI-004 (Widget), AI-005 (Collections ✅)

---

## Troubleshooting

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for common issues and solutions.

---

## Documentation

- **Schema Reference**: [COLLECTION_SCHEMA.md](./COLLECTION_SCHEMA.md)
- **Deployment Instructions**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Progress Tracker**: [PROGRESS.md](./PROGRESS.md)
- **Master Task List**: [../AI_AUTOMATION_GITHUB_TASKS.md](../AI_AUTOMATION_GITHUB_TASKS.md)
