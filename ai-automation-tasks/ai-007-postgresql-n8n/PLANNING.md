# AI-007: Complete Appointment System with Neon PostgreSQL + n8n + AI

> **Database:** Neon PostgreSQL (Cloud-hosted, managed)  
> **Automation:** n8n (Self-hosted via Docker)  
> **AI:** Ollama Llama 3.2 3B (Local)  
> **Frontend:** Next.js 16 + AppointmentWidget  
> **Estimated Time:** 8-12 hours  
> **Story Points:** 21

---

## 🎯 Project Overview

Build a **complete AI-powered appointment system** that connects mushroom buyers directly to growers using:
- **Neon PostgreSQL** for all appointment/availability data (cloud-hosted, serverless)
- **n8n workflows** for appointment logic (5 actions via single webhook)
- **Ollama AI** for intelligent seller matching based on location/product/capacity
- **Next.js frontend** with beautiful booking widget

### Why Neon PostgreSQL?

✅ **Cloud-hosted** - No local database management  
✅ **Serverless** - Auto-scaling, pay per use  
✅ **Fast** - Connection pooling built-in  
✅ **Free tier** - 512MB storage, 1 project  
✅ **SQL-native** - Familiar queries, complex joins  
✅ **Backups** - Automatic point-in-time recovery

---

## 📊 Database Schema (PostgreSQL)

### Table: `growers` (Seller Profiles)

```sql
CREATE TABLE growers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid VARCHAR(255) NOT NULL UNIQUE, -- Firebase Auth UID
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(255), -- e.g., "Oyster Mushrooms, Shiitake"
  location VARCHAR(255), -- e.g., "Manila, Philippines"
  capacity_kg INTEGER DEFAULT 100, -- Weekly capacity
  rating DECIMAL(3,2) DEFAULT 4.5,
  role VARCHAR(50) DEFAULT 'SELLER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_growers_role ON growers(role);
CREATE INDEX idx_growers_location ON growers(location);
```

### Table: `availability_slots` (Seller Time Slots)

```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_uid VARCHAR(255) NOT NULL REFERENCES growers(user_uid) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_available BOOLEAN DEFAULT TRUE,
  booked_by VARCHAR(255), -- Buyer Firebase UID
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_availability_seller ON availability_slots(seller_uid);
CREATE INDEX idx_availability_date ON availability_slots(available_date);
CREATE INDEX idx_availability_status ON availability_slots(is_available, available_date);
```

### Table: `appointments` (Bookings)

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_uid VARCHAR(255) NOT NULL, -- Firebase Auth UID
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(50),
  seller_uid VARCHAR(255) NOT NULL REFERENCES growers(user_uid),
  seller_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(255), -- e.g., "Oyster Mushroom"
  quantity_kg INTEGER,
  scheduled_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending | confirmed | cancelled | completed
  meeting_type VARCHAR(50) DEFAULT 'consultation', -- consultation | farm_tour | bulk_order
  notes TEXT,
  cancel_reason TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_buyer ON appointments(buyer_uid);
CREATE INDEX idx_appointments_seller ON appointments(seller_uid);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_time);
```

---

## 🚀 Phase-by-Phase Implementation Plan

### Phase 1: Database Setup (1-2 hours)

**Goal:** Create PostgreSQL tables in Neon with seed data

#### Tasks:

1. **Access Neon Console**
   - Go to https://console.neon.tech
   - Select project "Namias"
   - Open SQL Editor

2. **Create Tables**
   ```sql
   -- Run the 3 CREATE TABLE statements above
   -- Run all CREATE INDEX statements
   ```

3. **Seed Growers Data**
   ```sql
   INSERT INTO growers (user_uid, name, email, phone, specialty, location, capacity_kg, rating, role) VALUES
   ('seller_001', 'Manila Urban Farm', 'manila@mashfarm.com', '+63-912-345-6789', 'Oyster Mushrooms, King Oyster', 'Manila, Philippines', 150, 4.8, 'SELLER'),
   ('seller_002', 'Quezon City Growers', 'quezon@mashfarm.com', '+63-917-234-5678', 'Shiitake, Lion''s Mane', 'Quezon City, Philippines', 100, 4.6, 'SELLER'),
   ('seller_003', 'Makati Mushroom Co', 'makati@mashfarm.com', '+63-920-345-6789', 'All Mushroom Types', 'Makati, Philippines', 200, 4.9, 'SELLER');
   ```

4. **Seed Availability Slots** (672 slots = 3 sellers × 7 days × 4 hours × 8 time slots)
   ```sql
   -- Generate slots for next 7 days, 9AM-5PM, 1-hour slots
   INSERT INTO availability_slots (seller_uid, available_date, start_time, end_time, duration_minutes, is_available)
   SELECT 
     seller_uid,
     (CURRENT_DATE + d.day) AS available_date,
     (t.hour || ':00:00')::TIME AS start_time,
     (t.hour + 1 || ':00:00')::TIME AS end_time,
     60,
     TRUE
   FROM (VALUES ('seller_001'), ('seller_002'), ('seller_003')) AS s(seller_uid)
   CROSS JOIN generate_series(0, 6) AS d(day)
   CROSS JOIN generate_series(9, 16) AS t(hour);
   ```

5. **Seed Sample Appointments**
   ```sql
   INSERT INTO appointments (buyer_uid, buyer_name, buyer_email, buyer_phone, seller_uid, seller_name, product_type, quantity_kg, scheduled_time, location, status, meeting_type, notes) VALUES
   ('buyer_test_001', 'Juan Dela Cruz', 'juan@example.com', '+63-915-123-4567', 'seller_001', 'Manila Urban Farm', 'Oyster Mushroom', 10, '2026-01-15 10:00:00', 'Manila', 'confirmed', 'consultation', 'Interested in regular supply'),
   ('buyer_test_002', 'Maria Santos', 'maria@example.com', '+63-916-234-5678', 'seller_002', 'Quezon City Growers', 'Shiitake Mushroom', 5, '2026-01-20 14:00:00', 'Quezon City', 'pending', 'farm_tour', 'Want to see growing facility');
   ```

6. **Verify Data**
   ```sql
   SELECT COUNT(*) FROM growers; -- Should be 3
   SELECT COUNT(*) FROM availability_slots; -- Should be 672
   SELECT COUNT(*) FROM appointments; -- Should be 2
   ```

**Deliverables:**
- [x] 3 tables created with indexes
- [x] 3 growers seeded
- [x] 672 availability slots seeded
- [x] 2 sample appointments seeded

**Validation:**
```sql
-- Test query: Find available slots for seller_001 on Jan 15, 2026
SELECT * FROM availability_slots 
WHERE seller_uid = 'seller_001' 
  AND available_date = '2026-01-15' 
  AND is_available = TRUE
ORDER BY start_time;
```

---

### Phase 2: n8n PostgreSQL Credentials Setup (30 minutes)

**Goal:** Configure n8n to connect to Neon PostgreSQL

#### Tasks:

1. **Open n8n** at http://localhost:5678

2. **Create PostgreSQL Credential**
   - Go to: **Settings** → **Credentials** → **New Credential**
   - Search: **"Postgres"**
   - Select: **Postgres account**
   - Fill in:
     - **Name:** `Neon PostgreSQL - MASH`
     - **Host:** `ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech`
     - **Database:** `Namias`
     - **User:** `Namias_owner`
     - **Password:** `SyuJeBKs09iN`
     - **Port:** `5432`
     - **SSL:** ✅ Enable (Required)
     - **SSL Mode:** `require`
   - Click **Save**

3. **Test Connection**
   - Create new workflow: "Test PostgreSQL Connection"
   - Add node: **Postgres**
   - Select credential: `Neon PostgreSQL - MASH`
   - Operation: **Execute Query**
   - Query: `SELECT * FROM growers LIMIT 3;`
   - Click **Test step**
   - Expected: 3 grower records returned

4. **Document Connection String**
   ```
   postgresql://Namias_owner:SyuJeBKs09iN@ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech/Namias?sslmode=require
   ```

**Deliverables:**
- [x] PostgreSQL credential created in n8n
- [x] Connection test passed (3 growers returned)
- [x] SSL enabled and working

**Validation:**
- Test query returns data without errors
- No SSL certificate warnings
- Connection established in <2 seconds

---

### Phase 3: Webhook + Routing Setup (45 minutes)

**Goal:** Create webhook entry point and action router

#### Tasks:

1. **Create New Workflow**
   - Name: "MASH Appointment System - PostgreSQL"
   - Click **Save**

2. **Add Webhook Node**
   - Search: "Webhook"
   - Parameters:
     - **HTTP Method:** POST
     - **Path:** `mash-appointments`
     - **Response Mode:** When Last Node Finishes
   - Click **Save**
   - Copy webhook URL: `http://localhost:5678/webhook/mash-appointments`

3. **Add Switch Node** (Action Router)
   - Connect from Webhook
   - Parameters:
     - **Data Type:** String
     - **Value 1:** `={{ $json.body.action }}`
     - **Rules:** (5 outputs)
       1. Output 0: `find_sellers` (String Equals)
       2. Output 1: `get_availability` (String Equals)
       3. Output 2: `set_appointment` (String Equals)
       4. Output 3: `cancel_appointment` (String Equals)
       5. Output 4: `get_appointments` (String Equals)
   - Click **Save**

4. **Test Routing**
   ```powershell
   # Test PowerShell command
   $body = @{ action = "find_sellers" } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body $body -ContentType "application/json"
   ```

**Deliverables:**
- [x] Webhook endpoint created
- [x] Switch node with 5 routing rules
- [x] Webhook URL documented

**Validation:**
- Webhook responds (even with empty response)
- Switch node routes correctly based on action field

---

### Phase 4: Action 1 - Find Sellers (2 hours)

**Goal:** Implement AI-powered seller matching

#### Workflow Flow:
```
Webhook → Switch (Output 0) → Query Growers → Query Availability → Ollama AI Match → Format Response
```

#### Tasks:

1. **Query Growers Node**
   - Type: **Postgres**
   - Credential: `Neon PostgreSQL - MASH`
   - Operation: **Execute Query**
   - Query:
     ```sql
     SELECT 
       user_uid AS seller_uid,
       name,
       email,
       phone,
       specialty,
       location,
       capacity_kg,
       rating
     FROM growers
     WHERE role = 'SELLER'
     ORDER BY rating DESC;
     ```

2. **Query Availability Node**
   - Type: **Postgres**
   - Credential: `Neon PostgreSQL - MASH`
   - Query:
     ```sql
     SELECT 
       id AS slot_id,
       seller_uid,
       available_date,
       start_time,
       end_time,
       duration_minutes
     FROM availability_slots
     WHERE is_available = TRUE
       AND available_date >= CURRENT_DATE
     ORDER BY available_date ASC, start_time ASC
     LIMIT 100;
     ```

3. **Ollama AI Match Node**
   - Type: **HTTP Request**
   - Method: POST
   - URL: `http://host.docker.internal:11434/api/generate`
   - Body:
     ```json
     {
       "model": "llama3.2:latest",
       "prompt": "You are a seller matcher for MASH mushroom marketplace.\n\nBuyer request:\n- Product: {{ $('Webhook').item.json.body.productType }}\n- Quantity: {{ $('Webhook').item.json.body.quantity }}kg\n- Location: {{ $('Webhook').item.json.body.location }}\n- Preferred Date: {{ $('Webhook').item.json.body.preferredDate }}\n\nAvailable sellers:\n{{ $('Query Growers').all().map((item, index) => `${index + 1}. ${item.json.name} - ${item.json.specialty}. Location: ${item.json.location}. Capacity: ${item.json.capacity_kg}kg/week`).join('\\n') }}\n\nReturn ONLY a JSON array of the top 3 seller UIDs ranked by relevance: [\"seller_001\", \"seller_002\", \"seller_003\"]",
       "stream": false
     }
     ```

4. **Format Response Node**
   - Type: **Code (JavaScript)**
   - Code:
     ```javascript
     const growers = $('Query Growers').all();
     const slots = $('Query Availability').all();
     const aiResponse = $('Ollama AI Match').first().json.response;
     const requestData = $('Webhook').first().json.body;
     
     // Parse AI ranking
     let topSellerIds = [];
     try {
       const match = aiResponse.match(/\[.*?\]/);
       if (match) topSellerIds = JSON.parse(match[0]);
     } catch (e) {
       topSellerIds = growers.slice(0, 3).map(g => g.json.seller_uid);
     }
     
     // Build seller results
     const sellers = topSellerIds.slice(0, 3).map(sellerId => {
       const grower = growers.find(g => g.json.seller_uid === sellerId);
       if (!grower) return null;
       
       const sellerSlots = slots
         .filter(s => s.json.seller_uid === sellerId)
         .slice(0, 3)
         .map(s => ({
           slotId: s.json.slot_id,
           date: s.json.available_date,
           startTime: s.json.start_time,
           endTime: s.json.end_time
         }));
       
       return {
         id: sellerId,
         name: grower.json.name,
         specialty: grower.json.specialty,
         location: grower.json.location,
         rating: grower.json.rating,
         capacity: grower.json.capacity_kg,
         availableSlots: sellerSlots
       };
     }).filter(Boolean);
     
     return [{
       success: true,
       action: 'find_sellers',
       query: {
         productType: requestData.productType,
         quantity: requestData.quantity,
         location: requestData.location,
         preferredDate: requestData.preferredDate
       },
       sellers: sellers,
       totalSellers: sellers.length,
       timestamp: new Date().toISOString()
     }];
     ```

**Deliverables:**
- [x] 4-node workflow for find_sellers
- [x] PostgreSQL queries optimized with indexes
- [x] Ollama AI integration working
- [x] Response formatted as JSON

**Validation Test:**
```powershell
$body = @{
  action = "find_sellers"
  productType = "Oyster Mushroom"
  quantity = 10
  location = "Manila"
  preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "action": "find_sellers",
  "sellers": [
    {
      "id": "seller_001",
      "name": "Manila Urban Farm",
      "specialty": "Oyster Mushrooms, King Oyster",
      "location": "Manila, Philippines",
      "rating": 4.8,
      "availableSlots": [...]
    }
  ]
}
```

---

### Phase 5: Action 2 - Get Availability (1 hour)

**Goal:** Query available time slots for specific seller

#### Workflow Flow:
```
Webhook → Switch (Output 1) → Query Availability Slots → Format Availability Response
```

#### Tasks:

1. **Query Availability Slots Node**
   - Type: **Postgres**
   - Query:
     ```sql
     SELECT 
       id AS slot_id,
       seller_uid,
       available_date,
       start_time,
       end_time,
       duration_minutes,
       is_available
     FROM availability_slots
     WHERE seller_uid = '{{ $('Webhook').item.json.body.sellerId }}'
       AND is_available = TRUE
       AND available_date >= CURRENT_DATE
     ORDER BY available_date ASC, start_time ASC;
     ```

2. **Format Availability Response Node**
   - Type: **Code (JavaScript)**
   - Code:
     ```javascript
     const slots = $input.all();
     const requestData = $('Webhook').first().json.body;
     const sellerId = requestData.sellerId;
     const preferredDate = requestData.preferredDate;
     
     // Group slots by date
     const slotsByDate = {};
     slots.forEach(item => {
       const slot = item.json;
       const date = slot.available_date;
       
       if (!slotsByDate[date]) slotsByDate[date] = [];
       
       slotsByDate[date].push({
         slotId: slot.slot_id,
         startTime: slot.start_time,
         endTime: slot.end_time,
         duration: slot.duration_minutes,
         isAvailable: slot.is_available
       });
     });
     
     // Filter by preferred date if provided
     let filteredSlots = slotsByDate;
     if (preferredDate && slotsByDate[preferredDate]) {
       filteredSlots = { [preferredDate]: slotsByDate[preferredDate] };
     }
     
     const totalSlots = Object.values(filteredSlots).reduce((sum, s) => sum + s.length, 0);
     const dates = Object.keys(filteredSlots).sort();
     
     return [{
       success: true,
       action: 'get_availability',
       sellerId: sellerId,
       preferredDate: preferredDate || null,
       availabilityByDate: filteredSlots,
       totalSlots: totalSlots,
       dateRange: {
         from: dates[0] || null,
         to: dates[dates.length - 1] || null
       },
       timestamp: new Date().toISOString()
     }];
     ```

**Deliverables:**
- [x] 2-node workflow for get_availability
- [x] Date grouping logic implemented
- [x] Optional date filtering

**Validation Test:**
```powershell
$body = @{
  action = "get_availability"
  sellerId = "seller_001"
  preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body $body -ContentType "application/json"
```

---

### Phase 6: Action 3 - Set Appointment (1.5 hours)

**Goal:** Create appointment and book slot atomically

#### Workflow Flow:
```
Webhook → Switch (Output 2) → Create Appointment → Mark Slot as Booked → Format Success Response
```

#### Tasks:

1. **Create Appointment Node**
   - Type: **Postgres**
   - Query:
     ```sql
     INSERT INTO appointments (
       buyer_uid, buyer_name, buyer_email, buyer_phone,
       seller_uid, seller_name,
       product_type, quantity_kg,
       scheduled_time, location,
       status, meeting_type, notes
     ) VALUES (
       '{{ $('Webhook').item.json.body.buyerUid }}',
       '{{ $('Webhook').item.json.body.buyerName }}',
       '{{ $('Webhook').item.json.body.buyerEmail }}',
       '{{ $('Webhook').item.json.body.buyerPhone }}',
       '{{ $('Webhook').item.json.body.sellerUid }}',
       '{{ $('Webhook').item.json.body.sellerName }}',
       '{{ $('Webhook').item.json.body.productType }}',
       {{ $('Webhook').item.json.body.quantity }},
       '{{ $('Webhook').item.json.body.scheduledTime }}'::TIMESTAMP,
       '{{ $('Webhook').item.json.body.location }}',
       'pending',
       '{{ $('Webhook').item.json.body.meetingType || 'consultation' }}',
       '{{ $('Webhook').item.json.body.notes || '' }}'
     )
     RETURNING id, buyer_uid, seller_uid, product_type, quantity_kg, scheduled_time, location, status, created_at;
     ```

2. **Mark Slot as Booked Node**
   - Type: **Postgres**
   - Query:
     ```sql
     UPDATE availability_slots
     SET 
       is_available = FALSE,
       booked_by = '{{ $('Webhook').item.json.body.buyerUid }}',
       appointment_id = '{{ $('Create Appointment').item.json.id }}'::UUID,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = '{{ $('Webhook').item.json.body.slotId }}'::UUID
     RETURNING id, seller_uid, available_date, start_time, is_available;
     ```

3. **Format Success Response Node**
   - Type: **Code (JavaScript)**
   - Code:
     ```javascript
     const appointment = $('Create Appointment').first().json;
     const slot = $('Mark Slot as Booked').first().json;
     
     return [{
       success: true,
       action: 'set_appointment',
       appointmentId: appointment.id,
       appointment: {
         buyerUid: appointment.buyer_uid,
         sellerUid: appointment.seller_uid,
         productType: appointment.product_type,
         quantity: appointment.quantity_kg,
         scheduledTime: appointment.scheduled_time,
         location: appointment.location,
         status: appointment.status,
         createdAt: appointment.created_at
       },
       slot: {
         slotId: slot.id,
         date: slot.available_date,
         startTime: slot.start_time,
         booked: !slot.is_available
       },
       message: 'Appointment created successfully. Seller will be notified.',
       timestamp: new Date().toISOString()
     }];
     ```

**Deliverables:**
- [x] 3-node workflow for set_appointment
- [x] Atomic booking (appointment + slot update)
- [x] RETURNING clause for confirmation data

**Validation Test:**
```powershell
$body = @{
  action = "set_appointment"
  buyerUid = "buyer_test_003"
  buyerName = "Test User"
  buyerEmail = "test@example.com"
  buyerPhone = "+63-900-000-0000"
  sellerUid = "seller_001"
  sellerName = "Manila Urban Farm"
  slotId = "slot-uuid-here" # Get from get_availability
  productType = "Oyster Mushroom"
  quantity = 10
  scheduledTime = "2026-01-15T10:00:00"
  location = "Manila"
  meetingType = "consultation"
  notes = "Testing appointment creation"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body $body -ContentType "application/json"
```

---

### Phase 7: Action 4 - Cancel Appointment (1 hour)

**Goal:** Cancel appointment and release time slot

#### Workflow Flow:
```
Webhook → Switch (Output 3) → Get Appointment → Update Appointment Status → Release Slot → Format Cancel Response
```

#### Tasks:

1. **Get Appointment Node**
   - Type: **Postgres**
   - Query:
     ```sql
     SELECT 
       id, buyer_uid, seller_uid, scheduled_time, status,
       (SELECT id FROM availability_slots WHERE appointment_id = appointments.id LIMIT 1) AS slot_id
     FROM appointments
     WHERE id = '{{ $('Webhook').item.json.body.appointmentId }}'::UUID;
     ```

2. **Update Appointment Status Node**
   - Type: **Postgres**
   - Query:
     ```sql
     UPDATE appointments
     SET 
       status = 'cancelled',
       cancel_reason = '{{ $('Webhook').item.json.body.cancelReason || 'User cancelled' }}',
       cancelled_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = '{{ $('Get Appointment').item.json.id }}'::UUID
     RETURNING id, status, cancelled_at;
     ```

3. **Release Slot Node**
   - Type: **Postgres**
   - Query:
     ```sql
     UPDATE availability_slots
     SET 
       is_available = TRUE,
       booked_by = NULL,
       appointment_id = NULL,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = '{{ $('Get Appointment').item.json.slot_id }}'::UUID
     RETURNING id, seller_uid, available_date, start_time, is_available;
     ```

4. **Format Cancel Response Node**
   - Type: **Code (JavaScript)**
   - Code:
     ```javascript
     const appointment = $('Update Appointment Status').first().json;
     const slot = $('Release Slot').first().json;
     
     return [{
       success: true,
       action: 'cancel_appointment',
       appointmentId: appointment.id,
       status: appointment.status,
       cancelledAt: appointment.cancelled_at,
       slotReleased: {
         slotId: slot.id,
         date: slot.available_date,
         startTime: slot.start_time,
         nowAvailable: slot.is_available
       },
       message: 'Appointment cancelled successfully. Time slot has been released.',
       timestamp: new Date().toISOString()
     }];
     ```

**Deliverables:**
- [x] 4-node workflow for cancel_appointment
- [x] Slot release logic
- [x] Cancel reason tracking

---

### Phase 8: Action 5 - Get Appointments (45 minutes)

**Goal:** Retrieve appointment history for buyer/seller

#### Workflow Flow:
```
Webhook → Switch (Output 4) → Query Appointments → Format Appointments List
```

#### Tasks:

1. **Query Appointments Node**
   - Type: **Postgres**
   - Query:
     ```sql
     SELECT 
       id AS appointment_id,
       buyer_uid, buyer_name, buyer_email, buyer_phone,
       seller_uid, seller_name,
       product_type, quantity_kg,
       scheduled_time, location,
       status, meeting_type, notes,
       created_at, updated_at
     FROM appointments
     WHERE 
       CASE 
         WHEN '{{ $('Webhook').item.json.body.userType }}' = 'buyer' THEN buyer_uid = '{{ $('Webhook').item.json.body.userId }}'
         WHEN '{{ $('Webhook').item.json.body.userType }}' = 'seller' THEN seller_uid = '{{ $('Webhook').item.json.body.userId }}'
         ELSE FALSE
       END
     ORDER BY scheduled_time DESC;
     ```

2. **Format Appointments List Node**
   - Type: **Code (JavaScript)**
   - Code:
     ```javascript
     const appointments = $input.all();
     const requestData = $('Webhook').first().json.body;
     
     const formattedAppointments = appointments.map(item => ({
       appointmentId: item.json.appointment_id,
       buyerUid: item.json.buyer_uid,
       buyerName: item.json.buyer_name,
       sellerUid: item.json.seller_uid,
       sellerName: item.json.seller_name,
       productType: item.json.product_type,
       quantity: item.json.quantity_kg,
       scheduledTime: item.json.scheduled_time,
       location: item.json.location,
       status: item.json.status,
       meetingType: item.json.meeting_type,
       notes: item.json.notes || '',
       createdAt: item.json.created_at,
       updatedAt: item.json.updated_at
     }));
     
     return [{
       success: true,
       action: 'get_appointments',
       userId: requestData.userId,
       userType: requestData.userType,
       appointments: formattedAppointments,
       totalAppointments: formattedAppointments.length,
       timestamp: new Date().toISOString()
     }];
     ```

**Deliverables:**
- [x] 2-node workflow for get_appointments
- [x] Buyer/seller role filtering
- [x] Appointment history sorted by date

---

## 🧪 Testing Strategy

### Automated Test Suite

Create `test-neon-workflow.ps1`:

```powershell
# Test all 5 appointment actions

Write-Host "🧪 MASH PostgreSQL Appointment System - Test Suite" -ForegroundColor Cyan
$webhookUrl = "http://localhost:5678/webhook/mash-appointments"

# Test 1: Find Sellers
Write-Host "`n[Test 1] Find Sellers..." -ForegroundColor Yellow
$body1 = @{
  action = "find_sellers"
  productType = "Oyster Mushroom"
  quantity = 10
  location = "Manila"
  preferredDate = "2026-01-15"
} | ConvertTo-Json
$response1 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body1 -ContentType "application/json"
if ($response1.success) { Write-Host "✅ PASS" -ForegroundColor Green } else { Write-Host "❌ FAIL" -ForegroundColor Red }

# Test 2: Get Availability
Write-Host "`n[Test 2] Get Availability..." -ForegroundColor Yellow
$body2 = @{
  action = "get_availability"
  sellerId = "seller_001"
  preferredDate = "2026-01-15"
} | ConvertTo-Json
$response2 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body2 -ContentType "application/json"
if ($response2.success) { Write-Host "✅ PASS" -ForegroundColor Green } else { Write-Host "❌ FAIL" -ForegroundColor Red }

# Test 3: Set Appointment (use first available slot from Test 2)
Write-Host "`n[Test 3] Set Appointment..." -ForegroundColor Yellow
$slotId = $response2.availabilityByDate.PSObject.Properties.Value[0][0].slotId
$body3 = @{
  action = "set_appointment"
  buyerUid = "buyer_test_999"
  buyerName = "Automated Test User"
  buyerEmail = "test@mash.com"
  buyerPhone = "+63-999-999-9999"
  sellerUid = "seller_001"
  sellerName = "Manila Urban Farm"
  slotId = $slotId
  productType = "Oyster Mushroom"
  quantity = 10
  scheduledTime = "2026-01-15T10:00:00"
  location = "Manila"
  notes = "Automated test appointment"
} | ConvertTo-Json
$response3 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body3 -ContentType "application/json"
if ($response3.success) { 
  Write-Host "✅ PASS (ID: $($response3.appointmentId))" -ForegroundColor Green 
  $global:testAppointmentId = $response3.appointmentId
} else { Write-Host "❌ FAIL" -ForegroundColor Red }

# Test 4: Get Appointments
Write-Host "`n[Test 4] Get Appointments..." -ForegroundColor Yellow
$body4 = @{
  action = "get_appointments"
  userId = "buyer_test_999"
  userType = "buyer"
} | ConvertTo-Json
$response4 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body4 -ContentType "application/json"
if ($response4.success -and $response4.totalAppointments -gt 0) { Write-Host "✅ PASS" -ForegroundColor Green } else { Write-Host "❌ FAIL" -ForegroundColor Red }

# Test 5: Cancel Appointment
Write-Host "`n[Test 5] Cancel Appointment..." -ForegroundColor Yellow
$body5 = @{
  action = "cancel_appointment"
  appointmentId = $global:testAppointmentId
  cancelReason = "Automated test cleanup"
} | ConvertTo-Json
$response5 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body5 -ContentType "application/json"
if ($response5.success) { Write-Host "✅ PASS" -ForegroundColor Green } else { Write-Host "❌ FAIL" -ForegroundColor Red }

Write-Host "`n🎉 Test Suite Complete!" -ForegroundColor Cyan
```

---

## 📋 Success Checklist

### Database
- [ ] Neon PostgreSQL accessible from n8n
- [ ] 3 tables created with indexes
- [ ] Seed data loaded (3 growers, 672 slots)
- [ ] Test queries return data

### n8n Workflow
- [ ] Webhook endpoint active
- [ ] PostgreSQL credential configured with SSL
- [ ] All 5 actions implemented (18 total nodes)
- [ ] Workflow saved and activated

### Testing
- [ ] Automated test script runs successfully
- [ ] All 5 tests pass
- [ ] Data persists correctly in PostgreSQL
- [ ] No duplicate bookings (atomic transactions)

### Integration
- [ ] Frontend AppointmentWidget connects to webhook
- [ ] Response format matches frontend expectations
- [ ] Error handling for edge cases

---

## 📚 Documentation Deliverables

1. ✅ This PLANNING.md file
2. ⏳ SUPABASE_TO_POSTGRESQL_CONVERSION.md
3. ⏳ workflow-neon-postgresql-complete.json
4. ⏳ test-neon-workflow.ps1
5. ⏳ NEXT-STEPS-POSTGRESQL.md

---

## 🚀 Next Phase

After completion:
- Deploy n8n to production server (optional)
- Update frontend to use production webhook URL
- Add email notifications (Gmail SMTP)
- Implement seller dashboard for managing availability
- Add analytics dashboard (appointments by product/location/time)

**Estimated Total Time:** 8-12 hours  
**Complexity:** Moderate (SQL knowledge required)
