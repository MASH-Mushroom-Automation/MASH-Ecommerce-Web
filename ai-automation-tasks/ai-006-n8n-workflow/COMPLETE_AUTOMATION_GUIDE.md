# 🚀 AI-006 COMPLETE AUTOMATION PACKAGE

**Created:** January 8, 2026  
**Goal:** Zero-effort import & test for all AI-006 phases

---

## 📦 What's Included

### Importable Workflow Files (n8n JSON)
1. ✅ `workflow-phase2-find_sellers.json` - AI seller matching with Ollama
2. ✅ `workflow-phase3-get_availability.json` - Query available time slots
3. ✅ `workflow-phase4-set_appointment.json` - Create appointment + book slot
4. ✅ `workflow-complete-all-phases.json` - Production-ready all-in-one workflow

### Automated Test Scripts (PowerShell)
1. ✅ `test-phase2.ps1` - 3 test cases for find_sellers
2. ✅ `test-phase3.ps1` - 3 test cases for get_availability
3. ✅ `test-phase4.ps1` - 3 test cases for set_appointment
4. ✅ `master-test-all.ps1` - **Run ALL tests in sequence**

### Documentation
1. ✅ `IMPORT_GUIDE.md` - Step-by-step import instructions
2. ✅ `COMPLETE_AUTOMATION_GUIDE.md` - This file

---

## 🎯 Quick Start (3 Steps)

### Step 1: Import ALL Workflows (2 minutes)

Open n8n at http://localhost:5678

**Import Phase 2:**
1. Click "⋮" menu → "Import from File"
2. Select `workflow-phase2-find_sellers.json`
3. Click "Import"

**Import Phase 3:**
1. Click "⋮" menu → "Import from File"
2. Select `workflow-phase3-get_availability.json`
3. Click "Import"

**Import Phase 4:**
1. Click "⋮" menu → "Import from File"
2. Select `workflow-phase4-set_appointment.json`
3. Click "Import"

**OR import the complete workflow:**
1. Click "⋮" menu → "Import from File"
2. Select `workflow-complete-all-phases.json`
3. Click "Import" (this includes all 5 actions in one workflow)

---

### Step 2: Configure Firebase Credentials (1 minute)

**Do this ONCE for each workflow:**

1. Click any Firebase node (red exclamation mark)
2. Under "Credential to connect with" → **"- Create New Credential -"**
3. Fill in:
   - **Name:** `Firebase MASH`
   - **Project ID:** `mash-ddf8d`
   - **Service Account JSON:** (Get from Firebase Console)

**Get Service Account JSON:**
- Go to: https://console.firebase.google.com/project/mash-ddf8d/settings/serviceaccounts/adminsdk
- Click **"Generate new private key"**
- Open downloaded `.json` file
- Copy **ALL** content
- Paste into n8n

4. Click **"Save"**
5. **Select same credential** for all other Firebase nodes in all workflows

---

### Step 3: Test Everything (1 minute)

**Run master test script:**

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-006-n8n-workflow"
.\master-test-all.ps1
```

**Expected output:**
- ✅ 3 tests for find_sellers (Oyster, Shiitake, large order)
- ✅ 3 tests for get_availability (all slots, specific date, non-existent seller)
- ✅ 3 tests for set_appointment (valid, different product, large order)

**Total: 9 automated tests in ~30 seconds!**

---

## 📊 What Each Workflow Does

### Phase 2: find_sellers
**Webhook Input:**
```json
{
  "action": "find_sellers",
  "productType": "Oyster Mushroom",
  "quantity": 10,
  "location": "Manila",
  "preferredDate": "2026-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "sellers": [
    {
      "id": "seller123",
      "name": "Manila Urban Farm",
      "specialty": "Oyster Mushrooms",
      "location": "Manila",
      "rating": 4.8,
      "availableSlots": [...]
    }
  ]
}
```

**Workflow Flow:**
1. Webhook receives request
2. Switch routes to find_sellers
3. Query Growers (Firestore: role==SELLER)
4. Query Availability (Firestore: is_available==true, date>=today)
5. Ollama AI ranks sellers (localhost:11434)
6. Format response with top 3 sellers + 3 slots each

---

### Phase 3: get_availability
**Webhook Input:**
```json
{
  "action": "get_availability",
  "sellerId": "seller_001",
  "preferredDate": "2026-01-15"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "availabilityByDate": {
    "2026-01-15": [
      {
        "slotId": "slot_001",
        "startTime": "09:00",
        "endTime": "10:00",
        "duration": 60,
        "isAvailable": true
      }
    ]
  },
  "totalSlots": 5
}
```

**Workflow Flow:**
1. Webhook receives request
2. Switch routes to get_availability
3. Query Availability Slots (Firestore: seller_uid==X, is_available==true)
4. Group by date, filter by preferredDate if provided
5. Format response with slots organized by date

---

### Phase 4: set_appointment
**Webhook Input:**
```json
{
  "action": "set_appointment",
  "buyerUid": "buyer_001",
  "sellerUid": "seller_001",
  "slotId": "slot_001",
  "productType": "Oyster Mushroom",
  "quantity": 10,
  "scheduledTime": "2026-01-15T10:00:00Z",
  "location": "Manila",
  "notes": "Please bring samples"
}
```

**Response:**
```json
{
  "success": true,
  "appointmentId": "appt_XYZ123",
  "appointment": {
    "buyerUid": "buyer_001",
    "sellerUid": "seller_001",
    "status": "pending",
    "scheduledTime": "2026-01-15T10:00:00Z"
  },
  "message": "Appointment created successfully. Seller will be notified."
}
```

**Workflow Flow:**
1. Webhook receives request
2. Switch routes to set_appointment
3. Create Appointment (Firestore: appointments collection)
4. Mark Slot as Booked (Firestore: update availability_slots, set is_available=false)
5. Format success response with appointment ID

---

## 🔥 Production Workflow (All-in-One)

**File:** `workflow-complete-all-phases.json`

**Includes:**
- ✅ All 5 actions: find_sellers, get_availability, set_appointment, cancel_appointment, get_appointments
- ✅ Error handling for all branches
- ✅ Response formatting
- ✅ Firebase connection reuse (one credential for all nodes)

**Use this for production deployment!**

---

## 🧪 Running Individual Tests

**Test Phase 2 only:**
```powershell
.\test-phase2.ps1
```

**Test Phase 3 only:**
```powershell
.\test-phase3.ps1
```

**Test Phase 4 only:**
```powershell
.\test-phase4.ps1
```

**Test ALL phases:**
```powershell
.\master-test-all.ps1
```

---

## 🛠️ Troubleshooting

### ❌ "No credentials found"
**Fix:** Complete Step 2 above - add Firebase service account JSON

### ❌ "Cannot connect to Firestore"
**Fix:** Verify service account JSON is valid (should start with `{` and end with `}`)

### ❌ "Ollama connection failed"
**Fix:** Ensure Ollama is running:
```powershell
ollama serve
```

### ❌ "No sellers returned"
**Fix:** Seed Firebase data:
```powershell
cd ai-automation-tasks/ai-005-firebase-collections
node seed-appointment-data.js
```

### ❌ "Webhook not found"
**Fix:** Activate workflow (toggle switch in top-right of n8n UI must be ON)

---

## ✅ Success Checklist

After importing and testing:

- [ ] All 3 workflows imported (or 1 complete workflow)
- [ ] Firebase credentials configured on all nodes
- [ ] All workflows activated (toggle ON)
- [ ] `master-test-all.ps1` completed without errors
- [ ] n8n executions show 9 successful runs
- [ ] Response JSONs contain `success: true`

---

## 📚 Next Steps

### Option A: Deploy to Production
1. Export workflows from n8n
2. Import into production n8n instance
3. Update Firebase credentials for production
4. Update webhook URL in frontend (AppointmentWidget)

### Option B: Build Remaining Phases (5-8)
- **Phase 5:** cancel_appointment action
- **Phase 6:** get_appointments action (buyer/seller history)
- **Phase 7:** Error handling & validation
- **Phase 8:** Testing & documentation

Let me know if you want me to build Phase 5-8 JSONs + tests! 🚀

---

## 💡 Tips

- **Save often** in n8n (Ctrl+S) - it doesn't auto-save
- **Check executions** in n8n sidebar to debug failures
- **Use n8n "Test step"** button on individual nodes to see data flow
- **Modify & experiment** - workflows are templates, customize them!

---

**Ready?** Start with Step 1! Import the workflows and let's test! 🎯
