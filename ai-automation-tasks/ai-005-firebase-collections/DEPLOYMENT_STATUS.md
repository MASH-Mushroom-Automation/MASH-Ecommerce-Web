# AI-005 Deployment Status

**Date:** January 8, 2026  
**Status:** ⚠️ Permission Issue (Workaround Available)

---

## What Happened

Firebase CLI deployment encountered a permission error:
```
Error: Request to https://serviceusage.googleapis.com/v1/projects/mash-ddf8d/services/firestore.googleapis.com had HTTP Error: 403, Permission denied
```

**Logged in as:** `jkrbn99@gmail.com`

---

## Solution Options

### Option 1: Deploy via Firebase Console (Web UI) ✅ RECOMMENDED

1. Go to: https://console.firebase.google.com/project/mash-ddf8d/firestore
2. Navigate to **"Rules"** tab
3. Copy content from [firestore.rules](firestore.rules)
4. Paste into Firebase Console Rules editor
5. Click **"Publish"**

Then for indexes:

6. Navigate to **"Indexes"** tab
7. Firebase will auto-create required indexes from queries
8. Or manually import from [firestore.indexes.json](firestore.indexes.json)

### Option 2: Grant Firebase Admin Permissions

Add the Google account (jkrbn99@gmail.com) to Firebase project with **Editor** role:

1. Go to https://console.firebase.google.com/project/mash-ddf8d/settings/iam
2. Click **"Add member"**
3. Email: `jkrbn99@gmail.com`
4. Role: **Editor**
5. Then retry: `firebase deploy --only firestore`

### Option 3: Use Service Account

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
firebase deploy --only firestore
```

---

## Next Step: Run Seed Data Script

The seed script doesn't require Firebase CLI permissions (uses Admin SDK directly):

```bash
node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
```

This will create:
- 3 sellers
- 672 availability slots
- 2 sample appointments

---

## Verification

After deployment (via console or CLI):

1. **Check Rules**: Go to Firestore > Rules tab - should see new appointment rules
2. **Check Indexes**: Firestore > Indexes tab - should show 5 new composite indexes
3. **Check Data**: Firestore > Data tab - should see `availability_slots` and `appointments` collections after seed script runs
4. **Test Query**: Query available slots (should work - public read)
5. **Security Test**: Try to read other user's appointments (should fail - auth required)

---

## Files Ready for Deployment

All files are prepared and validated:

- ✅ [firestore.rules](../../../firestore.rules) - Security rules (updated with 2 new collections)
- ✅ [firestore.indexes.json](../../../firestore.indexes.json) - Composite indexes (5 new indexes added)
- ✅ [seed-appointment-data.js](./seed-appointment-data.js) - Seed data script
- ✅ [COLLECTION_SCHEMA.md](./COLLECTION_SCHEMA.md) - Complete documentation

---

## What This Unblocks

Once deployed, you can:
1. Run seed data script to populate test data
2. Test queries in Firebase Console
3. Proceed to AI-006 (n8n workflow) with database fully configured
4. Widget on product pages is ready to connect to live data

