# AI-004: Appointment Widget - Implementation Summary

> **Status:** ✅ Complete  
> **Created:** January 8, 2026  
> **Dependencies:** AI-002 (n8n), AI-003 (Ollama)  
> **GitHub Issue:** [#180](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/180)

---

## 📋 Quick Start

```bash
# 1. Start n8n (if not running)
cd ai-automation-tasks/ai-002-n8n-setup
docker-compose up -d

# 2. Start Ollama (if not running)
ollama serve

# 3. Start frontend
npm run dev

# 4. Open product page
# http://localhost:3000/product/oyster-mushroom-fresh

# 5. Click "Book Meeting with Grower" button
```

---

## 🎯 What Was Built

### Components Created

#### 1. **AppointmentWidget.tsx** - Main Booking Wizard
- 3-step flow: Select Seller → Confirm Details → Success Message
- AI-powered seller matching via n8n + Ollama
- Form validation and error handling
- Mobile-responsive dialog

#### 2. **SellerCard.tsx** - Seller Display Card
- Seller avatar with initials fallback
- Specialty badges (e.g., "Oyster", "King Oyster")
- Distance and location display
- Star rating (if available)
- Next 3 available time slots
- Interactive slot selection

#### 3. **useAppointments.ts** - API Integration Hook
- `findMatchingSellers()` - AI seller matching
- `getAvailableSlots()` - Fetch time slots
- `bookAppointment()` - Create appointment
- `cancelAppointment()` - Cancel booking
- `getUserAppointments()` - Fetch history

#### 4. **types.ts** - TypeScript Interfaces
- `Seller` - Seller profile structure
- `TimeSlot` - Available time slot
- `AppointmentBooking` - Booking payload
- `AppointmentResponse` - API response
- `SellerMatchRequest` - AI matching request

---

## 🔗 Integration Points

### n8n Webhook Endpoint
```
http://localhost:5678/webhook/mash-appointments
```

### Expected Workflow Actions

#### 1. Find Sellers (AI Matching)
```json
POST /webhook/mash-appointments
{
  "action": "find_sellers",
  "productType": "Oyster Mushrooms",
  "quantity": 10,
  "buyerLocation": "Manila",
  "preferredDate": "2026-01-15"
}

Response:
{
  "sellers": [
    {
      "id": "seller-123",
      "uid": "firebase-uid-123",
      "name": "Juan's Farm",
      "specialty": ["Oyster", "King Oyster"],
      "location": {
        "address": "123 Mushroom St, Quezon City",
        "city": "Quezon City",
        "coordinates": { "lat": 14.6760, "lng": 121.0437 }
      },
      "distance": 15,
      "rating": 4.8,
      "capacity": 50,
      "availableSlots": [
        { "date": "2026-01-15", "time": "09:00", "available": true, "isRecommended": true },
        { "date": "2026-01-15", "time": "09:30", "available": true },
        { "date": "2026-01-15", "time": "10:00", "available": true }
      ]
    }
  ]
}
```

#### 2. Get Availability
```json
POST /webhook/mash-appointments
{
  "action": "get_availability",
  "sellerId": "seller-123",
  "numDays": 7
}

Response:
{
  "slots": [
    { "date": "2026-01-15", "time": "09:00", "available": true },
    { "date": "2026-01-15", "time": "09:30", "available": false },
    ...
  ]
}
```

#### 3. Book Appointment
```json
POST /webhook/mash-appointments
{
  "action": "set_appointment",
  "sellerId": "seller-123",
  "sellerName": "Juan's Farm",
  "sellerEmail": "juan@farm.com",
  "buyerUid": "buyer-456",
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "buyerPhone": "+639123456789",
  "buyerLocation": "Manila",
  "productType": "Oyster Mushrooms",
  "quantity": 10,
  "scheduledDate": "2026-01-15",
  "scheduledTime": "09:00",
  "specialRequests": "Please call before arriving"
}

Response:
{
  "success": true,
  "appointmentId": "appt-789",
  "message": "Appointment booked successfully!",
  "emailSent": true
}
```

---

## 📁 File Structure

```
src/
├── components/
│   └── appointments/
│       ├── types.ts                    # TypeScript interfaces
│       ├── SellerCard.tsx              # Seller display card
│       └── AppointmentWidget.tsx       # Main booking wizard
├── hooks/
│   └── useAppointments.ts              # n8n webhook integration
└── app/
    └── (shop)/
        └── product/
            └── [slug]/
                └── page.tsx            # Modified: Added widget

.env.local                              # Added: NEXT_PUBLIC_N8N_WEBHOOK_URL
```

---

## 🎨 UI/UX Features

### Seller Matching
- AI-powered ranking by:
  1. **Product Specialty** (e.g., oyster specialist for oyster orders)
  2. **Proximity** (distance from buyer location)
  3. **Capacity** (can fulfill order quantity)
- Shows top 3 recommendations
- Displays recommended time slots (amber border)

### Time Slot Selection
- Next 7 days of availability
- 30-minute intervals (9:00 AM - 5:00 PM)
- Disabled slots for already booked times
- Visual feedback for selection (green border, checkmark)
- Hover effects for better UX

### Booking Flow
1. **Step 1: Select Seller**
   - Browse AI-matched sellers
   - View available time slots
   - Select preferred slot
   - Click "Continue"

2. **Step 2: Confirm Details**
   - Review appointment summary
   - Fill buyer information (auto-populated from Firebase Auth)
   - Add special requests (optional)
   - Click "Confirm Appointment"

3. **Step 3: Success**
   - Green checkmark icon
   - Appointment details summary
   - Email confirmation notice
   - Link to appointment dashboard

### Mobile Responsive
- Stack layout on small screens
- Touch-friendly buttons (44px minimum)
- Scrollable dialog content
- Optimized for one-handed use

---

## 🧪 Testing Guide

### Manual Testing Steps

1. **Prerequisites:**
   - [ ] n8n running at `http://localhost:5678`
   - [ ] Ollama running with llama3.2:3b model
   - [ ] Firebase Auth configured
   - [ ] User logged in

2. **Test Widget Opening:**
   ```bash
   # Navigate to product page
   http://localhost:3000/product/oyster-mushroom-fresh
   
   # Click "Book Meeting with Grower" button
   # Expected: Modal opens with loading spinner
   ```

3. **Test Seller Loading:**
   ```bash
   # Modal should fetch sellers via n8n webhook
   # Expected: 3 seller cards appear with available slots
   # Check browser console for webhook request
   ```

4. **Test Slot Selection:**
   ```bash
   # Click on a time slot in any seller card
   # Expected: Green border appears, checkmark shows
   # Click "Continue" button
   # Expected: Navigates to confirmation step
   ```

5. **Test Booking Confirmation:**
   ```bash
   # Fill in buyer details (name, phone, location)
   # Set quantity (e.g., 10 kg)
   # Add special requests (optional)
   # Click "Confirm Appointment"
   # Expected: Success screen appears
   ```

6. **Test Email Confirmation:**
   ```bash
   # Check buyer email for confirmation
   # Expected: Email from MASH.Mushroom.Automation@gmail.com
   # Contains appointment details (seller, date, time, location)
   ```

### Error Handling Tests

7. **Test Not Logged In:**
   ```bash
   # Log out of account
   # Click "Book Meeting with Grower"
   # Expected: Toast notification "Please log in to book appointments"
   ```

8. **Test No Sellers Available:**
   ```bash
   # Mock n8n response with empty sellers array
   # Expected: "No sellers found" message
   # "Try Again" button appears
   ```

9. **Test Network Error:**
   ```bash
   # Stop n8n container
   # Click "Book Meeting with Grower"
   # Expected: Error toast with retry option
   ```

### Browser Compatibility

10. **Test Cross-Browser:**
    - [ ] Chrome (Desktop + Mobile)
    - [ ] Firefox
    - [ ] Safari (Mac + iOS)
    - [ ] Edge

---

## 🔧 Configuration

### Environment Variables (.env.local)

```bash
# n8n webhook endpoint for appointment system
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/mash-appointments
```

### Firebase Collections (To Be Created in AI-005)

```javascript
// availability_slots
{
  seller_uid: "firebase-uid-123",
  seller_name: "Juan's Farm",
  available_date: "2026-01-15",
  available_time: "09:00",
  is_available: true,
  created_at: Timestamp
}

// appointments
{
  appointment_id: "appt-789",
  buyer_uid: "buyer-456",
  buyer_name: "John Doe",
  buyer_phone: "+639123456789",
  buyer_email: "john@example.com",
  seller_uid: "seller-123",
  seller_name: "Juan's Farm",
  seller_email: "juan@farm.com",
  product_type: "Oyster Mushrooms",
  quantity: 10,
  scheduled_time: Timestamp("2026-01-15 09:00"),
  status: "pending", // pending | confirmed | completed | cancelled
  special_requests: "Please call before arriving",
  created_at: Timestamp
}
```

---

## 🚀 Next Steps

### AI-005: Create Firebase Collections (15 min)
- Create `availability_slots` collection
- Create `appointments` collection
- Add composite indexes
- Seed test data (3 sellers with slots)

### AI-006: Build n8n Workflow (2-3 hours)
- Implement `find_sellers` action (Ollama AI matching)
- Implement `get_availability` action (Firestore query)
- Implement `set_appointment` action (create + email)
- Add email notifications (Gmail)
- Test all 5 appointment actions

### AI-007: Seller Availability Management (1-2 hours)
- Create seller dashboard widget
- Weekly calendar view
- Toggle available/unavailable slots
- Sync with Firestore

### AI-008: Buyer Appointment Dashboard (1 hour)
- View booked appointments
- Cancel/reschedule functionality
- Past appointments history

---

## 📚 API Reference

### useAppointments Hook

```typescript
import { useAppointments } from "@/hooks/useAppointments";

const {
  loading,              // boolean - API request in progress
  error,                // string | null - Error message
  findMatchingSellers,  // (request: SellerMatchRequest) => Promise<Seller[]>
  getAvailableSlots,    // (sellerId: string, numDays?: number) => Promise<TimeSlot[]>
  bookAppointment,      // (booking: AppointmentBooking) => Promise<AppointmentResponse>
  cancelAppointment,    // (appointmentId: string) => Promise<AppointmentResponse>
  getUserAppointments,  // () => Promise<Appointment[]>
} = useAppointments();
```

### Component Props

```typescript
// AppointmentWidget
interface AppointmentWidgetProps {
  productType: string;    // e.g., "Oyster Mushrooms"
  productSlug: string;    // e.g., "oyster-mushroom-fresh"
  quantity?: number;      // Default: 1
  className?: string;     // Tailwind classes
}

// SellerCard
interface SellerCardProps {
  seller: Seller;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
}
```

---

## 💡 Implementation Notes

### Design Decisions

1. **3-Step Wizard:** Breaks complex booking flow into manageable steps
2. **AI Seller Matching:** Delegates ranking logic to Ollama (flexible prompts)
3. **Webhook Architecture:** n8n handles business logic, frontend is thin client
4. **Component Composition:** SellerCard reusable for other views (seller list, dashboard)
5. **Type Safety:** TypeScript interfaces prevent webhook payload errors

### Performance Optimizations

- **Lazy Loading:** Dialog content only rendered when open
- **Debounced Search:** (Future) Search sellers as user types location
- **Cached Results:** (Future) Cache seller list for 5 minutes
- **Optimistic UI:** (Future) Show success immediately, confirm in background

### Accessibility

- **Keyboard Navigation:** Tab through all interactive elements
- **ARIA Labels:** Screen reader support for all buttons and form fields
- **Focus Management:** Auto-focus on dialog open, trap focus inside
- **Color Contrast:** WCAG AA compliant (green/white/gray palette)

---

## 🎉 Success Metrics

### Completion Checklist

- [x] Widget button appears on product pages
- [x] Modal opens with 3-step wizard
- [x] AI seller matching integrated
- [x] Time slot selection working
- [x] Booking form validates correctly
- [x] Success message displays
- [x] Mobile responsive design
- [x] Tailwind styling matches MASH theme
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Loading states added
- [x] Authentication check included

### Time Spent: ~1 hour

**Phase Breakdown:**
- Component structure: 10 min
- Main widget UI: 20 min
- Seller card: 15 min
- Time slot selection: 5 min (integrated)
- Booking form: 10 min
- Integration & polish: 10 min

---

## 📞 Support

**Created by:** @PP-Namias  
**Documentation:** `ai-automation-tasks/ai-004-appointment-widget/`  
**GitHub Issue:** [#180](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/180)

For questions or issues, check:
1. [PROGRESS.md](./PROGRESS.md) - Implementation log
2. [PR-GUIDE.md](./PR-GUIDE.md) - Pull request checklist
3. [TESTING.md](./TESTING.md) - Test cases
4. [NEXT-STEPS.md](./NEXT-STEPS.md) - Future enhancements
