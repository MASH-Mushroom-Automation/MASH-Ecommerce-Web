# ✅ AI-004 Appointment Widget - READY TO IMPLEMENT

**Status:** Ready for implementation  
**Time Required:** 90 minutes  
**Prerequisites:** AI-007 PostgreSQL n8n workflow active ✅

---

## 📦 What's Been Created

### Documentation (in this folder):
- [x] **DO-THIS-NOW.md** - Step-by-step 90-minute implementation guide
- [x] **AppointmentWidget.tsx** - Complete React component (240 lines)
- [x] **README.md** - Full technical documentation
- [x] All other planning docs

### Files You'll Create:
1. `src/types/appointments.ts` - TypeScript interfaces
2. `src/app/api/appointments/route.ts` - Next.js API route (proxies to n8n)
3. `src/hooks/useAppointments.ts` - React hook for API calls
4. `src/components/appointments/SellerCard.tsx` - Seller display component
5. `src/components/appointments/TimeSlotPicker.tsx` - Calendar + time selection
6. `src/components/appointments/AppointmentWidget.tsx` - Main modal widget

---

## 🚀 START HERE

### Option 1: Follow Step-by-Step Guide (Recommended)

Open and follow: **[DO-THIS-NOW.md](DO-THIS-NOW.md)**

This guide walks you through:
1. Creating types (5 min)
2. API route setup (10 min)
3. Hook implementation (15 min)
4. Component creation (60 min)
5. Testing (10 min)

### Option 2: Copy-Paste All Files (Fast)

All component code is ready in this folder:
- Copy `AppointmentWidget.tsx` → `src/components/appointments/AppointmentWidget.tsx`
- Follow DO-THIS-NOW.md for other files

---

## 🎯 What This Widget Does

### User Flow:
1. **Click "Book Meeting with Grower"** on any product page
2. **AI finds 3 best sellers** based on product, quantity, location
3. **Select seller** → View their available time slots
4. **Pick date & time** from calendar
5. **Confirm booking** with optional notes
6. **Success!** Appointment created in PostgreSQL, slot marked unavailable

### Behind the Scenes:
- Calls n8n webhook: `http://localhost:5678/webhook/mash-appointments`
- Uses 3 actions: `find_sellers`, `get_availability`, `set_appointment`
- Integrates with your existing PostgreSQL database
- AI-powered seller matching via Ollama

---

## ✅ Pre-Flight Checklist

Before starting, verify:

- [ ] n8n running: `docker ps | findstr n8n`
- [ ] Ollama running: `ollama list` shows llama3.2:3b
- [ ] n8n workflow active (green toggle in n8n UI)
- [ ] Database has 672 slots: `SELECT COUNT(*) FROM availability_slots;`
- [ ] Database has 3 sellers: `SELECT COUNT(*) FROM growers;`
- [ ] Test webhook works:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
  ```

---

## 🧪 How to Test

### 1. Test API Route (after Step 2)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method POST -Body '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
```

**Expected:** JSON with `sellers` array

### 2. Test in Browser (after Step 6)

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/product/oyster-mushroom
3. Click "Book Meeting with Grower"
4. Verify 3 sellers appear
5. Click "View Available Slots"
6. Select date → Select time → Confirm
7. **Expected:** "Appointment Confirmed! 🎉"

---

## 📊 Architecture Overview

```
User clicks button
     ↓
AppointmentWidget.tsx (React component)
     ↓
useAppointments.ts (React hook)
     ↓
/api/appointments (Next.js API route)
     ↓
http://localhost:5678/webhook/mash-appointments (n8n)
     ↓
5 actions: find_sellers | get_availability | set_appointment | cancel | get_appointments
     ↓
PostgreSQL (Neon) - growers, availability_slots, appointments tables
```

---

## 🐛 Common Issues

### "Cannot connect to n8n webhook"
**Fix:** Verify n8n workflow is active (green toggle), Ollama is running

### "No sellers found"
**Fix:** Check `SELECT * FROM growers;` returns 3 rows

### "Slots not loading"
**Fix:** Check `SELECT COUNT(*) FROM availability_slots WHERE seller_uid = 'seller_001';` returns 224

### "Component not rendering"
**Fix:** Ensure all shadcn/ui components installed: `npx shadcn@latest add dialog button input textarea calendar`

---

## 📝 Integration Examples

### Add to Product Page

```typescript
// src/app/(shop)/product/[slug]/page.tsx
import { AppointmentWidget } from '@/components/appointments/AppointmentWidget';

export default function ProductPage({ params }) {
  return (
    <div>
      {/* ...existing code... */}
      
      {/* Add after "Add to Cart" button */}
      <AppointmentWidget
        productType={product.name}
        productName={product.name}
        defaultQuantity={1}
        variant="button"
      />
    </div>
  );
}
```

### Add to Shop Grid

```typescript
// src/app/(shop)/shop/page.tsx
<AppointmentWidget
  productType={product.name}
  productName={product.name}
  variant="icon"  // Small icon button
/>
```

---

## 🎉 Success Criteria

Your implementation is complete when:

- [x] Widget opens without errors
- [x] Shows 3 sellers from database
- [x] Loads time slots for selected seller
- [x] Can select date and time
- [x] Booking creates appointment in PostgreSQL
- [x] Slot is marked as unavailable after booking
- [x] Success message displays
- [x] No console errors
- [x] Responsive on mobile

---

## 🚀 Next Steps After Completion

1. **Add to more pages** - Shop grid, cart, profile
2. **Appointment dashboard** - View/manage bookings
3. **Cancel/Reschedule** - Implement cancel_appointment action
4. **Email notifications** - AI-011 (automated confirmations)
5. **Seller dashboard** - AI-010 (availability management)

---

## 📚 Resources

- **Full Documentation:** [README.md](README.md)
- **Implementation Guide:** [DO-THIS-NOW.md](DO-THIS-NOW.md)
- **n8n Webhook Test:** [test-neon-workflow.ps1](../ai-007-postgresql-n8n/test-neon-workflow.ps1)
- **Troubleshooting:** [README.md](README.md) Section 8

---

**⏱️ Estimated Time:** 90 minutes  
**💪 Difficulty:** Intermediate (React, TypeScript, API integration)  
**🎯 Goal:** Fully functional appointment booking widget connecting buyers to growers

**Let's build this! Open [DO-THIS-NOW.md](DO-THIS-NOW.md) to start.** 🚀
