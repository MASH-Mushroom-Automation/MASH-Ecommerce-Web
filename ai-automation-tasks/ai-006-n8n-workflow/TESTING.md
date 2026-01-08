# AI-006 Workflow Testing Suite

**Date:** January 8, 2026  
**Status:** Ready to test as phases complete

---

## 📊 Test Commands (PowerShell)

### Phase 1 Test: Basic Webhook Routing

```powershell
# Test find_sellers routing
$body = @{
    action = "find_sellers"
    productType = "Oyster Mushroom"
    quantity = 10
    buyerLocation = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

**Expected Response:**
- ✅ Status 200
- ✅ Switch routes to find_sellers output
- ✅ Webhook executes successfully

---

## 🔍 Phase 2 Test: find_sellers Action

### Test Case 2.1: Valid Seller Request

```powershell
# After completing Phase 2, test with real seller data
$body = @{
    action = "find_sellers"
    productType = "Oyster Mushroom"
    quantity = 10
    buyerLocation = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "sellers": [
    {
      "id": "seller_xxx",
      "name": "Juan's Farm",
      "specialty": ["Oyster", "King Oyster"],
      "location": { "city": "Quezon City", "distance": 15 },
      "rating": 4.8,
      "availableSlots": [
        { "date": "2026-01-15", "time": "09:00", "available": true }
      ]
    }
  ]
}
```

**Assertions:**
- ✅ Success = true
- ✅ Sellers array has 1-3 items
- ✅ Each seller has availableSlots
- ✅ Response time < 5 seconds

---

### Test Case 2.2: Invalid Seller Request (missing field)

```powershell
$body = @{
    action = "find_sellers"
    # Missing productType - should error
    quantity = 10
    buyerLocation = "Manila"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing required field: productType",
  "code": 400
}
```

**Assertions:**
- ✅ Success = false
- ✅ Error message is descriptive
- ✅ HTTP status 400

---

## 📅 Phase 3 Test: get_availability Action

### Test Case 3.1: Valid Availability Request

```powershell
$body = @{
    action = "get_availability"
    sellerId = "seller_juan_farm_001"
    numDays = 7
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "slots": [
    { "date": "2026-01-15", "time": "09:00", "available": true },
    { "date": "2026-01-15", "time": "09:30", "available": true },
    { "date": "2026-01-15", "time": "10:00", "available": true }
  ]
}
```

**Assertions:**
- ✅ Success = true
- ✅ Slots grouped by date
- ✅ Up to 21 slots (7 days × 3)
- ✅ All future dates

---

## ✅ Phase 4 Test: set_appointment Action

### Test Case 4.1: Valid Appointment Creation

```powershell
$body = @{
    action = "set_appointment"
    sellerId = "seller_juan_farm_001"
    sellerName = "Juan's Farm"
    sellerEmail = "juan@example.com"
    buyerUid = "buyer_test_001"
    buyerName = "John Doe"
    buyerEmail = "john@example.com"
    buyerPhone = "+639123456789"
    buyerLocation = "Manila"
    productType = "Oyster Mushroom"
    quantity = 10
    scheduledDate = "2026-01-15"
    scheduledTime = "09:00"
    specialRequests = "Please call before delivery"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "appointmentId": "appt_abc123xyz",
  "message": "Appointment confirmed",
  "emailSent": true
}
```

**Assertions:**
- ✅ Success = true
- ✅ AppointmentId generated
- ✅ Emails sent (check Gmail)
- ✅ Firebase writes updated

**Firebase Verification:**
```
1. Check appointments collection → new document created
2. Check availability_slots → is_available changed to false
3. Check Gmail → 2 emails received (buyer + seller)
```

### Test Case 4.2: Double Booking Prevention

```powershell
# Try booking same time slot again (should fail)
$body = @{
    action = "set_appointment"
    sellerId = "seller_juan_farm_001"
    sellerName = "Juan's Farm"
    sellerEmail = "juan@example.com"
    buyerUid = "buyer_test_002"  # Different buyer
    buyerName = "Jane Smith"
    buyerEmail = "jane@example.com"
    buyerPhone = "+639987654321"
    buyerLocation = "Quezon City"
    productType = "Oyster Mushroom"
    quantity = 5
    scheduledDate = "2026-01-15"
    scheduledTime = "09:00"  # Same time as Test 4.1
    specialRequests = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": false,
  "error": "This time slot is no longer available",
  "code": 409
}
```

**Assertions:**
- ✅ Success = false
- ✅ Error code 409 (Conflict)
- ✅ No appointment created
- ✅ No email sent

---

## ❌ Phase 5 Test: cancel_appointment Action

### Test Case 5.1: Valid Cancellation

```powershell
$body = @{
    action = "cancel_appointment"
    appointmentId = "appt_abc123xyz"  # From Test 4.1
    buyerUid = "buyer_test_001"
    cancellationReason = "Schedule conflict"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled",
  "emailSent": true
}
```

**Assertions:**
- ✅ Success = true
- ✅ Emails sent
- ✅ Firebase appointment status = "cancelled"
- ✅ Slot freed up (is_available = true)

### Test Case 5.2: Unauthorized Cancellation

```powershell
$body = @{
    action = "cancel_appointment"
    appointmentId = "appt_abc123xyz"
    buyerUid = "buyer_different"  # Wrong buyer
    cancellationReason = "Test"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized: You can only cancel your own appointments",
  "code": 403
}
```

**Assertions:**
- ✅ Success = false
- ✅ Error code 403 (Forbidden)
- ✅ No changes to Firebase

---

## 📋 Phase 6 Test: get_appointments Action

### Test Case 6.1: Get Buyer's Appointments

```powershell
$body = @{
    action = "get_appointments"
    buyerUid = "buyer_test_001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "appointments": [
    {
      "appointmentId": "appt_xxx",
      "sellerName": "Juan's Farm",
      "productType": "Oyster Mushroom",
      "quantity": 10,
      "scheduledDate": "2026-01-15",
      "scheduledTime": "09:00",
      "status": "pending",
      "createdAt": "2026-01-08T10:00:00Z"
    }
  ]
}
```

**Assertions:**
- ✅ Success = true
- ✅ Appointments array returned
- ✅ Sorted by scheduled_time DESC
- ✅ Includes all statuses (pending, confirmed, cancelled)

---

## 🚀 How to Run Tests

### Option 1: Run Individual Test
Copy one test case into PowerShell and execute

### Option 2: Run All Tests in Sequence
```powershell
# Phase 1
Write-Host "Testing Phase 1: Webhook Routing" -ForegroundColor Cyan
# ... run phase 1 test ...

# Wait for phase 2 completion
Write-Host "Phase 2 complete? Press Enter to continue" -ForegroundColor Yellow
Read-Host

# Phase 2
Write-Host "Testing Phase 2: find_sellers" -ForegroundColor Cyan
# ... run phase 2 tests ...
```

---

## ✅ Test Results Tracking

| Phase | Test Case | Status | Notes |
|-------|-----------|--------|-------|
| 1 | Webhook Routing | ⏳ Pending | Waiting for completion |
| 2 | Valid Seller Request | ⏳ Pending | |
| 2 | Invalid Request | ⏳ Pending | |
| 3 | Get Availability | ⏳ Pending | |
| 4 | Create Appointment | ⏳ Pending | |
| 4 | Double Booking | ⏳ Pending | |
| 5 | Cancel Appointment | ⏳ Pending | |
| 5 | Unauthorized Cancel | ⏳ Pending | |
| 6 | Get Appointments | ⏳ Pending | |

---

## 🐛 Debugging Tips

### Check n8n Logs
1. Open n8n at http://localhost:5678
2. Click "Executions" tab
3. Look for latest execution
4. Click to see full request/response/errors

### Check Firebase
1. Open https://console.firebase.google.com/project/mash-ddf8d/firestore
2. Check collections:
   - `availability_slots` - Should show is_available changes
   - `appointments` - Should show new documents
3. Check "Composite Indexes" - Should be building

### Check Gmail
- Verify emails received from n8n
- Check spam folder if missing
- Verify Gmail credentials in n8n

### Common Issues
- **Webhook 404:** Workflow not activated
- **Firebase permission denied:** Missing credentials
- **Ollama timeout:** Ollama service not running
- **Email not sent:** Gmail credentials expired

---

## 📝 Notes

- Each test should complete in < 5 seconds
- Keep test data consistent across phases (same sellerId, buyerUid, etc.)
- Document any errors encountered
- Update PROGRESS.md after each phase
