# AI-006 Workflow Build Guide

**IMPORTANT:** This is a step-by-step guide for building the n8n workflow in the UI at http://localhost:5678

---

## 🎯 Phase 1: Workflow Setup (15 min)

### Step 1: Create New Workflow

1. Click **"+ Add workflow"** button (top right)
2. Click the workflow name "My workflow" → Rename to **"MASH Appointment Booking"**
3. Click **Save** (Ctrl+S)

### Step 2: Add Webhook Trigger

1. Click **"+"** button on canvas
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure:
   - **HTTP Method:** POST
   - **Path:** `mash-appointments`
   - **Authentication:** None
   - **Response Mode:** When Last Node Finishes
   - **Response Code:** 200
5. Click **"Execute Node"** to get the webhook URL
6. **Copy the URL** (should be: `http://localhost:5678/webhook/mash-appointments`)

### Step 3: Add Switch Node (Action Router)

1. Click **"+"** on the Webhook node output
2. Search for **"Switch"**
3. Select **"Switch"** node
4. Configure 5 routes:

   **Route 1:**
   - Value 1: `={{$json.action}}`
   - Operation: Equal
   - Value 2: `find_sellers`

   **Route 2:**
   - Value 1: `={{$json.action}}`
   - Operation: Equal
   - Value 2: `get_availability`

   **Route 3:**
   - Value 1: `={{$json.action}}`
   - Operation: Equal
   - Value 2: `set_appointment`

   **Route 4:**
   - Value 1: `={{$json.action}}`
   - Operation: Equal
   - Value 2: `cancel_appointment`

   **Route 5:**
   - Value 1: `={{$json.action}}`
   - Operation: Equal
   - Value 2: `get_appointments`

5. Click **"Add Routing Rule"** for each route

### Step 4: Test Basic Routing

1. Click **"Execute Workflow"** button
2. Test with curl:
   ```bash
   curl -X POST http://localhost:5678/webhook/mash-appointments \
     -H "Content-Type: application/json" \
     -d '{"action":"find_sellers","test":"phase1"}'
   ```
3. Verify Switch node activates the correct output
4. **Save workflow** (Ctrl+S)

**✅ Phase 1 Complete - Switch routing working**

---

## 🔍 Phase 2: find_sellers Action (40 min)

### Branch 1: Query Growers Collection

1. From **Switch output 0** (find_sellers), click **"+"**
2. Search for **"Firebase Firestore"**
3. Select **"Firebase Firestore"** node
4. Name: `Query Growers`
5. Configure:
   - **Credential:** Click "Create New Credential"
     - **Database URL:** `https://mash-ddf8d.firebaseio.com`
     - **Project ID:** `mash-ddf8d`
     - **Service Account:** Upload `mash-ddf8d-firebase-adminsdk-credentials.json`
   - **Operation:** Get Documents (Query)
   - **Collection:** `growers`
   - **Add Filter:**
     - Field: `role`
     - Operator: `==`
     - Value: `SELLER`
   - **Return Fields:** Select fields: `businessName, specialty, location, rating, capacity`

### Branch 2: Query Availability Slots

1. From **Query Growers** output, click **"+"**
2. Add another **"Firebase Firestore"** node
3. Name: `Query Availability`
4. Configure:
   - **Operation:** Get Documents (Query)
   - **Collection:** `availability_slots`
   - **Add Filter 1:**
     - Field: `is_available`
     - Operator: `==`
     - Value: `true`
   - **Add Filter 2:**
     - Field: `available_date`
     - Operator: `>=`
     - Value: `={{$json.preferredDate || $today}}`
   - **Order By:** `available_date` ASC
   - **Limit:** 100

### Branch 3: Call Ollama AI

1. From **Query Availability** output, click **"+"**
2. Search for **"HTTP Request"**
3. Name: `Ollama AI Matching`
4. Configure:
   - **Method:** POST
   - **URL:** `http://host.docker.internal:11434/api/generate`
   - **Headers:**
     - Name: `Content-Type`
     - Value: `application/json`
   - **Body:**
     ```json
     {
       "model": "llama3.2:latest",
       "prompt": "You are a seller matching AI. Analyze this buyer request and recommend the top 3 best matching sellers.\n\nBuyer Request:\n- Product: {{$json.productType}}\n- Quantity: {{$json.quantity}}kg\n- Location: {{$json.buyerLocation}}\n- Preferred Date: {{$json.preferredDate}}\n\nAvailable Sellers:\n{{$node[\"Query Growers\"].json}}\n\nAvailability:\n{{$node[\"Query Availability\"].json}}\n\nReturn ONLY a JSON object with this structure:\n{\"recommendations\": [{\"seller_id\": \"xxx\", \"reason\": \"why this seller\", \"score\": 0-100}]}\n\nConsider: product specialty match, distance, availability, capacity, rating.",
       "stream": false
     }
     ```

### Branch 4: Merge and Format

1. From **Ollama AI Matching** output, click **"+"**
2. Search for **"Code"** node
3. Name: `Format Sellers Response`
4. Configure:
   - **Mode:** Run Once for All Items
   - **Language:** JavaScript
   - **Code:**
     ```javascript
     // Get data from previous nodes
     const growers = $node["Query Growers"].json;
     const availability = $node["Query Availability"].json;
     const aiResponse = $json.response;
     
     // Parse Ollama AI response
     let recommendations;
     try {
       const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
       recommendations = jsonMatch ? JSON.parse(jsonMatch[0]).recommendations : [];
     } catch (e) {
       recommendations = [];
     }
     
     // Build seller objects
     const sellers = recommendations.slice(0, 3).map(rec => {
       const grower = growers.find(g => g.id === rec.seller_id);
       if (!grower) return null;
       
       // Get next 3 available slots for this seller
       const sellerSlots = availability
         .filter(slot => slot.seller_uid === grower.id)
         .slice(0, 3)
         .map(slot => ({
           date: slot.available_date,
           time: slot.start_time,
           available: slot.is_available,
           isRecommended: false
         }));
       
       if (sellerSlots.length > 0) sellerSlots[0].isRecommended = true;
       
       return {
         id: grower.id,
         name: grower.businessName,
         specialty: grower.specialty || [],
         location: grower.location || {},
         rating: grower.rating || 4.5,
         capacity: grower.capacity || "Unknown",
         matchReason: rec.reason,
         matchScore: rec.score,
         availableSlots: sellerSlots
       };
     }).filter(Boolean);
     
     return [{ 
       json: { 
         success: true, 
         sellers: sellers,
         count: sellers.length
       } 
     }];
     ```

5. **Test find_sellers:**
   ```bash
   curl -X POST http://localhost:5678/webhook/mash-appointments \
     -H "Content-Type: application/json" \
     -d '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"buyerLocation":"Manila","preferredDate":"2026-01-15"}'
   ```

**✅ Phase 2 Complete - find_sellers returns 3 sellers with slots**

---

## 📅 Phase 3: get_availability Action (20 min)

### Branch 1: Query Slots

1. From **Switch output 1** (get_availability), click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Query Seller Slots`
4. Configure:
   - **Operation:** Get Documents (Query)
   - **Collection:** `availability_slots`
   - **Add Filter 1:**
     - Field: `seller_uid`
     - Operator: `==`
     - Value: `={{$json.sellerId}}`
   - **Add Filter 2:**
     - Field: `is_available`
     - Operator: `==`
     - Value: `true`
   - **Add Filter 3:**
     - Field: `available_date`
     - Operator: `>=`
     - Value: `={{$today}}`
   - **Order By:** `available_date` ASC, then `start_time` ASC
   - **Limit:** `={{$json.numDays * 16 || 21}}`

### Branch 2: Format Slots

1. From **Query Seller Slots** output, click **"+"**
2. Add **"Code"** node
3. Name: `Format Slots by Date`
4. Configure:
   - **Mode:** Run Once for All Items
   - **Language:** JavaScript
   - **Code:**
     ```javascript
     const slots = $input.all().map(item => item.json);
     
     // Group by date
     const groupedByDate = {};
     slots.forEach(slot => {
       const date = slot.available_date;
       if (!groupedByDate[date]) {
         groupedByDate[date] = [];
       }
       groupedByDate[date].push({
         time: slot.start_time,
         available: slot.is_available
       });
     });
     
     // Convert to array format
     const formattedSlots = Object.keys(groupedByDate)
       .sort()
       .map(date => ({
         date: date,
         slots: groupedByDate[date]
       }));
     
     return [{ 
       json: { 
         success: true, 
         slots: formattedSlots,
         totalSlots: slots.length
       } 
     }];
     ```

5. **Test get_availability:**
   ```bash
   curl -X POST http://localhost:5678/webhook/mash-appointments \
     -H "Content-Type: application/json" \
     -d '{"action":"get_availability","sellerId":"seller_juan_farm_001","numDays":7}'
   ```

**✅ Phase 3 Complete - get_availability returns grouped slots**

---

## ✅ Phase 4: set_appointment Action (50 min)

### Branch 1: Check Slot Availability

1. From **Switch output 2** (set_appointment), click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Check Slot`
4. Configure:
   - **Operation:** Get Documents (Query)
   - **Collection:** `availability_slots`
   - **Add Filter 1:**
     - Field: `seller_uid`
     - Operator: `==`
     - Value: `={{$json.sellerId}}`
   - **Add Filter 2:**
     - Field: `available_date`
     - Operator: `==`
     - Value: `={{$json.scheduledDate}}`
   - **Add Filter 3:**
     - Field: `start_time`
     - Operator: `==`
     - Value: `={{$json.scheduledTime}}`
   - **Limit:** 1

### Branch 2: Verify Available

1. From **Check Slot** output, click **"+"**
2. Add **"IF"** node
3. Name: `Verify Slot Available`
4. Configure:
   - **Condition:**
     - Value 1: `={{$json.is_available}}`
     - Operation: `Boolean`
     - Value 2: `true`

### Branch 3a: Create Appointment (True branch)

1. From **IF true** output, click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Create Appointment`
4. Configure:
   - **Operation:** Create Document
   - **Collection:** `appointments`
   - **Document ID:** Leave empty (auto-generate)
   - **Fields to Send:** Define Fields
   - **Add Fields:**
     ```
     buyer_uid: {{$json.buyerUid}}
     buyer_name: {{$json.buyerName}}
     buyer_email: {{$json.buyerEmail}}
     buyer_phone: {{$json.buyerPhone}}
     buyer_location: {{$json.buyerLocation}}
     seller_uid: {{$json.sellerId}}
     seller_name: {{$json.sellerName}}
     seller_email: {{$json.sellerEmail}}
     product_type: {{$json.productType}}
     quantity: {{$json.quantity}}
     scheduled_date: {{$json.scheduledDate}}
     scheduled_time: {{$json.scheduledTime}}
     status: pending
     special_requests: {{$json.specialRequests}}
     created_at: {{$now}}
     updated_at: {{$now}}
     ```

### Branch 4: Update Slot (Mark Unavailable)

1. From **Create Appointment** output, click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Update Slot`
4. Configure:
   - **Operation:** Update Document
   - **Collection:** `availability_slots`
   - **Document ID:** `={{$node["Check Slot"].json.id}}`
   - **Fields to Send:** Define Fields
   - **Add Fields:**
     ```
     is_available: false
     appointment_id: {{$node["Create Appointment"].json.id}}
     updated_at: {{$now}}
     ```

### Branch 5: Send Buyer Email

1. From **Update Slot** output, click **"+"**
2. Add **"Gmail"** node
3. Name: `Email to Buyer`
4. Configure:
   - **Credential:** Create Gmail OAuth2 credential
   - **Resource:** Message
   - **Operation:** Send
   - **To:** `={{$json.buyerEmail}}`
   - **Subject:** `Appointment Confirmed - {{$json.productType}}`
   - **Email Type:** HTML
   - **Message:**
     ```html
     <h2>Appointment Confirmed!</h2>
     <p>Hi {{$json.buyerName}},</p>
     <p>Your appointment has been confirmed with <strong>{{$json.sellerName}}</strong>.</p>
     
     <h3>Appointment Details:</h3>
     <ul>
       <li><strong>Product:</strong> {{$json.productType}}</li>
       <li><strong>Quantity:</strong> {{$json.quantity}}kg</li>
       <li><strong>Date:</strong> {{$json.scheduledDate}}</li>
       <li><strong>Time:</strong> {{$json.scheduledTime}}</li>
       <li><strong>Seller:</strong> {{$json.sellerName}}</li>
       <li><strong>Seller Email:</strong> {{$json.sellerEmail}}</li>
     </ul>
     
     <p><strong>Special Requests:</strong> {{$json.specialRequests}}</p>
     
     <p>Please arrive on time. If you need to cancel, please do so at least 24 hours in advance.</p>
     
     <p>Thank you,<br/>MASH Team</p>
     ```

### Branch 6: Send Seller Email

1. From **Email to Buyer** output, click **"+"**
2. Add **"Gmail"** node
3. Name: `Email to Seller`
4. Configure:
   - **To:** `={{$json.sellerEmail}}`
   - **Subject:** `New Appointment - {{$json.productType}}`
   - **Email Type:** HTML
   - **Message:**
     ```html
     <h2>New Appointment Booked</h2>
     <p>Hi {{$json.sellerName}},</p>
     <p>A new appointment has been booked with you.</p>
     
     <h3>Appointment Details:</h3>
     <ul>
       <li><strong>Buyer:</strong> {{$json.buyerName}}</li>
       <li><strong>Contact:</strong> {{$json.buyerEmail}}, {{$json.buyerPhone}}</li>
       <li><strong>Product:</strong> {{$json.productType}}</li>
       <li><strong>Quantity:</strong> {{$json.quantity}}kg</li>
       <li><strong>Date:</strong> {{$json.scheduledDate}}</li>
       <li><strong>Time:</strong> {{$json.scheduledTime}}</li>
       <li><strong>Buyer Location:</strong> {{$json.buyerLocation}}</li>
     </ul>
     
     <p><strong>Special Requests:</strong> {{$json.specialRequests}}</p>
     
     <p>Please prepare the order and contact the buyer if needed.</p>
     
     <p>Thank you,<br/>MASH Team</p>
     ```

### Branch 7: Format Success Response

1. From **Email to Seller** output, click **"+"**
2. Add **"Code"** node
3. Name: `Success Response`
4. Configure:
   - **Code:**
     ```javascript
     const appointmentId = $node["Create Appointment"].json.id;
     
     return [{ 
       json: { 
         success: true,
         appointmentId: appointmentId,
         message: "Appointment confirmed",
         emailSent: true
       } 
     }];
     ```

### Branch 3b: Slot Unavailable (False branch)

1. From **IF false** output, click **"+"**
2. Add **"Code"** node
3. Name: `Slot Unavailable Error`
4. Configure:
   - **Code:**
     ```javascript
     return [{ 
       json: { 
         success: false,
         error: "This time slot is no longer available",
         code: 409
       } 
     }];
     ```

5. **Test set_appointment:**
   ```bash
   curl -X POST http://localhost:5678/webhook/mash-appointments \
     -H "Content-Type: application/json" \
     -d '{
       "action":"set_appointment",
       "sellerId":"seller_juan_farm_001",
       "sellerName":"Juan'\''s Farm",
       "sellerEmail":"juan@example.com",
       "buyerUid":"buyer_test_001",
       "buyerName":"John Doe",
       "buyerEmail":"john@example.com",
       "buyerPhone":"+639123456789",
       "buyerLocation":"Manila",
       "productType":"Oyster Mushroom",
       "quantity":10,
       "scheduledDate":"2026-01-15",
       "scheduledTime":"09:00",
       "specialRequests":"Please call before delivery"
     }'
   ```

**✅ Phase 4 Complete - set_appointment creates appointment + sends emails**

---

## ❌ Phase 5: cancel_appointment Action (30 min)

### Branch 1: Get Appointment

1. From **Switch output 3** (cancel_appointment), click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Get Appointment`
4. Configure:
   - **Operation:** Get Document
   - **Collection:** `appointments`
   - **Document ID:** `={{$json.appointmentId}}`

### Branch 2: Verify Authorization

1. From **Get Appointment** output, click **"+"**
2. Add **"IF"** node
3. Name: `Verify Authorization`
4. Configure:
   - **Condition:**
     - Value 1: `={{$json.buyer_uid}}`
     - Operation: `Equal`
     - Value 2: `={{$node["Webhook"].json.body.buyerUid}}`

### Branch 3a: Update Appointment (True branch)

1. From **IF true** output, click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Cancel Appointment`
4. Configure:
   - **Operation:** Update Document
   - **Collection:** `appointments`
   - **Document ID:** `={{$node["Webhook"].json.body.appointmentId}}`
   - **Fields:**
     ```
     status: cancelled
     cancelled_at: {{$now}}
     cancellation_reason: {{$node["Webhook"].json.body.cancellationReason}}
     updated_at: {{$now}}
     ```

### Branch 4: Free Slot

1. From **Cancel Appointment** output, click **"+"**
2. Add **"Firebase Firestore"** node
3. Name: `Free Slot`
4. Configure:
   - **Operation:** Get Documents (Query)
   - **Collection:** `availability_slots`
   - **Add Filter:**
     - Field: `appointment_id`
     - Operator: `==`
     - Value: `={{$node["Webhook"].json.body.appointmentId}}`
   - Then connect to another Firebase node:
5. Add **"Firebase Firestore"** node
6. Name: `Update Slot to Available`
7. Configure:
   - **Operation:** Update Document
   - **Collection:** `availability_slots`
   - **Document ID:** `={{$node["Free Slot"].json[0].id}}`
   - **Fields:**
     ```
     is_available: true
     appointment_id: null
     updated_at: {{$now}}
     ```

### Branch 5: Send Cancellation Emails

1. Add **"Gmail"** nodes for buyer and seller (similar to Phase 4)
2. Update subjects and messages for cancellation

### Branch 3b: Unauthorized (False branch)

1. From **IF false** output, add error response

**✅ Phase 5 Complete - cancel_appointment frees slot + sends emails**

---

## 📋 Phase 6: get_appointments Action (15 min)

1. From **Switch output 4**, add Firebase Query node
2. Query appointments by buyer_uid
3. Format response

**✅ Phase 6 Complete - get_appointments returns list**

---

## 🛡️ Phase 7: Error Handling (20 min)

1. Add **"Error Trigger"** node
2. Connect to all branches
3. Add error formatting
4. Add HTTP Response node

**✅ Phase 7 Complete - Errors handled**

---

## 🧪 Phase 8: Testing (30 min)

Run all curl tests and verify:
- Firebase writes
- Email delivery
- Error handling

**✅ Phase 8 Complete - AI-006 DONE!**

---

## 💾 Export Workflow

When complete:
1. Click workflow menu (3 dots)
2. Select **"Download"**
3. Save as `mash-appointment-workflow.json`
4. Commit to `ai-automation-tasks/ai-006-n8n-workflow/`

---

## 🔗 Webhook URL

**Production URL:** `http://localhost:5678/webhook/mash-appointments`

Update frontend `.env.local`:
```
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/mash-appointments
```
