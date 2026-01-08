# 🚀 DO THIS NOW - Step-by-Step Execution Plan

**Your Current Status:** Database setup done, got 168 slots instead of 672  
**Time to Complete:** 20 minutes total

---

## 🎯 STEP 1: Fix Database Slots (3 minutes) ⚠️ CRITICAL

### Problem:
You have 168 slots, need 672 slots

### Solution:
Copy this EXACT query and run it in Neon SQL Editor:

```sql
-- Step 1: Delete old slots (168 slots)
DELETE FROM availability_slots;

-- Step 2: Generate 672 new slots (3 sellers × 7 days × 32 time slots)
-- 32 slots per day = 8am-4pm in 15-minute intervals
INSERT INTO availability_slots (seller_uid, available_date, start_time, end_time, duration_minutes, is_available)
SELECT 
  seller_uid,
  (CURRENT_DATE + d.day) AS available_date,
  (TIME '08:00:00' + (slot * INTERVAL '15 minutes')) AS start_time,
  (TIME '08:00:00' + ((slot + 1) * INTERVAL '15 minutes')) AS end_time,
  15,
  TRUE
FROM (VALUES ('seller_001'), ('seller_002'), ('seller_003')) AS s(seller_uid)
CROSS JOIN generate_series(0, 6) AS d(day)
CROSS JOIN generate_series(0, 31) AS slot;

-- Step 3: Verify
SELECT 'Growers:' as table_name, COUNT(*) as row_count FROM growers
UNION ALL
SELECT 'Availability Slots:', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM appointments;
```

### How to Run:

1. Open Neon Console: https://console.neon.tech
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the ENTIRE query above
5. Paste into editor
6. Click **Run** button (green play icon ▶️)

### Expected Output:
```
Growers:            3
Availability Slots: 672  ← Should now show 672!
Appointments:       2
```

✅ **Once you see 672, move to Step 2**

---

## 🎯 STEP 2: Start Ollama Service (1 minute)

### Open PowerShell Terminal

1. Press **Windows Key**
2. Type: **PowerShell**
3. Right-click → **Run as Administrator**

### Start Ollama

```powershell
# Start Ollama server
ollama serve
```

**Expected Output:**
```
Ollama is running on http://localhost:11434
```

⚠️ **LEAVE THIS TERMINAL OPEN!** Don't close it. Ollama must stay running.

### Verify Model is Downloaded (Open NEW Terminal)

```powershell
# Open a NEW PowerShell window (don't close the first one)
ollama list
```

**Expected Output:**
```
NAME                ID              SIZE
llama3.2:latest     a80c4f17a... 2.0GB
```

**If llama3.2 is MISSING**, run this:
```powershell
ollama pull llama3.2:latest
```

Wait 2-3 minutes for download to complete.

✅ **Once Ollama is running and model is downloaded, move to Step 3**

---

## 🎯 STEP 3: Fix n8n Workflow (10 minutes)

### 3.1 Open n8n

1. Open browser
2. Go to: **http://localhost:5678**
3. Login if needed

### 3.2 Import Workflow (if not already done)

**If you DON'T see "MASH Appointment System" workflow:**

1. Click **Workflows** (left sidebar)
2. Click **+ Add Workflow** (top right)
3. Click **3-dot menu** (⋮) next to workflow name
4. Select **Import from File...**
5. Navigate to: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-007-postgresql-n8n`
6. Select: **workflow-neon-complete.json**
7. Click **Open**

You should now see 30+ nodes on the canvas.

---

### 3.3 Create PostgreSQL Credential

1. Click **Settings** (⚙️ bottom left corner)
2. Click **Credentials** tab
3. Click **+ Add Credential** button
4. In search box, type: **postgres**
5. Click: **Postgres account**

### 3.4 Fill Credential Form (COPY EXACTLY)

```
Name: Neon PostgreSQL - MASH
Host: ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech
Database: Namias
User: Namias_owner
Password: SyuJeBKs09iN
Port: 5432
```

**CRITICAL:** Scroll down to SSL section:

```
SSL: ✅ CHECK THIS BOX!  ← MUST BE CHECKED!
SSL Mode: require
```

### 3.5 Test Credential

1. Click **Test** button (bottom of form)
2. **Expected:** Green checkmark ✅ "Connection successful"
3. If you get an error, verify SSL is CHECKED
4. Click **Save**

---

### 3.6 Configure Ollama Chat Model Nodes (5 nodes)

**For EACH of these 5 nodes:**

1. **AI Seller Matching Agent** (find_sellers branch)
2. **AI Availability Agent** (get_availability branch)
3. **AI Booking Agent** (set_appointment branch)
4. **AI Query Agent** (get_appointments branch)
5. **AI Cancel Agent** (cancel_appointment branch)

**Do this for EACH node:**

1. Click on the node
2. In right panel, find these fields:
   - **Model**: `llama3.2:latest`
   - **Base URL**: `http://localhost:11434`
   - **Temperature**: `0`
3. Click **Save** (bottom right)

Move to next node and repeat.

---

### 3.7 Link PostgreSQL Credential to Nodes (10 nodes)

**For EACH of these 10 PostgreSQL nodes:**

1. Query Growers
2. Get Seller Available Slots
3. Query Availability Slots
4. Check Slot Available
5. Create Appointment
6. Mark Slot as Booked
7. Get Appointment
8. Cancel Appointment
9. Release Slot
10. Query Appointments

**Do this for EACH node:**

1. Click on the PostgreSQL node
2. In right panel, find **Credential for Postgres** dropdown
3. Click dropdown → Select: **Neon PostgreSQL - MASH**
4. Move to next PostgreSQL node and repeat

---

### 3.8 Activate Workflow

1. Click workflow name at top (default: "My workflow")
2. Rename to: **MASH Appointments - PostgreSQL**
3. Press **Ctrl+S** to save
4. Toggle **Active** switch (top right) to **ON** (green)
5. Wait 2-3 seconds for activation

**Expected:** Green indicator says "Active"

✅ **Once workflow is active, move to Step 4**

---

## 🎯 STEP 4: Run Tests (2 minutes)

### Open PowerShell in Workflow Folder

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-007-postgresql-n8n"
```

### Run Test Suite

```powershell
.\test-neon-workflow.ps1
```

### Expected Output:

```
🧪 MASH PostgreSQL Appointment System - Test Suite
=================================================

🔍 Checking n8n server health...
✅ n8n server is running

🧪 Test 1: Find Sellers (AI matching)
Request: Find sellers for Oyster Mushroom, 10kg, Manila
✅ PASS - Found 3 sellers

🧪 Test 2: Get Availability
Request: Get available slots for seller_001 on 2026-01-15
✅ PASS - Found 32 available slots

🧪 Test 3: Set Appointment
Request: Create appointment for test user
✅ PASS - Appointment created

🧪 Test 4: Get Appointments
Request: Get all appointments for buyer_test_999
✅ PASS - Found 1 appointment

🧪 Test 5: Cancel Appointment
Request: Cancel appointment
✅ PASS - Appointment cancelled

=================================================
🎉 Test Suite Complete!
=================================================

  ✅ Test 1: Find Sellers (AI matching)
  ✅ Test 2: Get Availability (Query slots)
  ✅ Test 3: Set Appointment (Create booking)
  ✅ Test 4: Get Appointments (History)
  ✅ Test 5: Cancel Appointment (Release slot)

All tests passed! 🚀
```

---

## ✅ SUCCESS CRITERIA

You're done when ALL these are ✅:

```
☐ Database shows 672 availability slots
☐ Ollama service running (terminal shows "Ollama is running")
☐ llama3.2:latest model downloaded
☐ n8n workflow active (green toggle)
☐ PostgreSQL credential saved and tested (green ✅)
☐ All 5 Ollama nodes configured (Base URL: localhost:11434)
☐ All 10 PostgreSQL nodes linked to credential
☐ Test script shows 5/5 tests PASS
```

---

## ❌ TROUBLESHOOTING

### Issue: "Ollama is not running"

**Fix:**
```powershell
ollama serve
```
Leave terminal open!

---

### Issue: "SSL required" error

**Fix:**
1. Go to n8n → Settings → Credentials
2. Edit "Neon PostgreSQL - MASH"
3. ✅ CHECK the SSL checkbox
4. SSL Mode: require
5. Save

---

### Issue: "Model not found: llama3.2"

**Fix:**
```powershell
ollama pull llama3.2:latest
```

---

### Issue: "Connection refused (localhost:11434)"

**Fix:**
1. Verify Ollama is running: `Get-Process ollama`
2. If not running, start it: `ollama serve`
3. In n8n, check Ollama nodes have Base URL: `http://localhost:11434`

---

### Issue: Test script fails with "Timeout"

**Fix:**
1. Ollama might be slow on first run (loading model into memory)
2. Wait 30 seconds, try again
3. Or use smaller model:
   ```powershell
   ollama pull llama3.2:1b
   ```
   Then update n8n nodes to use `llama3.2:1b`

---

### Issue: Workflow won't activate

**Fix - Check ALL these:**
1. ✅ Ollama running (`ollama serve` in terminal)
2. ✅ PostgreSQL credential tested successfully
3. ✅ All Ollama nodes configured (Base URL filled)
4. ✅ All PostgreSQL nodes have credential selected
5. ✅ Workflow saved (Ctrl+S)

Then try activating again.

---

## 📞 NEED HELP?

### Quick Health Check Script

Save this as `check-health.ps1`:

```powershell
Write-Host "🔍 System Health Check" -ForegroundColor Cyan
Write-Host ""

# 1. Ollama
Write-Host "1. Checking Ollama..." -ForegroundColor Yellow
try {
    $ollama = Invoke-RestMethod -Uri "http://localhost:11434" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Ollama running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ollama NOT running - Run: ollama serve" -ForegroundColor Red
}

# 2. n8n
Write-Host "2. Checking n8n..." -ForegroundColor Yellow
try {
    $n8n = Invoke-RestMethod -Uri "http://localhost:5678" -Method GET -TimeoutSec 5
    Write-Host "   ✅ n8n running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ n8n NOT running" -ForegroundColor Red
}

# 3. Model
Write-Host "3. Checking Ollama models..." -ForegroundColor Yellow
$models = ollama list 2>$null
if ($models -match "llama3.2") {
    Write-Host "   ✅ llama3.2 installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ llama3.2 missing - Run: ollama pull llama3.2:latest" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ = Ready | ❌ = Fix needed" -ForegroundColor Cyan
```

Run it:
```powershell
.\check-health.ps1
```

---

## 🎉 WHAT'S NEXT?

Once all tests pass:

1. **Frontend Integration** - Add AppointmentWidget to Next.js product pages
2. **Seller Dashboard** - Create availability management UI
3. **Email Notifications** - Set up appointment confirmations
4. **Production Deployment** - Deploy n8n to cloud (Railway, Render, etc.)

---

**Created:** January 9, 2026  
**Total Time:** 20 minutes  
**Difficulty:** Easy (just follow steps)
