# 🚀 AI-006 n8n Workflow Import Guide

**Goal:** Import pre-built Phase 2 workflow in 2 minutes instead of building manually for 40 minutes!

---

## 📦 What You're Importing

**File:** `workflow-phase2-find_sellers.json`

**What it contains:**
- ✅ Webhook node (receives requests)
- ✅ Switch node (routes to 5 actions)
- ✅ Query Growers (Firebase) - Fetches sellers
- ✅ Query Availability (Firebase) - Gets time slots
- ✅ Ollama AI Match (HTTP) - AI seller ranking
- ✅ Format Response (Code) - Formats output JSON

---

## 🎯 Step-by-Step Import

### Step 1: Open n8n
1. Go to http://localhost:5678 in your browser
2. You should see your n8n dashboard

---

### Step 2: Import Workflow

**Two methods - choose ONE:**

#### **Method A: Import from File (Recommended)**

1. Click **"New Workflow"** (top right) or **"+ Add workflow"**
2. Click the **"⋮" menu** (3 dots icon, top right)
3. Select **"Import from File..."**
4. Navigate to: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-006-n8n-workflow`
5. Select **`workflow-phase2-find_sellers.json`**
6. Click **Open**

#### **Method B: Import from Clipboard**

1. Open `workflow-phase2-find_sellers.json` in Notepad
2. Press **Ctrl+A** → **Ctrl+C** (copy all content)
3. In n8n, click **"⋮" menu** (top right)
4. Select **"Import from Clipboard..."**
5. Paste (Ctrl+V) the JSON
6. Click **Import**

---

### Step 3: Configure Firebase Credentials

**⚠️ IMPORTANT:** The workflow needs your Firebase credentials!

1. You'll see **red exclamation marks (!)** on Firebase nodes
2. **Click on "Query Growers" node**
3. Under **"Credential to connect with"**:
   - Click dropdown
   - Select **"- Create New Credential -"**
   
4. **Fill in:**
   - **Credential Name:** `Firebase MASH`
   - **Project ID:** `mash-ddf8d`
   - **Service Account:** (Paste your Firebase service account JSON)

5. **Getting Service Account JSON:**
   - Go to: https://console.firebase.google.com/project/mash-ddf8d/settings/serviceaccounts/adminsdk
   - Click **"Generate new private key"**
   - Open the downloaded `.json` file
   - Copy **ALL** content
   - Paste into n8n

6. Click **"Save"** (bottom of credential modal)

7. **Repeat for "Query Availability" node:**
   - Click "Query Availability" node
   - Under credentials, select **"Firebase MASH"** (the one you just created)

---

### Step 4: Activate Workflow

1. Click the **toggle switch** in top-right (should turn blue/green)
2. Workflow status changes to **"Active"**
3. Press **Ctrl+S** or click **Save**

---

### Step 5: Test the Workflow! 🧪

**Open PowerShell and run:**

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-006-n8n-workflow"
.\test-phase2.ps1
```

**Expected output:**
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
      "availableSlots": [...]
    }
  ]
}
```

---

## 📊 Understanding Each Node (Visual Tour)

### 1️⃣ **Webhook Node** (Receives Requests)
- **What it does:** Listens for POST requests from frontend
- **URL:** `http://localhost:5678/webhook/mash-appointments`
- **Receives:** `{ action: "find_sellers", productType: "Oyster", ... }`

### 2️⃣ **Switch Node** (Routes Actions)
- **What it does:** Checks `action` field and routes to correct path
- **5 routes:** find_sellers, get_availability, set_appointment, cancel_appointment, get_appointments

### 3️⃣ **Query Growers** (Firebase Read)
- **What it does:** Fetches all sellers from Firestore
- **Collection:** `growers`
- **Filter:** `role == "SELLER"`
- **Returns:** Array of seller documents

### 4️⃣ **Query Availability** (Firebase Read)
- **What it does:** Gets available time slots
- **Collection:** `availability_slots`
- **Filters:** 
  - `is_available == true`
  - `available_date >= today`
- **Returns:** Array of available slots

### 5️⃣ **Ollama AI Match** (AI Ranking)
- **What it does:** Uses local AI to rank sellers by relevance
- **URL:** `http://host.docker.internal:11434/api/generate`
- **Model:** Llama 3.2 (from AI-003)
- **Returns:** Top 3 seller IDs as JSON array

### 6️⃣ **Format Response** (JavaScript)
- **What it does:** Combines growers + slots + AI ranking
- **Output:** JSON with top 3 sellers + 3 time slots each
- **Returns to:** Frontend widget

---

## 🔧 Common Issues & Fixes

### ❌ "No credentials found"
**Fix:** Complete Step 3 above - add Firebase service account

### ❌ "Cannot connect to Firestore"
**Fix:** Check Firebase service account JSON is valid (should start with `{` and end with `}`)

### ❌ "Ollama connection failed"
**Fix:** Ensure Ollama is running:
```powershell
ollama serve
```

### ❌ "No sellers returned"
**Fix:** Growers collection is empty - need seed data:
```powershell
cd ai-automation-tasks/ai-005-firebase-collections
node seed-appointment-data.js
```

---

## 🎓 Learning Mode: Explore Each Node

**After importing, try this:**

1. **Click each node** and read its configuration
2. **Click "Test step"** on each node to see output
3. **Modify values** (e.g., change filter from "SELLER" to "BUYER")
4. **See what breaks** - best way to learn! 😊

---

## ✅ Success Checklist

- [ ] Workflow imported successfully
- [ ] Firebase credentials configured
- [ ] Workflow activated (toggle is ON)
- [ ] Test script ran without errors
- [ ] Received JSON with 3 sellers
- [ ] Each seller has availability slots

---

## 🚀 Next Steps

Once Phase 2 works:
1. **Phase 3:** Add `get_availability` action (20 min)
2. **Phase 4:** Add `set_appointment` action (50 min)
3. **Phase 5-8:** Remaining actions + error handling

**Or just tell me:** "Phase 2 works! Import file for Phase 3 please" 🎯

---

## 📝 Notes

- The workflow JSON is **version-controlled** - you can import it anytime
- If you mess up, just **delete and re-import**
- **Save often** (Ctrl+S) - n8n doesn't auto-save
- **Keep browser tab open** - closing it stops the webhook

---

**Ready?** Import the workflow and run `test-phase2.ps1`! 🚀
