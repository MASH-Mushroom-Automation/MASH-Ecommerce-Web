# AI-004: Appointment Widget - Implementation Plan

> **Story Points:** 10  
> **Estimated Time:** 6-8 hours  
> **Phases:** 6

---

## 📋 Phase Breakdown

### Phase 1: Component Structure Setup (60 mins)
**Goal:** Create base components and file structure

#### Tasks:
- [ ] Create `src/components/ai/` folder
- [ ] Create `AppointmentWidget.tsx` shell
- [ ] Create `SellerCard.tsx` component
- [ ] Create `TimeSlotPicker.tsx` component
- [ ] Create `BookingConfirmation.tsx` modal
- [ ] Setup TypeScript interfaces

---

### Phase 2: Main Widget UI (90 mins)
**Goal:** Build modal and trigger button

#### Tasks:
- [ ] Implement Radix Dialog
- [ ] Add "Book Meeting" button
- [ ] Style modal layout
- [ ] Add close/cancel functionality
- [ ] Implement responsive breakpoints

---

### Phase 3: Seller Display Logic (75 mins)
**Goal:** Fetch and display recommended sellers

#### Tasks:
- [ ] Create API route for seller matching
- [ ] Implement seller cards grid
- [ ] Add loading skeleton
- [ ] Display seller: name, specialty, distance, rating
- [ ] Add "Select Seller" button

---

### Phase 4: Time Slot Selection (90 mins)
**Goal:** Interactive date/time picker

#### Tasks:
- [ ] Build calendar component (next 7 days)
- [ ] Display 30-minute time slots
- [ ] Disable booked slots
- [ ] Highlight selected slot
- [ ] Mobile-optimized layout

---

### Phase 5: Booking Form & Submission (75 mins)
**Goal:** Collect buyer info and submit

#### Tasks:
- [ ] Build form with React Hook Form
- [ ] Add validation (Zod schema)
- [ ] Submit to booking API
- [ ] Handle loading/error states
- [ ] Show success confirmation

---

### Phase 6: Integration & Polish (90 mins)
**Goal:** Add to product pages and refine UX

#### Tasks:
- [ ] Integrate widget into product pages
- [ ] Add analytics tracking
- [ ] Accessibility testing (keyboard nav, ARIA)
- [ ] Cross-browser testing
- [ ] Performance optimization

---

## Time Estimate: 7-8 hours total
