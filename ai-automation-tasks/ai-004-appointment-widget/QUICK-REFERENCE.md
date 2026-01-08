# 🎯 AI-004 Quick Reference Card

> Print this out or keep it open while testing!

---

## ✅ FILES FIXED (Jan 9, 2026)

```
✅ src/types/appointments.ts                 (Created)
✅ src/app/api/appointments/route.ts         (Created)  
✅ src/components/appointments/TimeSlotPicker.tsx  (Created)
✅ src/hooks/useAppointments.ts              (Updated - CORS fix)
```

---

## 🚀 RESTART STEPS (30 seconds)

```powershell
# In terminal running Next.js:
Ctrl+C
npm run dev
# Wait for "✓ Ready in X seconds"
```

---

## 🧪 TEST STEPS (2 minutes)

1. **Open:** http://localhost:3000/product/fresh-king-oyster-mushrooms
2. **Find:** "📅 Book Meeting with Grower" button
3. **Click:** Button
4. **Wait:** 2-3 seconds
5. **See:** 3 seller cards appear ✅

---

## ❌ IF FAILED → RUN THIS

```powershell
# 1. Check services
ollama list                              # Should show llama3.2
docker ps | findstr n8n                  # Should show container
Invoke-WebRequest -Uri "http://localhost:3000"  # Should work

# 2. Test n8n directly
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"find_sellers","productType":"King Oyster","quantity":5,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
# Should return: sellers array

# 3. Test API route
Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method POST -Body '{"action":"find_sellers","productType":"King Oyster","quantity":5,"buyerLocation":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
# Should return: sellers array

# 4. Check browser console
F12 → Console tab → Look for red errors
```

---

## 📖 FULL DOCS

| Guide | When to Use |
|-------|-------------|
| **RESTART-AND-TEST.md** | Quick 5-min fix |
| **TROUBLESHOOTING-COMPLETE.md** | Deep debugging |
| **IMPLEMENTATION_SUMMARY.md** | Architecture details |
| **START-HERE.md** | Navigation hub |

---

## 🎯 SUCCESS LOOKS LIKE

```
Modal Opens:
┌──────────────────────────────────────────┐
│ Meet Your Perfect Mushroom Supplier     │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Manila Urban Farm          SELLER  │  │
│ │ 📍 Manila, Philippines             │  │
│ │ Oyster Mushrooms, King Oyster      │  │
│ │ Capacity: 100kg/week               │  │
│ │ [View Available Slots]             │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Quezon City Growers        SELLER  │  │
│ │ 📍 Quezon City, Philippines        │  │
│ │ Shiitake, Lion's Mane              │  │
│ │ Capacity: 80kg/week                │  │
│ │ [View Available Slots]             │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Makati Mushroom Co         SELLER  │  │
│ │ 📍 Makati, Philippines             │  │
│ │ All Mushroom Types                 │  │
│ │ Capacity: 150kg/week               │  │
│ │ [View Available Slots]             │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 🔥 EMERGENCY FIXES

### "Connection closed unexpectedly"
```powershell
# Restart Next.js
Ctrl+C
npm run dev
```

### "404 /api/appointments"
```powershell
# Verify file exists
Test-Path src\app\api\appointments\route.ts
# Should return: True
# If False: File missing - re-create from DO-THIS-NOW.md
```

### "No sellers available"
```powershell
# Check hook uses API route
Get-Content src\hooks\useAppointments.ts | Select-String "API_URL"
# Should show: const API_URL = "/api/appointments";
# If shows N8N_WEBHOOK_URL: Re-apply fix from DO-THIS-NOW.md
```

### "CORS policy error"
```powershell
# Hook calling n8n directly (wrong!)
# Fix already applied - just restart server
npm run dev
```

---

## ✅ CHECKLIST

- [ ] Server restarted
- [ ] Ollama running (`ollama list`)
- [ ] n8n running (`docker ps`)
- [ ] Page loads (localhost:3000)
- [ ] Widget button visible
- [ ] Modal opens on click
- [ ] Sellers appear (3 cards)
- [ ] No console errors (F12)

**All checked? → AI-004 Working! 🎉**

---

## 📞 NEXT STEPS

After sellers display:
1. ✅ Test time slot selection
2. ✅ Test booking flow
3. ✅ Verify database records
4. ✅ Test mobile responsive
5. ✅ Test keyboard navigation
6. 🚀 Move to AI-010 (Seller Dashboard)

**Current: 95% Complete**
