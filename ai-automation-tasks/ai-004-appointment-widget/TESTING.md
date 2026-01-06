# AI-004: Appointment Widget - Testing Guide

> **Test Coverage Goal:** 100%  
> **Test Suites:** 4

---

## 🧪 Test Cases

### Test Suite 1: Component Rendering (3 tests)

#### Test 1.1: Widget Button Renders
```typescript
test('renders book appointment button on product page', () => {
  render(<ProductPage />);
  expect(screen.getByText(/book meeting/i)).toBeInTheDocument();
});
```

#### Test 1.2: Modal Opens on Click
```typescript
test('opens modal when button clicked', async () => {
  render(<AppointmentWidget />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('dialog')).toBeVisible();
});
```

#### Test 1.3: Modal Closes
```typescript
test('closes modal on cancel', async () => {
  render(<AppointmentWidget open={true} />);
  fireEvent.click(screen.getByText(/cancel/i));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

---

### Test Suite 2: Seller Display (3 tests)

#### Test 2.1: Fetches Sellers
**Pass Criteria:**
- API called with correct params
- Loading state shown
- 3 sellers displayed

#### Test 2.2: Seller Cards Display Correctly
**Pass Criteria:**
- Name, specialty, distance visible
- Rating stars render
- "Select" button functional

#### Test 2.3: Error Handling
**Pass Criteria:**
- Error message shown if API fails
- Retry button available

---

### Test Suite 3: Time Slot Selection (3 tests)

#### Test 3.1: Calendar Shows Next 7 Days
#### Test 3.2: Booked Slots Disabled
#### Test 3.3: Slot Selection Works

---

### Test Suite 4: Booking Form (3 tests)

#### Test 4.1: Form Validation
#### Test 4.2: Successful Booking
#### Test 4.3: Error Handling

---

## Test Results: __/12 passing
