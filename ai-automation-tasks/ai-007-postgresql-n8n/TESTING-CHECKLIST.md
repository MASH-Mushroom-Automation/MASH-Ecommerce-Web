# ✅ AI-007 Testing & Validation Checklist

**Use this checklist to verify your system is working correctly**

---

## 📋 Pre-Flight Checklist (Before Testing)

### Environment

- [ ] **n8n running** - http://localhost:5678 accessible
- [ ] **Ollama running** - `ollama serve` in terminal, no errors
- [ ] **Llama 3.2 model** - `ollama list` shows `llama3.2:latest`
- [ ] **Docker Desktop** - Running, no resource warnings
- [ ] **Internet connection** - Stable (for Neon PostgreSQL)

### Database

- [ ] **Neon console** - Can login to https://console.neon.tech
- [ ] **Project "Namias"** - Visible in project list
- [ ] **SQL Editor** - Can open and execute queries
- [ ] **Tables created** - Run: `SELECT COUNT(*) FROM growers;` → Returns 3
- [ ] **Slots seeded** - Run: `SELECT COUNT(*) FROM availability_slots;` → Returns 672
- [ ] **Appointments exist** - Run: `SELECT COUNT(*) FROM appointments;` → Returns 2

### n8n Workflow

- [ ] **Workflow imported** - "MASH Appointment System - PostgreSQL" visible in workflows list
- [ ] **Workflow active** - Green toggle ON (top right)
- [ ] **Credential configured** - "Neon PostgreSQL - MASH" exists in Settings → Credentials
- [ ] **Credential tested** - Green checkmark when testing connection
- [ ] **PostgreSQL nodes linked** - All 10 PostgreSQL nodes use "Neon PostgreSQL - MASH" credential
- [ ] **Ollama nodes configured** - All 5 Ollama nodes use `llama3.2:latest` model

---

## 🧪 Test 1: Find Sellers (AI Matching)

### Manual Test

```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
```

### Expected Response

```json
{
  "success": true,
  "sellers": [
    {
      "user_uid": "seller_001",
      "name": "Manila Urban Farm",
      "rating": 4.8,
      "specialty": "Oyster Mushrooms, King Oyster",
      "location": "Manila, Philippines",
      "capacity_kg": 150,
      "available_slots_count": 56
    }
  ],
  "totalSellers": 3
}
```

### Validation Checklist

- [ ] **Response time** - <2 seconds
- [ ] **Status code** - 200 OK
- [ ] **Sellers returned** - At least 1 seller
- [ ] **Seller data complete** - name, rating, specialty, location present
- [ ] **Sorted correctly** - Highest rating first
- [ ] **No errors** - n8n Executions sidebar shows green checkmark
- [ ] **AI executed** - Ollama logs show model inference

---

## 🧪 Test 2: Get Availability

### Manual Test

```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"get_availability","sellerId":"seller_001","preferredDate":"2026-01-15"}' -ContentType "application/json"
```

### Expected Response

```json
{
  "success": true,
  "sellerId": "seller_001",
  "sellerName": "Manila Urban Farm",
  "totalSlots": 8,
  "availabilityByDate": {
    "2026-01-15": [
      {
        "slot_id": "uuid-here",
        "start_time": "09:00:00",
        "end_time": "10:00:00",
        "duration_minutes": 60
      }
    ]
  }
}
```

### Validation Checklist

- [ ] **Response time** - <1 second
- [ ] **Status code** - 200 OK
- [ ] **Slots returned** - At least 1 slot
- [ ] **Slot data complete** - slot_id, start_time, end_time present
- [ ] **Date filtered** - Only dates >= preferredDate
- [ ] **Sorted by time** - Earliest time first
- [ ] **No errors** - n8n execution successful

---

## 🧪 Test 3: Set Appointment

### Manual Test

```powershell
$appointmentBody = @{
  action = "set_appointment"
  buyerUid = "test_buyer_001"
  buyerName = "Test User"
  buyerEmail = "test@example.com"
  buyerPhone = "+63-999-999-9999"
  sellerUid = "seller_001"
  sellerName = "Manila Urban Farm"
  slotId = "REPLACE_WITH_REAL_SLOT_ID"  # Get from Test 2
  productType = "Oyster Mushroom"
  quantity = 10
  scheduledTime = "2026-01-15T10:00:00"
  location = "Manila"
  meetingType = "consultation"
  notes = "Test appointment"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body $appointmentBody -ContentType "application/json"
```

### Expected Response

```json
{
  "success": true,
  "appointmentId": "new-uuid-here",
  "appointment": {
    "id": "new-uuid-here",
    "buyer_uid": "test_buyer_001",
    "seller_uid": "seller_001",
    "product_type": "Oyster Mushroom",
    "status": "pending",
    "scheduled_time": "2026-01-15T10:00:00"
  },
  "message": "Appointment confirmed"
}
```

### Validation Checklist

- [ ] **Response time** - <2 seconds
- [ ] **Status code** - 200 OK
- [ ] **Appointment ID** - UUID returned
- [ ] **Status** - "pending" or "confirmed"
- [ ] **Database updated** - Run: `SELECT * FROM appointments WHERE buyer_uid='test_buyer_001';` → Returns 1 row
- [ ] **Slot marked unavailable** - Run: `SELECT is_available FROM availability_slots WHERE id='slot_id';` → Returns FALSE
- [ ] **Atomic transaction** - Both appointment + slot updated together
- [ ] **No errors** - n8n execution successful

---

## 🧪 Test 4: Get Appointments

### Manual Test

```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"get_appointments","userId":"test_buyer_001","userType":"buyer"}' -ContentType "application/json"
```

### Expected Response

```json
{
  "success": true,
  "userId": "test_buyer_001",
  "userType": "buyer",
  "totalAppointments": 1,
  "appointments": [
    {
      "id": "uuid-here",
      "buyer_name": "Test User",
      "seller_name": "Manila Urban Farm",
      "product_type": "Oyster Mushroom",
      "quantity_kg": 10,
      "scheduled_time": "2026-01-15T10:00:00",
      "status": "pending"
    }
  ]
}
```

### Validation Checklist

- [ ] **Response time** - <1 second
- [ ] **Status code** - 200 OK
- [ ] **Appointments returned** - At least 1 (from Test 3)
- [ ] **Data complete** - All expected fields present
- [ ] **Correct user** - Only appointments for test_buyer_001
- [ ] **Sorted by date** - Newest first (or oldest first, consistent)
- [ ] **No errors** - n8n execution successful

---

## 🧪 Test 5: Cancel Appointment

### Manual Test

```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"cancel_appointment","appointmentId":"APPOINTMENT_ID_FROM_TEST_3","cancelReason":"Testing cancellation"}' -ContentType "application/json"
```

### Expected Response

```json
{
  "success": true,
  "status": "cancelled",
  "appointmentId": "uuid-here",
  "slotReleased": {
    "slotId": "slot-uuid-here",
    "nowAvailable": true
  }
}
```

### Validation Checklist

- [ ] **Response time** - <1 second
- [ ] **Status code** - 200 OK
- [ ] **Status** - "cancelled"
- [ ] **Slot released** - nowAvailable: true
- [ ] **Database updated** - Run: `SELECT status FROM appointments WHERE id='appointment_id';` → Returns "cancelled"
- [ ] **Slot available** - Run: `SELECT is_available FROM availability_slots WHERE appointment_id='appointment_id';` → Returns TRUE
- [ ] **Atomic transaction** - Both appointment + slot updated together
- [ ] **No errors** - n8n execution successful

---

## ✅ Automated Test Suite

### Run All Tests

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-007-postgresql-n8n"
.\test-neon-workflow.ps1
```

### Expected Output

```
🧪 MASH PostgreSQL Appointment System - Test Suite
=================================================

✅ n8n server is running

🧪 Test 1: Find Sellers (AI matching)
Request: Find sellers for Oyster Mushroom, 10kg, Manila
✅ PASS - Found 3 sellers
   Top seller: Manila Urban Farm - Rating: 4.8

🧪 Test 2: Get Availability
Request: Get available slots for seller_001 on 2026-01-15
✅ PASS - Found 8 available slots
   Date: 2026-01-15 - Slot ID: abc-123-uuid

🧪 Test 3: Set Appointment
Request: Create appointment for test user
✅ PASS - Appointment created
   Appointment ID: def-456-uuid
   Status: pending

🧪 Test 4: Get Appointments
Request: Get all appointments for buyer_test_999
✅ PASS - Found 1 appointments
   Latest: Oyster Mushroom with Manila Urban Farm

🧪 Test 5: Cancel Appointment
Request: Cancel appointment def-456-uuid
✅ PASS - Appointment cancelled
   Status: cancelled
   Slot released: true

=================================================
🎉 Test Suite Complete!

Summary:
  ✅ Test 1: Find Sellers (AI matching)
  ✅ Test 2: Get Availability (Query slots)
  ✅ Test 3: Set Appointment (Create booking)
  ✅ Test 4: Get Appointments (History)
  ✅ Test 5: Cancel Appointment (Release slot)

All tests passed! 🚀
```

### Checklist

- [ ] **All 5 tests pass** - Green checkmarks
- [ ] **No errors** - No red "FAIL" messages
- [ ] **Data persists** - Check Neon console for new rows
- [ ] **n8n executions** - 5 successful executions visible in sidebar

---

## 🔍 Deep Validation

### Database Integrity

```sql
-- Run in Neon SQL Editor

-- Check referential integrity
SELECT 
  a.id,
  a.buyer_name,
  a.seller_uid,
  g.name AS seller_name_from_growers
FROM appointments a
LEFT JOIN growers g ON a.seller_uid = g.user_uid
WHERE g.name IS NULL;
-- Expected: 0 rows (all appointments have valid sellers)

-- Check availability consistency
SELECT 
  a.id AS slot_id,
  a.is_available,
  a.appointment_id,
  p.id AS appointment_exists
FROM availability_slots a
LEFT JOIN appointments p ON a.appointment_id = p.id
WHERE a.is_available = FALSE AND p.id IS NULL;
-- Expected: 0 rows (all booked slots have appointments)

-- Check appointment counts by status
SELECT status, COUNT(*) as count
FROM appointments
GROUP BY status;
-- Expected: pending: X, confirmed: Y, cancelled: Z
```

### Validation Checklist

- [ ] **No orphaned appointments** - All seller_uid FK valid
- [ ] **No orphaned slots** - All appointment_id FK valid
- [ ] **Consistent availability** - is_available matches appointment existence
- [ ] **No duplicate bookings** - No two active appointments for same slot

---

## 🚨 Error Scenarios

### Test Error Handling

1. **Invalid Slot ID**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"set_appointment","slotId":"invalid-uuid",...}' -ContentType "application/json"
   ```
   - [ ] **Expected:** Error response with message "Slot not found" or "Slot no longer available"

2. **Double Booking**
   - Create appointment for slot A
   - Try creating another appointment for same slot A
   - [ ] **Expected:** Error "Slot no longer available"

3. **Cancel Non-Existent**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"cancel_appointment","appointmentId":"invalid-uuid"}' -ContentType "application/json"
   ```
   - [ ] **Expected:** Error "Appointment not found"

---

## 📊 Performance Benchmarks

### Response Times

- [ ] **Find Sellers** - <2 seconds (AI processing)
- [ ] **Get Availability** - <500ms (simple query)
- [ ] **Set Appointment** - <1 second (transaction)
- [ ] **Cancel Appointment** - <500ms (update)
- [ ] **Get Appointments** - <500ms (query)

### Load Testing (Optional)

```powershell
# Run 10 concurrent find_sellers requests
1..10 | ForEach-Object -Parallel {
  Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"location":"Manila"}' -ContentType "application/json"
} -ThrottleLimit 10
```

- [ ] **All requests succeed** - No timeouts
- [ ] **Response times consistent** - <3 seconds each
- [ ] **No database locks** - No "deadlock" errors

---

## ✅ Final Sign-Off

### System Ready for Production When:

- [ ] **All 5 tests pass** - 100% success rate
- [ ] **No errors in n8n** - Last 10 executions all green
- [ ] **Database integrity** - All FK constraints valid
- [ ] **Performance acceptable** - Response times <2 seconds
- [ ] **Error handling works** - Invalid inputs return proper errors
- [ ] **Frontend integrated** - AppointmentWidget connects successfully
- [ ] **Documentation reviewed** - Team understands system

---

## 📝 Test Results Log

**Date:** ___________  
**Tester:** ___________

### Test Summary

| Test | Status | Response Time | Notes |
|------|--------|---------------|-------|
| Find Sellers | ☐ Pass ☐ Fail | _____ ms | |
| Get Availability | ☐ Pass ☐ Fail | _____ ms | |
| Set Appointment | ☐ Pass ☐ Fail | _____ ms | |
| Get Appointments | ☐ Pass ☐ Fail | _____ ms | |
| Cancel Appointment | ☐ Pass ☐ Fail | _____ ms | |

### Issues Found

1. _______________________________________
2. _______________________________________
3. _______________________________________

### Recommendations

1. _______________________________________
2. _______________________________________
3. _______________________________________

---

**Testing complete? Move to production deployment!** 🚀

See [IMPORT-WORKFLOW-GUIDE.md](IMPORT-WORKFLOW-GUIDE.md) Section "Deploy to Production" for next steps.
