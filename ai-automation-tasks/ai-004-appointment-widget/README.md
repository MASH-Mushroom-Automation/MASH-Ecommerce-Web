# AI-004: Seller Appointment Widget UI

> **Phase:** 1 - Foundation  
> **Priority:** High  
> **Story Points:** 10  
> **Estimated Time:** 6-8 hours  
> **Dependencies:** AI-002 (n8n), Sanity CMS

---

## 📋 Task Overview

Create a beautiful, user-friendly widget that allows buyers to instantly book appointments with mushroom growers. The widget displays recommended sellers, their specialties, available time slots, and location—all accessible with one click from product pages.

### Key Features:
- "Book Meeting with Grower" button on product pages
- Modal shows top 3 recommended sellers
- Real-time availability display
- One-click booking confirmation
- Mobile-responsive design
- Accessibility compliant

---

## 🎯 Acceptance Criteria

- [ ] Widget button appears on all product pages
- [ ] Modal displays 3 recommended sellers
- [ ] Each seller card shows: name, specialty, distance, available slots
- [ ] Time slot picker shows next 7 days, 30-minute intervals
- [ ] Booking form includes: buyer name, phone, quantity, special requests
- [ ] Success message with appointment details
- [ ] Email confirmation triggered automatically
- [ ] Responsive on mobile, tablet, desktop
- [ ] WCAG 2.1 AA accessibility compliance

---

## 🔗 Dependencies

- AI-002 (n8n running)
- Sanity CMS with seller profiles
- Product pages implemented
- Radix UI components available

---

## 📝 Implementation Steps

### Component Structure
```
src/components/ai/
├── AppointmentWidget.tsx          # Main widget component
├── SellerCard.tsx                 # Individual seller display
├── TimeSlotPicker.tsx             # Date/time selection
├── BookingConfirmation.tsx        # Success modal
└── hooks/
    └── useAppointmentBooking.ts   # Booking logic
```

### File Locations
- Widget: `src/components/ai/AppointmentWidget.tsx`
- Integration: Add to `src/app/(shop)/product/[slug]/page.tsx`
- API calls: `src/app/api/ai/appointment/check-availability/route.ts`
- Styles: Tailwind CSS (use MASH theme colors)

### Key Implementation Points
1. Use Radix Dialog for modal
2. Fetch sellers via API route calling n8n
3. Real-time availability check from Firestore
4. Form validation with Zod schema
5. Optimistic UI updates
6. Loading states and error handling
7. Analytics tracking (GTM events)

---

## 🧪 Testing Requirements

- Unit tests for components
- Integration tests for booking flow
- Accessibility tests (keyboard navigation, screen readers)
- Visual regression tests
- Mobile responsiveness tests
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## 📚 Resources

- [Radix Dialog Docs](https://www.radix-ui.com/docs/primitives/components/dialog)
- [React Hook Form](https://react-hook-form.com/)
- MASH Design System: `.github/copilot-instructions.md`
