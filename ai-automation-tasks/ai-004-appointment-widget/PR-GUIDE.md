# AI-004: Appointment Widget - PR Guide

> **PR Title:** `feat(ai-004): Complete appointment widget UI with seller selection and booking`  
> **Branch:** `feature/ai-004-appointment-widget`

---

## 📋 Pre-PR Checklist

- [ ] All 6 phases completed
- [ ] All 12 tests passing
- [ ] Screenshots added to PROGRESS.md
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (keyboard nav, screen readers)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Code follows MASH conventions
- [ ] No console errors/warnings

---

## 🚀 Creating the PR

```bash
git checkout feature/ai-004-appointment-widget
git add ai-automation-tasks/ai-004-appointment-widget/
git add src/components/ai/
git commit -m "feat(ai-004): Complete appointment widget UI

- Create AppointmentWidget component with Radix Dialog
- Implement SellerCard display with real-time availability
- Build TimeSlotPicker for 7-day calendar view
- Add booking form with validation
- Integrate widget into product pages
- All 12 tests passing
- Mobile responsive and accessible

Closes #[ISSUE_NUMBER]"

git push origin feature/ai-004-appointment-widget
```

---

## 📝 PR Description Template

```markdown
## Summary
Built appointment booking widget for buyers to schedule meetings with mushroom growers directly from product pages.

## Changes
- ✅ AppointmentWidget component (Radix Dialog)
- ✅ SellerCard with specialty, distance, rating
- ✅ TimeSlotPicker (next 7 days, 30-min intervals)
- ✅ Booking form (React Hook Form + Zod)
- ✅ Mobile responsive
- ✅ WCAG 2.1 AA accessible

## Testing
- 12/12 tests passing
- Tested on Chrome, Firefox, Safari
- Keyboard navigation verified
- Screen reader compatible

## Screenshots
[Add modal, seller cards, mobile view]
```

---

## ✅ Reviewer Checklist

- [ ] Widget renders on product pages
- [ ] Modal opens/closes smoothly
- [ ] Seller cards display correctly
- [ ] Time slots work as expected
- [ ] Form validation functional
- [ ] Mobile responsive
- [ ] Accessible (keyboard + screen reader)
- [ ] Tests comprehensive and passing
