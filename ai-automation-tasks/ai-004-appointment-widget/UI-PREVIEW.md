# 🎨 Appointment Widget - UI Preview & Design

## What You're Building

A beautiful, multi-step booking widget that connects mushroom buyers to growers in 4 steps.

---

## Step 1: Trigger Button

**Location:** Product pages, shop grid, anywhere

```
┌────────────────────────────────────┐
│  [Add to Cart]  [Buy Now]          │
│                                    │
│  📅 Book Meeting with Grower      │  ← Button triggers modal
└────────────────────────────────────┘
```

**Variants:**
- **Full button:** `variant="button"` - Shows on product detail pages
- **Icon only:** `variant="icon"` - Shows in product cards/grid

---

## Step 2: Seller Selection Modal

**What user sees after clicking button:**

```
╔═══════════════════════════════════════════════════════════════╗
║  Meet Your Perfect Mushroom Supplier                          ║
║  We'll match you with the best grower based on your needs     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Quantity (kg)                                                ║
║  [     10      ]                                              ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │  Manila Urban Farm                    [GROWER]      │    ║
║  │  📍 Quezon City                                     │    ║
║  │                                                      │    ║
║  │  Specialties:                                       │    ║
║  │  [Oyster] [King Oyster] [Shiitake]                 │    ║
║  │                                                      │    ║
║  │  ⏰ Capacity: 50kg/week                             │    ║
║  │                                                      │    ║
║  │  [View Available Slots]                             │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │  Maria's Mushrooms                    [GROWER]      │    ║
║  │  📍 Pasig City                                      │    ║
║  │  [Oyster] [Enoki] [Shiitake] [Maitake]            │    ║
║  │  ⏰ Capacity: 30kg/week                             │    ║
║  │  [View Available Slots]                             │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │  Pedro's Organic Farm                 [SELLER]      │    ║
║  │  📍 Makati City                                     │    ║
║  │  [Shiitake] [Reishi] [Lion's Mane]                │    ║
║  │  ⏰ Capacity: 20kg/week                             │    ║
║  │  [View Available Slots]                             │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**AI-Powered Matching:**
- Sellers are ranked by Ollama AI based on:
  1. Product specialty match
  2. Capacity availability
  3. Distance from location
  4. Past ratings (future)

---

## Step 3: Time Slot Picker

**User clicks "View Available Slots" on a seller:**

```
╔═══════════════════════════════════════════════════════════════╗
║  Choose Time Slot                                             ║
║  Book an appointment with Manila Urban Farm                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Select Date:              │  Available Times:                ║
║                            │                                  ║
║  ┌──────────────────────┐ │  [08:00 - 08:15]                ║
║  │   January 2026       │ │  [08:15 - 08:30]                ║
║  │                      │ │  [08:30 - 08:45]                ║
║  │  Su Mo Tu We Th Fr Sa│ │  [08:45 - 09:00]  ← Clickable   ║
║  │              1  2  3 │ │  [09:00 - 09:15]                ║
║  │  4  5  6  7  8  9 10 │ │  [09:15 - 09:30]                ║
║  │ 11 12 13 14 ⦿15⦿ 16 17│ │  [09:30 - 09:45]  ← Selected   ║
║  │ 18 19 20 21 22 23 24 │ │  [09:45 - 10:00] (Booked)      ║
║  │ 25 26 27 28 29 30 31 │ │  [10:00 - 10:15]                ║
║  └──────────────────────┘ │  ...scroll for more...          ║
║                            │                                  ║
║  [< Back to Sellers]                                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**Features:**
- Calendar shows next 7 days
- Disabled dates = no availability
- Green highlight = selected date
- 15-minute interval slots
- Grayed out = already booked
- Auto-scrolls to morning slots

---

## Step 4: Confirmation

**User selects a time slot:**

```
╔═══════════════════════════════════════════════════════════════╗
║  Confirm Appointment                                          ║
║  Review and confirm your booking details                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │  Seller:      Manila Urban Farm                     │    ║
║  │  Product:     Oyster Mushroom                       │    ║
║  │  Quantity:    10kg                                  │    ║
║  │  Date:        2026-01-15                            │    ║
║  │  Time:        09:30:00 - 09:45:00                   │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  Special Requests (optional)                                  ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │ Please bring samples of different grades           │    ║
║  │ I'm interested in bulk weekly orders               │    ║
║  │                                                     │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  [< Back]              [Confirm Appointment]                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Step 5: Success

**After booking confirms:**

```
╔═══════════════════════════════════════════════════════════════╗
║  Appointment Confirmed! 🎉                                    ║
║  Your meeting has been successfully scheduled                 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │  ✅ You're all set to meet Manila Urban Farm!      │    ║
║  │                                                     │    ║
║  │  📧 Confirmation email sent to your inbox          │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  Appointment Details:                                         ║
║  • Seller: Manila Urban Farm                                  ║
║  • Date: Wednesday, January 15, 2026                          ║
║  • Time: 9:30 AM - 9:45 AM                                    ║
║  • Location: Quezon City                                      ║
║  • Contact: +63 912 345 6789                                  ║
║                                                               ║
║  [Done]                                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Color Scheme (MASH Theme)

Based on your existing Tailwind config:

- **Primary Actions:** Green buttons (matches mushroom branding)
- **Secondary:** Outline buttons with gray
- **Success:** Light green background (#f0fdf4)
- **Cards:** White with subtle shadow on hover
- **Badges:** 
  - Grower role: Secondary (gray)
  - Specialties: Outline (transparent)
- **Selected State:** Primary color with white text

---

## Responsive Behavior

### Desktop (>768px)
- Modal: 3xl width (max-w-3xl = 768px)
- Calendar + Slots: 2-column grid
- Seller cards: Full width stacked

### Mobile (<768px)
- Modal: Full width with padding
- Calendar + Slots: Stacked vertically
- Seller cards: Full width
- Buttons: Full width
- Scrollable content with max-height

---

## Loading States

### Finding Sellers
```
Finding sellers...
[Spinner animation]
```

### Loading Slots
```
Loading available times...
[Seller card shows spinner in button]
```

### Booking
```
[Confirm Appointment] → [Booking...]
(Button disabled, shows loading spinner)
```

---

## Error States

### No Sellers Available
```
╔════════════════════════════════════╗
║  Meet Your Perfect Mushroom Supplier
║  
║  😔 No sellers available
║  
║  Try adjusting quantity or check
║  back later.
║
║  [Close]
╚════════════════════════════════════╝
```

### Booking Failed
```
Toast notification:
┌──────────────────────────────┐
│ ❌ Could not book appointment│
│ Please try again             │
└──────────────────────────────┘
```

---

## Component Hierarchy

```
AppointmentWidget
├── Dialog (shadcn)
│   ├── DialogTrigger (Button)
│   └── DialogContent
│       ├── DialogHeader
│       │   ├── DialogTitle
│       │   └── DialogDescription
│       │
│       ├── Step 1: Seller Selection
│       │   ├── Input (Quantity)
│       │   └── SellerCard (×3)
│       │       ├── CardHeader
│       │       ├── CardContent
│       │       └── CardFooter
│       │
│       ├── Step 2: Time Slot Picker
│       │   ├── Calendar (shadcn)
│       │   └── ScrollArea
│       │       └── Button (×32 slots)
│       │
│       ├── Step 3: Confirmation
│       │   ├── Summary Card
│       │   └── Textarea (Special Requests)
│       │
│       └── Step 4: Success
│           └── Success Card
```

---

## Accessibility Features

- [x] **Keyboard Navigation:** Tab through all interactive elements
- [x] **ARIA Labels:** All buttons have descriptive labels
- [x] **Focus Management:** Auto-focus on modal open
- [x] **Screen Reader:** Announces step changes
- [x] **Color Contrast:** WCAG AA compliant
- [x] **Loading States:** Announced to screen readers
- [x] **Error Messages:** Clear and descriptive

---

## Animation & Transitions

- **Modal Open/Close:** Fade + scale from center
- **Step Changes:** Smooth fade between steps
- **Hover Effects:** 
  - Cards: Lift shadow on hover
  - Buttons: Slight darken on hover
- **Selected States:** Instant color change
- **Loading:** Subtle spinner animation

---

## Integration Points

### Data Flow
```
User Action → Component State → useAppointments Hook
         ↓
  /api/appointments (Next.js)
         ↓
  n8n Webhook (localhost:5678)
         ↓
  PostgreSQL (Neon)
```

### State Management
- `open` - Modal visibility
- `step` - Current step (sellers | slots | confirm | success)
- `sellers` - Array of matched sellers from AI
- `availability` - Time slots for selected seller
- `selectedSeller` - Currently selected seller
- `selectedSlot` - Chosen time slot
- `quantity` - User-entered quantity
- `specialRequests` - Optional notes

---

## Future Enhancements (Not in Scope)

- [ ] Real-time slot updates via WebSocket
- [ ] Seller ratings and reviews
- [ ] Distance calculation with Google Maps API
- [ ] Photo gallery of seller farms
- [ ] Video call integration
- [ ] Multi-date booking
- [ ] Recurring appointments
- [ ] Cancellation/rescheduling UI

---

**This is what you're building!** 🎨

Follow [DO-THIS-NOW.md](DO-THIS-NOW.md) to implement this design.
