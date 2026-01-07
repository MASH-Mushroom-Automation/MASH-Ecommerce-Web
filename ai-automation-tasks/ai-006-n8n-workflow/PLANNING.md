# AI-006 Planning: n8n Appointment Workflow

**Goal:** Build the complete n8n workflow that handles 5 appointment actions via webhook

---

## Phase 1: Workflow Setup (15 min)

### Tasks:
1. Open n8n at http://localhost:5678
2. Create new workflow: "MASH Appointment Booking"
3. Add Webhook Trigger node
   - Method: POST
   - Path: `/webhook/mash-appointments`
   - Response Mode: When Last Node Finishes
4. Add Switch node after webhook
   - Routes based on `{{$json.action}}`
   - 5 outputs: find_sellers, get_availability, set_appointment, cancel_appointment, get_appointments
5. Save workflow

### Success Criteria:
- Webhook responds to POST requests
- Switch routes correctly based on action field
- Empty branches return basic test responses

---

## Phase 2: find_sellers Action (40 min)

### Tasks:
1. **Add HTTP Request node (Ollama)**
   - URL: `http://host.docker.internal:11434/api/generate`
   - Method: POST
   - Body:
     ```json
     {
       "model": "llama3.2:latest",
       "prompt": "Based on this buyer request: {{$json.productType}} ({{$json.quantity}}kg) near {{$json.buyerLocation}}, recommend the best matching sellers from this list: {{$json.sellers}}. Consider product specialty, distance, and capacity. Return JSON with 'recommendedSellers' array with 'id' and 'reason'.",
       "stream": false
     }
     ```

2. **Add Firebase node (Query growers)**
   - Collection: `growers`
   - Where: `role == 'SELLER'`
   - Select: id, businessName, specialty, location, rating, capacity

3. **Add Firebase node (Query availability)**
   - Collection: `availability_slots`
   - Where: `is_available == true AND available_date >= {{$json.preferredDate}}`
   - Group by: seller_uid
   - Limit: 3 slots per seller

4. **Add Function node (Merge & Format)**
   - Combine grower data + availability + Ollama recommendations
   - Calculate distances (Haversine formula)
   - Return top 3 sellers with slots

### Success Criteria:
- Returns 3 sellers with complete data
- Each seller has 3 available time slots
- Ollama AI provides matching reason
- Distance calculated correctly

---

## Phase 3: get_availability Action (20 min)

### Tasks:
1. **Add Firebase node (Query slots)**
   - Collection: `availability_slots`
   - Where: `seller_uid == {{$json.sellerId}} AND is_available == true AND available_date >= TODAY`
   - OrderBy: `available_date asc, start_time asc`
   - Limit: 21 (7 days × 3 slots)

2. **Add Function node (Format by date)**
   - Group slots by date
   - Format as `{date, slots: [{time, available}]}`
   - Return array

### Success Criteria:
- Returns up to 21 slots
- Grouped by date
- Sorted chronologically

---

## Phase 4: set_appointment Action (50 min)

### Tasks:
1. **Add Firebase node (Check slot)**
   - Collection: `availability_slots`
   - Where: `seller_uid == {{$json.sellerId}} AND available_date == {{$json.scheduledDate}} AND start_time == {{$json.scheduledTime}}`
   - Get single document

2. **Add IF node (Verify available)**
   - Condition: `{{$node["Check Slot"].json.is_available}} == true`
   - True: Continue
   - False: Return error

3. **Add Firebase node (Create appointment)**
   - Collection: `appointments`
   - Document ID: Auto-generate
   - Data:
     ```json
     {
       "buyer_uid": "{{$json.buyerUid}}",
       "buyer_name": "{{$json.buyerName}}",
       "buyer_email": "{{$json.buyerEmail}}",
       "buyer_phone": "{{$json.buyerPhone}}",
       "buyer_location": "{{$json.buyerLocation}}",
       "seller_uid": "{{$json.sellerId}}",
       "seller_name": "{{$json.sellerName}}",
       "seller_email": "{{$json.sellerEmail}}",
       "product_type": "{{$json.productType}}",
       "quantity": "{{$json.quantity}}",
       "scheduled_date": "{{$json.scheduledDate}}",
       "scheduled_time": "{{$json.scheduledTime}}",
       "status": "pending",
       "special_requests": "{{$json.specialRequests}}",
       "created_at": "{{$now}}",
       "updated_at": "{{$now}}"
     }
     ```

4. **Add Firebase node (Update slot)**
   - Collection: `availability_slots`
   - Document ID: `{{$node["Check Slot"].json.id}}`
   - Update:
     ```json
     {
       "is_available": false,
       "appointment_id": "{{$node["Create Appointment"].json.id}}",
       "updated_at": "{{$now}}"
     }
     ```

5. **Add Gmail node (Send to buyer)**
   - To: `{{$json.buyerEmail}}`
   - Subject: `Appointment Confirmed - {{$json.productType}}`
   - Body: Appointment details (seller, date, time, product, quantity)

6. **Add Gmail node (Send to seller)**
   - To: `{{$json.sellerEmail}}`
   - Subject: `New Appointment - {{$json.productType}}`
   - Body: Buyer details (name, phone, product, quantity, date, time)

7. **Add Function node (Format response)**
   - Return: `{success: true, appointmentId, message, emailSent: true}`

### Success Criteria:
- Appointment created in Firestore
- Slot marked unavailable
- 2 emails sent (buyer + seller)
- Returns appointmentId
- Handles double-booking error

---

## Phase 5: cancel_appointment Action (30 min)

### Tasks:
1. **Add Firebase node (Get appointment)**
   - Collection: `appointments`
   - Document ID: `{{$json.appointmentId}}`

2. **Add IF node (Verify authorization)**
   - Condition: `{{$node["Get Appointment"].json.buyer_uid}} == {{$json.buyerUid}}`
   - True: Continue
   - False: Return 403 Unauthorized

3. **Add Firebase node (Update appointment)**
   - Collection: `appointments`
   - Document ID: `{{$json.appointmentId}}`
   - Update:
     ```json
     {
       "status": "cancelled",
       "cancelled_at": "{{$now}}",
       "cancellation_reason": "{{$json.cancellationReason}}",
       "updated_at": "{{$now}}"
     }
     ```

4. **Add Firebase node (Free slot)**
   - Collection: `availability_slots`
   - Where: `appointment_id == {{$json.appointmentId}}`
   - Update:
     ```json
     {
       "is_available": true,
       "appointment_id": null,
       "updated_at": "{{$now}}"
     }
     ```

5. **Add Gmail nodes (Notify both parties)**
   - Buyer: "Appointment Cancelled"
   - Seller: "Appointment Cancelled by Buyer"

6. **Add Function node (Format response)**
   - Return: `{success: true, message, emailSent: true}`

### Success Criteria:
- Appointment status updated to cancelled
- Slot freed up for rebooking
- Emails sent to both parties
- Authorization check works

---

## Phase 6: get_appointments Action (15 min)

### Tasks:
1. **Add Firebase node (Query appointments)**
   - Collection: `appointments`
   - Where: `buyer_uid == {{$json.buyerUid}}`
   - OrderBy: `scheduled_time desc`
   - Limit: 50

2. **Add Function node (Format)**
   - Map to frontend format
   - Return: `{success: true, appointments: [...]}`

### Success Criteria:
- Returns all user appointments
- Sorted by date (newest first)
- Includes cancelled appointments
- Proper field mapping

---

## Phase 7: Error Handling (20 min)

### Tasks:
1. Add Error Trigger node
2. Connect to all branches
3. Add Function node (Format error)
   - Return: `{success: false, error: message, code: statusCode}`
4. Add Respond to Webhook node (error response)

### Success Criteria:
- All errors caught
- Proper HTTP status codes (400, 403, 404, 500)
- Descriptive error messages
- No unhandled rejections

---

## Phase 8: Testing & Documentation (30 min)

### Tasks:
1. Test each action with curl
2. Verify Firebase writes
3. Check email delivery
4. Test error cases (missing fields, invalid IDs, double booking)
5. Document API in README.md
6. Update PROGRESS.md to 100%
7. Create TESTING.md with test results
8. Create PR_GUIDE.md

### Success Criteria:
- All 5 actions work end-to-end
- Error handling tested
- Documentation complete
- Ready for frontend integration

---

## Time Estimate

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| 1. Setup | 15 min | | |
| 2. find_sellers | 40 min | | |
| 3. get_availability | 20 min | | |
| 4. set_appointment | 50 min | | |
| 5. cancel_appointment | 30 min | | |
| 6. get_appointments | 15 min | | |
| 7. Error Handling | 20 min | | |
| 8. Testing & Docs | 30 min | | |
| **Total** | **3h 40min** | | |

---

## Next Steps After Completion

1. Update frontend useAppointments hook with n8n webhook URL
2. Test end-to-end flow from product page
3. Monitor n8n execution logs
4. Create AI-007: Seller Availability Dashboard
