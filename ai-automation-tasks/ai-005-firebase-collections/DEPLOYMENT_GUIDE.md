# AI-005 Deployment Guide

Quick guide to deploy Firebase Collections to production.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Logged in to Firebase (`firebase login`)
- Firebase project: `mash-ddf8d`

## Step 1: Deploy Security Rules & Indexes

```bash
cd c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web
firebase deploy --only firestore
```

**What this does:**
- Deploys `firestore.rules` with new appointment collections
- Deploys `firestore.indexes.json` with 5 composite indexes
- Builds indexes in Firebase Console (takes 5-10 minutes)

**Expected output:**
```
✔  firestore: released rules firestore.rules to cloud.firestore
✔  firestore: deployed indexes in firestore.indexes.json successfully
```

## Step 2: Verify Indexes in Firebase Console

1. Go to: https://console.firebase.google.com/project/mash-ddf8d/firestore/indexes
2. Wait for all 5 indexes to show **"Enabled"** status:
   - `availability_slots`: 2 composite indexes
   - `appointments`: 3 composite indexes
3. If any index shows "Building", wait 5-10 minutes

## Step 3: Run Seed Data Script

```bash
node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
```

**What this creates:**
- **3 sellers**: Juan's Farm, Maria's Mushrooms, Pedro's Organic
- **672 availability slots**: 7 days × 16 slots/day × 3 sellers
- **2 sample appointments**: 1 confirmed, 1 pending

**Expected output:**
```
🌱 Starting appointment data seeding...

📅 Creating availability slots...
  - Creating 224 slots for Juan's Farm...
    ✅ 224 slots created
  - Creating 224 slots for Maria's Mushrooms...
    ✅ 224 slots created
  - Creating 224 slots for Pedro's Organic...
    ✅ 224 slots created
  ✅ Total: 672 availability slots created

🤝 Creating sample appointments...
  ✅ Created confirmed appointment (ID: abc123)
  ✅ Created pending appointment (ID: def456)

✅ Seeding complete!
```

## Step 4: Verify Data in Firestore

1. Go to: https://console.firebase.google.com/project/mash-ddf8d/firestore/data
2. Check `availability_slots` collection:
   - Should have 672 documents
   - Fields: seller_uid, seller_name, available_date, start_time, end_time, scheduled_time, is_available
3. Check `appointments` collection:
   - Should have 2 documents
   - Fields: buyer_uid, buyer_name, buyer_email, seller_uid, seller_name, product_type, quantity, scheduled_date, scheduled_time, status

## Step 5: Test Queries

Run these queries in Firebase Console > Firestore > Query tab:

### Query 1: Get Available Slots for Juan's Farm

```
Collection: availability_slots
Filters:
  - seller_uid == seller_juan_farm_001
  - is_available == true
Order by: available_date asc
Limit: 10
```

**Expected**: 10 available slots for Juan's Farm

### Query 2: Get Buyer Appointments

```
Collection: appointments
Filters:
  - buyer_uid == buyer_test_001
Order by: scheduled_time desc
```

**Expected**: 1 appointment (confirmed)

### Query 3: Get Seller Appointments

```
Collection: appointments
Filters:
  - seller_uid == seller_juan_farm_001
  - status == confirmed
Order by: scheduled_time asc
```

**Expected**: 1 appointment

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: Security rules not deployed properly

**Fix:**
```bash
firebase deploy --only firestore:rules
```

### Error: "The query requires an index"

**Cause**: Composite indexes not built yet

**Fix:** Wait 5-10 minutes for indexes to build in Firebase Console

### Error: "GOOGLE_APPLICATION_CREDENTIALS not found"

**Cause**: Seed script can't find Firebase Admin SDK credentials

**Fix:**
```bash
# Make sure this file exists:
c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\mash-ddf8d-firebase-adminsdk-credentials.json
```

### Seed Script Fails

**Fix 1**: Check Firebase Admin SDK credentials path in seed script:
```javascript
const serviceAccountPath = path.join(__dirname, '../../mash-ddf8d-firebase-adminsdk-credentials.json');
```

**Fix 2**: Run from project root:
```bash
node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
```

## Success Criteria

✅ All checks should pass:

- [ ] `firebase deploy --only firestore` succeeds
- [ ] All 5 indexes show "Enabled" in Firebase Console
- [ ] Seed script creates 672 slots + 2 appointments
- [ ] Query 1 returns available slots for Juan's Farm
- [ ] Query 2 returns buyer's appointment
- [ ] Query 3 returns seller's appointment
- [ ] Security rules prevent unauthorized access (test by trying to read other user's appointments)

## Next Steps

After deployment succeeds:

1. **AI-006**: Build n8n workflow with 5 webhook actions
   - `find_sellers` - Ollama AI matching + availability query
   - `get_availability` - Query availability_slots
   - `set_appointment` - Create appointment + email
   - `cancel_appointment` - Update status + free slot
   - `get_appointments` - Get user's appointments

2. **AI-007**: Build Seller Availability Management dashboard
3. **AI-008**: Build Buyer Appointment Dashboard

## Clean Up (Optional)

To remove test data and start fresh:

```javascript
// Run in Firebase Console > Firestore > Rules Playground or n8n

// Delete all test appointments
db.collection('appointments').get().then(snapshot => {
  snapshot.forEach(doc => doc.ref.delete());
});

// Delete all test slots
db.collection('availability_slots').get().then(snapshot => {
  snapshot.forEach(doc => doc.ref.delete());
});
```

Then re-run seed script to create fresh data.
