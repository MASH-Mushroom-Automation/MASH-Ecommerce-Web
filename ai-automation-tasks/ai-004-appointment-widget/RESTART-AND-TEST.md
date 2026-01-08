# 🚀 RESTART AND TEST - Do This NOW

> **Time:** 5 minutes  
> **Goal:** Get widget showing sellers  
> **Status:** Code fixed, needs restart

---

## ⚡ QUICK START (30 seconds)

### 1. Restart Next.js Dev Server

In your terminal where `npm run dev` is running:

```powershell
# Press Ctrl+C
# Wait for "Gracefully stopping..."
# Then run:
npm run dev
```

**Wait for:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

### 2. Open Product Page

```
http://localhost:3000/product/fresh-king-oyster-mushrooms
```

### 3. Click Widget Button

Look for: **"📅 Book Meeting with Grower"**

### 4. Check Results

**✅ SUCCESS:** 3 seller cards appear  
**❌ STILL FAILING:** See "If Still Not Working" below

---

## 🔍 If Still Not Working

### Option A: Check Browser Console

1. Press **F12**
2. Click **Console** tab
3. Click widget button again
4. Look for errors (red text)

**Common errors:**
- `404 /api/appointments` → Server not restarted properly
- `Failed to fetch` → n8n not running
- `CORS policy` → File changes not applied

### Option B: Test API Directly

Run in PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method POST -Body '{"action":"find_sellers","productType":"King Oyster","quantity":5,"buyerLocation":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Expected:** JSON with `sellers` array containing 3 sellers

**If error:** 
- "Connection closed" → Restart server again
- "404" → API route file missing
- "500" → Check Next.js terminal for errors

### Option C: Verify Services Running

```powershell
# 1. Check n8n
Invoke-WebRequest -Uri "http://localhost:5678" -UseBasicParsing
# Expected: StatusCode 200

# 2. Check Ollama
ollama list
# Expected: llama3.2 listed

# 3. Check Next.js
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
# Expected: StatusCode 200
```

**If any fail:**
```powershell
# Start n8n
cd ai-automation-tasks/ai-002-n8n-setup
docker-compose up -d

# Start Ollama
ollama serve

# Restart Next.js
npm run dev
```

---

## 📊 What Was Fixed

### Before (Broken):
```typescript
// src/hooks/useAppointments.ts
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/mash-appointments";
fetch(N8N_WEBHOOK_URL, ...) // ❌ CORS error
```

### After (Fixed):
```typescript
// src/hooks/useAppointments.ts
const API_URL = "/api/appointments";
fetch(API_URL, ...) // ✅ Works correctly
```

**Why this matters:**
- Frontend can't call external URLs directly (CORS policy)
- Must go through Next.js API route (/api/appointments)
- API route forwards to n8n webhook
- This is the correct architecture

---

## 🎯 Expected Behavior

### Step 1: Widget Opens
- Loading spinner appears
- Message: "Finding sellers..."

### Step 2: Sellers Load (2-3 seconds)
3 cards appear:

```
┌────────────────────────────────┐
│ Manila Urban Farm              │
│ 📍 Manila, Philippines         │
│ Oyster Mushrooms, King Oyster  │
│ Capacity: 100kg/week           │
│ [View Available Slots]         │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Quezon City Growers            │
│ 📍 Quezon City, Philippines    │
│ Shiitake, Lion's Mane          │
│ Capacity: 80kg/week            │
│ [View Available Slots]         │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Makati Mushroom Co             │
│ 📍 Makati, Philippines         │
│ All Mushroom Types             │
│ Capacity: 150kg/week           │
│ [View Available Slots]         │
└────────────────────────────────┘
```

### Step 3: Click "View Available Slots"
- Calendar appears (next 7 days)
- Time slots list on right
- 15-minute intervals (08:00-08:15, 08:15-08:30, etc.)

### Step 4: Select Slot → Confirm → Success!
- Confirmation screen
- Appointment details
- Email sent notification

---

## 🆘 Still Stuck?

Run full diagnostic:

```powershell
# Navigate to project root
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Run health check
.\ai-automation-tasks\ai-007-postgresql-n8n\check-health.ps1

# Check file exists
Test-Path .\src\app\api\appointments\route.ts
# Should return: True

# Check hook was updated
Get-Content .\src\hooks\useAppointments.ts | Select-String "API_URL"
# Should show: const API_URL = "/api/appointments";
```

**If all pass but still failing:**
- Open [TROUBLESHOOTING-COMPLETE.md](./TROUBLESHOOTING-COMPLETE.md)
- Follow Step 5: Check Browser Console
- Copy error message for further debugging

---

## ✅ Success Indicators

**You're good when:**
1. ✅ Server restarted without errors
2. ✅ Page loads at localhost:3000
3. ✅ Widget button visible on product page
4. ✅ Modal opens when clicked
5. ✅ 3 seller cards appear
6. ✅ No red errors in browser console (F12)

**🎉 Once working, proceed to full booking test!**

---

## 📝 Next Actions

After sellers display correctly:

1. ✅ Test time slot selection
2. ✅ Test full booking flow
3. ✅ Verify database appointment created
4. ✅ Check email notification sent
5. 📝 Document any remaining issues
6. 🚀 Move to AI-010 (Seller Dashboard)

**Current Status:** AI-004 ~95% Complete  
**Remaining:** Full end-to-end testing + edge cases
