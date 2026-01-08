# 🚀 Single-File n8n Workflow - Complete Setup Guide

**Goal:** Import ONE file, configure once, test everything!

---

## 📦 What's in This Single File

**File:** `workflow-production-complete.json`

**Includes ALL 5 actions:**
1. ✅ **find_sellers** - AI-powered seller matching (Firestore + Ollama)
2. ✅ **get_availability** - Query available time slots  
3. ✅ **set_appointment** - Create appointments + book slots
4. ✅ **cancel_appointment** - Cancel appointments + release slots
5. ✅ **get_appointments** - Get appointment history

**Total nodes:** 18 nodes in one workflow!

---

## 🎯 3-Step Setup (3 minutes total)

### Step 1: Import the Single File (30 seconds)

1. Open n8n at **http://localhost:5678**
2. Click **"⋮" menu** (3 dots, top right)
3. Select **"Import from File..."**
4. Navigate to: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-006-n8n-workflow`
5. Select **`workflow-production-complete.json`**
6. Click **"Open"**

✅ **Done! All 18 nodes imported at once!**

---

### Step 2: Configure Firebase Credentials (1 minute)

**⚠️ IMPORTANT:** You only need to do this ONCE! All 8 Firebase nodes will share the same credential.

1. **Click any node with a red exclamation mark** (e.g., "Query Growers")
2. Under **"Credential to connect with"** → Click **"- Create New Credential -"**
3. Fill in:
   - **Name:** `Firebase MASH`
   - **Project ID:** `mash-ddf8d`
   - **Service Account JSON:** (Get from Firebase Console)

**Get Service Account JSON:**
- Go to: https://console.firebase.google.com/project/mash-ddf8d/settings/serviceaccounts/adminsdk
- Click **"Generate new private key"**
- Open downloaded `.json` file in Notepad
- Copy **ALL** content (starts with `{`, ends with `}`)
- Paste into n8n "Service Account" field

4. Click **"Save"**
5. **For ALL other Firebase nodes:**
   - Click each node with red exclamation mark
   - Under "Credential to connect with" → Select **"Firebase MASH"** from dropdown
   - Repeat for all 8 Firebase nodes

**Firebase nodes in workflow:**
- Query Growers
- Query Availability
- Query Availability Slots
- Create Appointment
- Mark Slot as Booked
- Get Appointment
- Update Appointment to Cancelled
- Release Slot
- Query Appointments

---

### Step 3: Activate & Test (1 minute)

1. **Click the toggle switch** (top-right corner) to activate workflow (turns blue/green)
2. Press **Ctrl+S** to save
3. **Run test script:**

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-006-n8n-workflow"
.\master-test-all.ps1
```

**Expected output:**
- ✅ 3 tests for find_sellers (9 seconds)
- ✅ 3 tests for get_availability (3 seconds)
- ✅ 3 tests for set_appointment (5 seconds)

**Total: 9 automated tests in ~20 seconds!**

---

## 📊 How the Workflow Works

### Webhook Entry Point
- **URL:** `http://localhost:5678/webhook/mash-appointments`
- **Method:** POST
- **Body:** `{ "action": "find_sellers", ... }`

### Routing Logic
```
Webhook → Action Router (Switch) → 5 branches:
  ├─ Branch 0: find_sellers    (Query Growers → Query Availability → Ollama AI → Format)
  ├─ Branch 1: get_availability (Query Availability Slots → Format)
  ├─ Branch 2: set_appointment  (Create Appointment → Mark Slot → Format)
  ├─ Branch 3: cancel_appointment (Get Appt → Update Appt → Release Slot → Format)
  └─ Branch 4: get_appointments (Query Appointments → Format)
```

### Example Request/Response

**Request:**
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
  "action": "find_sellers",
  "sellers": [
    {
      "id": "seller123",
      "name": "Manila Urban Farm",
      "specialty": "Oyster Mushrooms",
      "location": "Manila",
      "rating": 4.8,
      "availableSlots": [
        {
          "slotId": "slot001",
          "date": "2026-01-15",
          "startTime": "09:00",
          "endTime": "10:00"
        }
      ]
    }
  ]
}
```

---

## 🔧 Troubleshooting

### ❌ "No credentials found"
**Fix:** Complete Step 2 - add Firebase service account JSON to all nodes

### ❌ "Cannot connect to Firestore"
**Fix:** 
1. Check service account JSON is valid
2. Verify Firebase project ID is `mash-ddf8d`
3. Ensure all 8 Firebase nodes have credentials configured

### ❌ "Ollama connection failed"
**Fix:** Ensure Ollama is running:
```powershell
ollama serve
```

### ❌ "No sellers returned"
**Fix:** Seed Firebase with test data:
```powershell
cd ai-automation-tasks/ai-005-firebase-collections
node seed-appointment-data.js
```

### ❌ "Webhook not responding"
**Fix:** 
1. Check workflow is activated (toggle ON)
2. Check n8n is running: http://localhost:5678
3. Save workflow (Ctrl+S)

---

## ✅ Success Checklist

- [ ] Single workflow file imported
- [ ] Firebase credentials configured on ALL 8 Firebase nodes
- [ ] Workflow activated (toggle is ON/blue)
- [ ] Workflow saved (Ctrl+S)
- [ ] Test script ran without errors (`.\master-test-all.ps1`)
- [ ] All 9 tests passed (find_sellers, get_availability, set_appointment)

---

## 📝 Testing Individual Actions

**Test find_sellers only:**
```powershell
.\test-phase2.ps1
```

**Test get_availability only:**
```powershell
.\test-phase3.ps1
```

**Test set_appointment only:**
```powershell
.\test-phase4.ps1
```

**Test ALL actions:**
```powershell
.\master-test-all.ps1
```

---

## 🎓 Understanding the Workflow

After importing, explore in n8n:

1. **Click nodes** to see their configuration
2. **Click "Test step"** to see data flow
3. **Check "Executions"** sidebar to see past runs
4. **Modify values** and experiment

**Node Types:**
- **Webhook** - Receives POST requests
- **Switch** - Routes by action field
- **Firestore Get All** - Query collections (growers, availability_slots, appointments)
- **Firestore Get** - Get single document
- **Firestore Add** - Create new document
- **Firestore Update** - Update existing document
- **HTTP Request** - Call Ollama AI
- **Code** - JavaScript to format responses

---

## 🚀 Production Deployment

Once tested locally:

1. **Export workflow:** n8n → "⋮" menu → "Export"
2. **Upload to production n8n**
3. **Update credentials** for production Firebase
4. **Update webhook URL** in frontend (AppointmentWidget):
   ```typescript
   const WEBHOOK_URL = "https://your-n8n-domain.com/webhook/mash-appointments";
   ```

---

## 💡 Pro Tips

- **Save often** (Ctrl+S) - n8n doesn't auto-save
- **Check executions** in sidebar to debug failures
- **Use "Test step"** button on nodes to see data flow
- **Keep browser tab open** - closing stops webhook
- **One workflow = one webhook URL** - all 5 actions share same endpoint

---

## 🎉 You're Done!

**ONE file, ONE import, ONE test = COMPLETE appointment system!**

Reply with:
- "All tests passed!" ✅
- Or paste any error message for help

---

**Next:** Use this workflow in production or build additional features! 🚀
