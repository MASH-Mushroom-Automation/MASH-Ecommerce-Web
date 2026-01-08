# 🔍 AI-004 Complete Troubleshooting Guide

> **Last Updated:** January 9, 2026  
> **Issue:** "No sellers available" in appointment widget  
> **Status:** Fixed - useAppointments.ts updated to use `/api/appointments`

---

## 🎯 Expected Data Flow

### When Working Correctly:

```
1. User clicks "Book Meeting with Grower"
   ↓
2. Widget calls: fetch('/api/appointments', { action: 'find_sellers', ... })
   ↓
3. Next.js API route forwards to: http://localhost:5678/webhook/mash-appointments
   ↓
4. n8n workflow receives request
   ↓
5. Ollama AI analyzes request (Product type: "King Oyster", Location: "Manila")
   ↓
6. PostgreSQL query: SELECT * FROM growers WHERE specialty ILIKE '%King Oyster%'
   ↓
7. Returns 3 sellers (seller_001, seller_002, seller_003)
   ↓
8. Widget displays seller cards with available time slots
```

**⚠️ Common Failure Points:** Steps 5, 6, or 7

---

## ✅ STEP-BY-STEP DIAGNOSTIC

### Step 1: Verify All Services Running

Run this health check:

```powershell
# 1. Check Ollama
ollama list
# Expected: llama3.2 listed

# 2. Check n8n
Invoke-WebRequest -Uri "http://localhost:5678" -UseBasicParsing
# Expected: Status 200

# 3. Check Next.js
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
# Expected: Status 200
```

**Fix if failed:**
```powershell
# Start Ollama
ollama serve

# Start n8n (from Docker)
docker ps | findstr n8n
# If not running: cd ai-automation-tasks/ai-002-n8n-setup && docker-compose up -d

# Restart Next.js
# Press Ctrl+C in terminal, then: npm run dev
```

---

### Step 2: Test n8n Webhook Directly

```powershell
$body = @{
    action = "find_sellers"
    productType = "King Oyster"
    quantity = 5
    location = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "sellers": [
    {
      "seller_uid": "seller_001",
      "name": "Manila Urban Farm",
      "specialty": "Oyster Mushrooms, King Oyster",
      "location": "Manila, Philippines",
      "capacity_kg_per_week": 100
    },
    ...
  ]
}
```

**If Empty/Error:**
- ❌ Check n8n workflow is **ACTIVE** (green toggle)
- ❌ Check Ollama is running (`Get-Process ollama`)
- ❌ Check PostgreSQL connection in n8n credential

---

### Step 3: Verify Database Has Sellers

Open Neon SQL Editor: https://console.neon.tech

```sql
SELECT 
  user_uid,
  name,
  specialty,
  location,
  role
FROM growers
WHERE role = 'SELLER';
```

**Expected:** 3 rows returned

**If 0 rows:**
Run this to add sellers:
```sql
INSERT INTO growers (user_uid, name, email, phone, specialty, location, capacity_kg_per_week, role)
VALUES
  ('seller_001', 'Manila Urban Farm', 'manila@farm.com', '+639123456789', 
   'Oyster Mushrooms, King Oyster', 'Manila, Philippines', 100, 'SELLER'),
  ('seller_002', 'Quezon City Growers', 'qc@growers.com', '+639987654321',
   'Shiitake, Lion''s Mane', 'Quezon City, Philippines', 80, 'SELLER'),
  ('seller_003', 'Makati Mushroom Co', 'makati@mush.com', '+639111222333',
   'All Mushroom Types', 'Makati, Philippines', 150, 'SELLER');
```

---

### Step 4: Test Next.js API Route

```powershell
$body = @{
    action = "find_sellers"
    productType = "King Oyster"
    quantity = 5
    buyerLocation = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

**Expected:** Same sellers response as Step 2

**If 404 Error:**
- File missing: `src/app/api/appointments/route.ts` ✅ (We created this)
- Server not restarted ⚠️ **RESTART REQUIRED**

**If Connection Closed:**
- Next.js crashed - check terminal for errors
- Restart: Ctrl+C → `npm run dev`

---

### Step 5: Check Browser Console

1. Open: http://localhost:3000/product/fresh-king-oyster-mushrooms
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Click "Book Meeting with Grower"
5. Watch for:
   - ✅ `📤 Forwarding to n8n: { action: "find_sellers", ... }`
   - ✅ `📥 n8n response: { sellers: [...] }`
   - ❌ Red errors about CORS, 404, network

**Common Console Errors:**

| Error | Fix |
|-------|-----|
| `Failed to fetch` | Check n8n is running on port 5678 |
| `CORS policy` | useAppointments.ts calling n8n directly (fixed) |
| `404 /api/appointments` | API route missing or server not restarted |
| `TypeError: sellers is undefined` | Hook not updating state correctly |

---

### Step 6: Verify File Changes Applied

**Critical Fix:** `src/hooks/useAppointments.ts` must call `/api/appointments`, NOT n8n directly.

Check line 13:
```typescript
const API_URL = "/api/appointments"; // ✅ CORRECT

// ❌ WRONG (old version):
// const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/mash-appointments";
```

**If still wrong:** Re-apply fix:
```typescript
// Replace all 3 fetch calls to use API_URL instead of N8N_WEBHOOK_URL
fetch(API_URL, { ... })  // ✅ Correct
fetch(N8N_WEBHOOK_URL, { ... })  // ❌ Wrong
```

---

## 🚀 RESTART CHECKLIST

After making ANY code changes, you MUST restart:

```powershell
# In terminal running Next.js:
# 1. Press Ctrl+C
# 2. Wait for "Gracefully stopping..."
# 3. Run:
npm run dev

# 4. Wait for:
# ✓ Ready in 2.5s
# ○ Local: http://localhost:3000
```

**Do NOT proceed to testing until you see "Ready in X seconds"**

---

## 🧪 COMPLETE TEST FLOW

### Test 1: Widget Opens
1. Go to: http://localhost:3000/product/fresh-king-oyster-mushrooms
2. Scroll to "Book Meeting with Grower" button
3. Click button
4. **Expected:** Modal opens with "Finding sellers..." message

### Test 2: Sellers Load
1. Wait 2-3 seconds
2. **Expected:** 3 seller cards appear with:
   - Seller name (e.g., "Manila Urban Farm")
   - Specialties badges (e.g., "Oyster Mushrooms")
   - Location (e.g., "Manila, Philippines")
   - Capacity (e.g., "100kg/week")
   - "View Available Slots" button

### Test 3: Time Slots Load
1. Click "View Available Slots" on any seller
2. **Expected:** 
   - Calendar appears with next 7 days
   - Green highlighted dates (has availability)
   - Gray dates (no slots)
3. Click a green date
4. **Expected:** Time slots appear on right (e.g., "08:00 - 08:15", "08:15 - 08:30")

### Test 4: Book Appointment
1. Click a time slot
2. Click "Next" or "Confirm" button
3. Fill in:
   - Quantity: 5
   - Special requests: "Please call before arriving"
4. Click "Confirm Appointment"
5. **Expected:** 
   - Success message: "Appointment Confirmed! 🎉"
   - Email confirmation notice
   - "Done" button

---

## 🐛 KNOWN ISSUES & FIXES

### Issue 1: "No sellers available"
**Symptoms:** Widget shows message, no cards
**Root Cause:** Hook calling n8n directly (CORS blocked) OR n8n returning empty
**Fix:** ✅ Applied - useAppointments.ts updated to use `/api/appointments`
**Verify:**
```powershell
# Check hook uses API_URL:
Get-Content src/hooks/useAppointments.ts | Select-String "API_URL"
# Should show: const API_URL = "/api/appointments";
```

---

### Issue 2: Widget freezes on "Finding sellers..."
**Symptoms:** Loading spinner never stops
**Root Cause:** API call failing silently
**Fix:**
1. Open browser console (F12)
2. Look for network errors
3. Check Next.js terminal for errors
4. Verify n8n workflow is ACTIVE (green toggle)

---

### Issue 3: Type errors in console
**Symptoms:** `Seller.specialty is not iterable` or similar
**Root Cause:** Database field names don't match TypeScript types
**Fix:** Use correct field mapping:
```typescript
// Database uses:
specialty: "Oyster Mushrooms, King Oyster" (string)

// Widget expects:
specialty: ["Oyster", "King Oyster"] (array)

// Fix in API or n8n workflow:
specialty.split(", ")
```

---

### Issue 4: "Connection closed unexpectedly"
**Symptoms:** API returns 500, connection reset
**Root Cause:** Next.js dev server crashed
**Fix:**
1. Check terminal for error stack trace
2. Common causes:
   - Missing import
   - Syntax error in route.ts
   - TypeScript type mismatch
3. Fix error, restart: `npm run dev`

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before marking AI-004 as complete:

- [ ] n8n workflow active and responding
- [ ] Database has 3 sellers with 672 time slots
- [ ] API route `/api/appointments` returns sellers
- [ ] Widget displays 3 seller cards
- [ ] Time slots load when clicking "View Available Slots"
- [ ] Booking creates appointment in database
- [ ] Success message displays after booking
- [ ] No console errors (F12)
- [ ] No Next.js terminal errors
- [ ] Mobile responsive (test on small screen)
- [ ] Keyboard navigation works (Tab through buttons)

---

## 🎯 NEXT STEPS AFTER FIXING

Once widget shows sellers:

### Short-term (This Session):
1. Test full booking flow (seller → slot → confirm → success)
2. Verify appointment created in database
3. Check slot marked as unavailable after booking
4. Test error states (no auth, booking failure)

### Medium-term (Next Session):
5. Add appointment management dashboard (AI-010)
6. Email notifications (AI-011)
7. Seller availability calendar (AI-012)
8. Analytics tracking

### Long-term (Future):
9. SMS notifications
10. Calendar sync (Google/Outlook)
11. Video call integration
12. Review system after appointments

---

## 📞 Emergency Contact

**If still stuck after all steps:**

1. Check GitHub Issues: https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues
2. Review conversation history for context
3. Run health check script:
   ```powershell
   .\ai-automation-tasks\ai-007-postgresql-n8n\check-health.ps1
   ```
4. Export n8n workflow logs (Settings → Executions)
5. Check Neon PostgreSQL logs (Monitoring tab)

---

## ✅ SUCCESS CRITERIA

**Widget is working when:**
- ✅ 3 sellers display with correct names
- ✅ Time slots load within 2 seconds
- ✅ Booking completes without errors
- ✅ Confirmation email sent
- ✅ Database updated correctly
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Accessible (keyboard navigation)

**🎉 Congratulations! AI-004 Complete!**
