# 🚨 CRITICAL FIX - Widget 500 Error Resolved

**Date:** January 9, 2026  
**Issue:** API route missing imports causing 500 errors  
**Status:** ✅ FIXED - Ready to test

---

## ✅ What Was Fixed

### Issue 1: Missing Imports in API Route

**File:** `src/app/api/appointments/route.ts`  
**Problem:** Missing `NextRequest` and `NextResponse` imports  
**Symptom:** 500 Internal Server Error, "Connection closed unexpectedly"

**Fix Applied:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/mash-appointments';

export async function POST(req: NextRequest) {
  // ... rest of code
}
```

---

## 🚀 IMMEDIATE ACTION REQUIRED

### Step 1: Restart Next.js Dev Server (30 seconds)

**CRITICAL:** Code changes won't apply until you restart!

```powershell
# In your terminal running npm run dev:
# Press Ctrl+C to stop the server

# Wait for "Gracefully stopping..." message

# Restart:
npm run dev

# Wait for this message:
# ✓ Ready in X.Xs
```

### Step 2: Verify All Services Running (1 minute)

Open **PowerShell** and run:

```powershell
# Check Ollama
ollama list
# Should show: llama3.2:latest

# Check n8n
docker ps | findstr n8n
# Should show: n8n container running

# Check Next.js
curl http://localhost:3000
# Should return HTML
```

**If any service is NOT running:**

```powershell
# Start Ollama
ollama serve

# Start n8n
cd ai-automation-tasks/ai-002-n8n-setup
docker-compose up -d

# Verify n8n webhook
curl http://localhost:5678/webhook/mash-appointments
```

### Step 3: Test Widget (2 minutes)

1. **Open product page:**
   ```
   http://localhost:3000/product/fresh-king-oyster-mushrooms
   ```

2. **Click button:** "📅 Book Meeting with Grower"

3. **Expected Result:**
   ```
   ✅ 3 seller cards appear:
      - Manila Urban Farm
      - Quezon City Growers  
      - Makati Mushroom Co
   ```

4. **If it works:**
   - ✅ Click "View Available Slots" on a seller
   - ✅ Verify calendar shows next 7 days
   - ✅ Select a time slot
   - ✅ Fill booking form
   - ✅ Confirm appointment

---

## 🔍 If Still Failing - Diagnostic Tests

### Test 1: Check API Route Directly

```powershell
# Test Next.js API endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method POST -Body '{"action":"find_sellers","productType":"King Oyster","quantity":5,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "sellers": [
    {
      "seller_uid": "seller_001",
      "name": "Manila Urban Farm",
      "specialty": "Oyster Mushrooms, King Oyster",
      "location": "Manila, Philippines",
      "role": "SELLER"
    },
    // ... 2 more sellers
  ]
}
```

**❌ If you get 404:**
- Server not restarted yet
- Run: `Ctrl+C` then `npm run dev`

**❌ If you get 500:**
- Open browser console (F12)
- Look for detailed error message
- Check: n8n is running (`curl http://localhost:5678`)

**❌ If you get "Connection closed":**
- Next.js crashed during request
- Check terminal for error stack trace
- Verify n8n webhook is responding

### Test 2: Test n8n Webhook Directly

```powershell
# Bypass Next.js, test n8n directly
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"find_sellers","productType":"King Oyster","quantity":5,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
```

**Expected:** Same JSON response with 3 sellers

**❌ If fails:** n8n workflow issue
- Open: http://localhost:5678
- Check workflow "MASH Appointment System - PostgreSQL" is **ACTIVE** (green toggle)
- Click workflow → Click "Test Workflow" button
- Check execution logs for errors

### Test 3: Verify Database

```sql
-- Run in Neon SQL Editor: https://console.neon.tech
SELECT 
  seller_uid,
  name,
  specialty,
  location,
  role
FROM growers
WHERE role = 'SELLER';

-- Expected: 3 rows
```

**❌ If 0 rows:** Database not seeded
- Run: `ai-automation-tasks/ai-007-postgresql-n8n/01-setup-database.sql`

---

## 📊 Expected Data Flow (10 Steps)

```
✅ 1. User clicks "Book Meeting with Grower"
        ↓
✅ 2. Widget (AppointmentWidget.tsx) calls useAppointments hook
        ↓
✅ 3. Hook calls: fetch('/api/appointments', { action: 'find_sellers', ... })
        ↓
✅ 4. API route (route.ts) receives request
        ↓ [FIXED: Added missing imports here]
✅ 5. API forwards to: http://localhost:5678/webhook/mash-appointments
        ↓
✅ 6. n8n webhook receives request
        ↓
✅ 7. n8n calls Ollama AI for seller matching
        ↓
✅ 8. Ollama analyzes: "King Oyster" + "Manila" + "5kg"
        ↓
✅ 9. n8n queries PostgreSQL: SELECT * FROM growers WHERE specialty ILIKE '%King Oyster%'
        ↓
✅ 10. Returns 3 sellers → Widget displays cards
```

**Where it was failing:** Step 4-5 (API route crash due to missing imports)

---

## 🎯 Success Checklist

After restarting server, verify:

- [ ] **Widget opens** when clicking "Book Meeting with Grower"
- [ ] **3 seller cards** appear (not "No sellers available")
- [ ] **Each card shows:** Name, Specialty, Location, "View Available Slots" button
- [ ] **Click "View Available Slots"** opens calendar
- [ ] **Calendar shows** next 7 days with available dates
- [ ] **Time slots display** in 15-minute intervals (8am-4pm)
- [ ] **Select slot** highlights it in green
- [ ] **"Continue to Booking"** button enabled
- [ ] **Booking form** appears with fields: Name, Phone, Quantity, Notes
- [ ] **"Confirm Booking"** creates appointment
- [ ] **Success message** displays with appointment ID
- [ ] **Browser console** (F12) shows no errors

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| **404 Not Found** | API route not registered | Restart: `Ctrl+C` → `npm run dev` |
| **500 Internal Server Error** | Missing imports (FIXED) | Already fixed, just restart server |
| **Connection closed** | Server crashed mid-request | Check n8n is running: `docker ps` |
| **CORS error** | Direct n8n call from browser | Already fixed (using API route) |
| **Empty sellers array** | Database has no sellers | Run: `01-setup-database.sql` |
| **n8n timeout** | Ollama not running | Run: `ollama serve` |
| **"No slots available"** | Wrong date range | Check `available_date` in database |

---

## 📖 Related Documentation

| Document | Purpose |
|----------|---------|
| [RESTART-AND-TEST.md](./RESTART-AND-TEST.md) | Quick restart guide |
| [TROUBLESHOOTING-COMPLETE.md](./TROUBLESHOOTING-COMPLETE.md) | Deep diagnostic (8 tests) |
| [START-HERE.md](./START-HERE.md) | Navigation hub |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Complete architecture |

---

## ⚡ Quick Commands Reference

```powershell
# Restart Next.js
Ctrl+C
npm run dev

# Check Ollama
ollama list
ollama serve

# Check n8n
docker ps | findstr n8n
docker-compose up -d

# Test API
curl http://localhost:3000/api/appointments

# Test n8n
curl http://localhost:5678/webhook/mash-appointments

# View logs
# (Terminal running npm run dev shows all requests)
```

---

## 🎉 EXPECTED SUCCESS STATE

After restart, you should see:

```
Browser: http://localhost:3000/product/fresh-king-oyster-mushrooms
  ↓
Click: "📅 Book Meeting with Grower"
  ↓
Widget shows:
╔═══════════════════════════════════════════════════════════╗
║  Meet Your Perfect Mushroom Supplier                      ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  📍 Manila Urban Farm                                     ║
║  🍄 Oyster Mushrooms, King Oyster                         ║
║  📦 50 kg/week capacity                                   ║
║  [View Available Slots]                                   ║
║                                                           ║
║  📍 Quezon City Growers                                   ║
║  🍄 Shiitake, Lion's Mane                                 ║
║  📦 75 kg/week capacity                                   ║
║  [View Available Slots]                                   ║
║                                                           ║
║  📍 Makati Mushroom Co                                    ║
║  🍄 All Mushroom Types                                    ║
║  📦 100 kg/week capacity                                  ║
║  [View Available Slots]                                   ║
╚═══════════════════════════════════════════════════════════╝
```

**No more "No sellers available" message!** 🎉

---

## 🚦 Next Steps After Success

1. **Test full booking flow:**
   - Select seller → Choose slot → Fill form → Confirm
   - Verify success message appears
   - Check database: `SELECT * FROM appointments ORDER BY created_at DESC LIMIT 1;`

2. **Test edge cases:**
   - Try booking without login (should redirect)
   - Try different product types (Shiitake, Lion's Mane)
   - Test on mobile (resize browser to 375px)
   - Check console for any warnings

3. **Mark AI-004 complete:**
   - Update: `PROGRESS.md` with test results
   - Create PR: See `PR-GUIDE.md`
   - Move to AI-010: Seller Dashboard

---

## ❓ Need Help?

**Widget still not working?**
1. Read: [TROUBLESHOOTING-COMPLETE.md](./TROUBLESHOOTING-COMPLETE.md) (8-step diagnostic)
2. Check: Browser console (F12) for JavaScript errors
3. Verify: All services running (Ollama + n8n + Next.js)
4. Test: n8n webhook directly (bypass Next.js)

**Database issues?**
1. Verify: 3 sellers exist in `growers` table
2. Check: 672 slots in `availability_slots` table
3. Confirm: Connection string in n8n PostgreSQL credential

**n8n not responding?**
1. Check: `docker ps` shows n8n container running
2. Verify: http://localhost:5678 opens n8n UI
3. Test: Workflow execution in n8n UI
4. Review: n8n logs: `docker logs n8n`

---

**Your immediate action:** Restart Next.js server now! (`Ctrl+C` → `npm run dev`)
