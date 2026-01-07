# AI-006: n8n Appointment Workflow

**Status:** 🟡 In Progress  
**Started:** January 8, 2026  
**Estimated Time:** 2-3 hours  
**Story Points:** 13

---

## Overview

Build the n8n workflow that connects the frontend AppointmentWidget (AI-004) to Firebase collections (AI-005) using Ollama AI (AI-003) for intelligent seller matching.

This workflow processes 5 webhook actions that handle the complete appointment lifecycle.

---

## Architecture

```
Frontend Widget (AI-004)
    ↓ HTTP POST
n8n Webhook (:5678/webhook/mash-appointments)
    ↓
Action Router (Switch node)
    ├→ find_sellers → Ollama AI + Firebase query
    ├→ get_availability → Firebase query
    ├→ set_appointment → Firebase write + Email
    ├→ cancel_appointment → Firebase update + Email
    └→ get_appointments → Firebase query
```

---

## 5 Webhook Actions

### 1. find_sellers
**Input:**
```json
{
  "action": "find_sellers",
  "productType": "Oyster Mushroom",
  "quantity": 10,
  "buyerLocation": "Manila",
  "preferredDate": "2026-01-15"
}
```

**Process:**
1. Query `growers` collection for sellers specializing in productType
2. Query `availability_slots` for sellers with available slots near preferredDate
3. Pass seller data + buyer request to Ollama AI for intelligent matching
4. Return top 3 recommended sellers with next 3 available slots each

**Output:**
```json
{
  "success": true,
  "sellers": [
    {
      "id": "seller_juan_farm_001",
      "name": "Juan's Farm",
      "specialty": ["Oyster", "King Oyster"],
      "location": { "city": "Quezon City", "distance": 15 },
      "rating": 4.8,
      "capacity": "50kg/week",
      "availableSlots": [
        { "date": "2026-01-10", "time": "09:00", "available": true, "isRecommended": true },
        { "date": "2026-01-10", "time": "09:30", "available": true },
        { "date": "2026-01-10", "time": "10:00", "available": true }
      ]
    }
  ]
}
```

---

### 2. get_availability
**Input:**
```json
{
  "action": "get_availability",
  "sellerId": "seller_juan_farm_001",
  "numDays": 7
}
```

**Process:**
1. Query `availability_slots` collection
2. Filter by sellerId, is_available=true, next numDays
3. Group by date, order by time
4. Return formatted slots

**Output:**
```json
{
  "success": true,
  "slots": [
    { "date": "2026-01-10", "time": "09:00", "available": true },
    { "date": "2026-01-10", "time": "09:30", "available": true }
  ]
}
```

---

### 3. set_appointment
**Input:**
```json
{
  "action": "set_appointment",
  "sellerId": "seller_juan_farm_001",
  "sellerName": "Juan's Farm",
  "sellerEmail": "juan@example.com",
  "buyerUid": "buyer123",
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "buyerPhone": "+639123456789",
  "buyerLocation": "Manila",
  "productType": "Oyster Mushroom",
  "quantity": 10,
  "scheduledDate": "2026-01-10",
  "scheduledTime": "09:00",
  "specialRequests": "Please call before delivery"
}
```

**Process:**
1. Find the availability_slot document for this seller + date + time
2. Check if slot is still available
3. Create appointment document in `appointments` collection
4. Update availability_slot: set is_available=false, add appointmentId
5. Send confirmation emails to buyer and seller
6. Return success with appointmentId

**Output:**
```json
{
  "success": true,
  "appointmentId": "appt_abc123",
  "message": "Appointment confirmed",
  "emailSent": true
}
```

---

### 4. cancel_appointment
**Input:**
```json
{
  "action": "cancel_appointment",
  "appointmentId": "appt_abc123",
  "buyerUid": "buyer123",
  "cancellationReason": "Schedule conflict"
}
```

**Process:**
1. Query appointment document
2. Verify buyerUid matches (authorization)
3. Update appointment: status='cancelled', cancelled_at=now, cancellation_reason
4. Find related availability_slot
5. Update slot: is_available=true, remove appointmentId
6. Send cancellation emails to buyer and seller

**Output:**
```json
{
  "success": true,
  "message": "Appointment cancelled",
  "emailSent": true
}
```

---

### 5. get_appointments
**Input:**
```json
{
  "action": "get_appointments",
  "buyerUid": "buyer123"
}
```

**Process:**
1. Query `appointments` collection where buyer_uid == buyerUid
2. Order by scheduled_time DESC
3. Return array of appointments

**Output:**
```json
{
  "success": true,
  "appointments": [
    {
      "appointmentId": "appt_abc123",
      "sellerName": "Juan's Farm",
      "productType": "Oyster Mushroom",
      "quantity": 10,
      "scheduledDate": "2026-01-10",
      "scheduledTime": "09:00",
      "status": "confirmed",
      "createdAt": "2026-01-08T10:00:00Z"
    }
  ]
}
```

---

## n8n Workflow Structure

### Nodes:

1. **Webhook Trigger** - Receives POST requests at `/webhook/mash-appointments`
2. **Action Router (Switch)** - Routes based on `action` field (5 branches)
3. **Find Sellers Branch:**
   - Firebase: Query growers collection
   - Firebase: Query availability_slots
   - Ollama AI: Intelligent matching
   - Function: Format response
4. **Get Availability Branch:**
   - Firebase: Query availability_slots
   - Function: Format slots by date
5. **Set Appointment Branch:**
   - Firebase: Check slot availability
   - Firebase: Create appointment document
   - Firebase: Update availability_slot
   - Gmail: Send confirmation emails
   - Function: Format response
6. **Cancel Appointment Branch:**
   - Firebase: Get appointment document
   - Function: Verify authorization
   - Firebase: Update appointment (cancelled)
   - Firebase: Free up availability_slot
   - Gmail: Send cancellation emails
7. **Get Appointments Branch:**
   - Firebase: Query appointments by buyer_uid
   - Function: Format response
8. **Error Handler** - Catch errors, return proper HTTP responses

---

## Testing

After building workflow, test each action:

```bash
# Test 1: Find Sellers
curl -X POST http://localhost:5678/webhook/mash-appointments \
  -H "Content-Type: application/json" \
  -d '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"buyerLocation":"Manila"}'

# Test 2: Get Availability
curl -X POST http://localhost:5678/webhook/mash-appointments \
  -H "Content-Type: application/json" \
  -d '{"action":"get_availability","sellerId":"seller_juan_farm_001","numDays":7}'

# Test 3: Set Appointment (use real data from tests 1-2)
curl -X POST http://localhost:5678/webhook/mash-appointments \
  -H "Content-Type: application/json" \
  -d '{"action":"set_appointment","sellerId":"seller_juan_farm_001",...}'

# Test 4: Get Appointments
curl -X POST http://localhost:5678/webhook/mash-appointments \
  -H "Content-Type: application/json" \
  -d '{"action":"get_appointments","buyerUid":"buyer_test_001"}'

# Test 5: Cancel Appointment
curl -X POST http://localhost:5678/webhook/mash-appointments \
  -H "Content-Type: application/json" \
  -d '{"action":"cancel_appointment","appointmentId":"appt_xxx","buyerUid":"buyer_test_001"}'
```

---

## Success Criteria

- [ ] All 5 actions respond with valid JSON
- [ ] Find sellers returns 3 matched sellers with slots
- [ ] Set appointment creates document + updates slot + sends emails
- [ ] Cancel appointment frees slot + sends emails
- [ ] Get appointments returns user's appointments
- [ ] Error handling returns proper HTTP status codes
- [ ] Response time <3 seconds for all actions (except AI matching <5s)
- [ ] Frontend widget can call all 5 actions successfully

---

## Next Steps After AI-006

1. **Test End-to-End:** Frontend → n8n → Firebase → Email
2. **AI-007:** Seller Availability Management dashboard
3. **AI-008:** Buyer Appointment Dashboard

---

## Dependencies Met

✅ AI-002: n8n running at localhost:5678  
✅ AI-003: Ollama API at localhost:11434  
✅ AI-004: Frontend widget with useAppointments hook  
✅ AI-005: Firebase collections (availability_slots + appointments) deployed
