# MASH Appointment System - Workflow Adaptation Plan

> **Created:** January 8, 2026  
> **Source Workflows:** 2 reference implementations (Supabase + Cal.com)  
> **Target Platform:** MASH E-Commerce (Firebase + Sanity CMS)  
> **AI Stack:** n8n + Ollama (Llama 3.2) + ChromaDB

---

## 🎯 Objective

Adapt the Supabase-based appointment management workflow to work with MASH's Firebase architecture, enabling buyers to schedule appointments with growers/sellers for:
- Product consultations
- Farm tours
- Bulk order negotiations
- Growing kit setup assistance

---

## 📋 Data Model Mapping

### Original Workflow Tables → MASH Firebase Collections

| Supabase Table | Purpose | MASH Firebase Collection | Key Fields |
|----------------|---------|--------------------------|------------|
| `Unitek_interviewers` | Available time slots | `availability_slots` | `seller_uid`, `available_date`, `available_time`, `duration`, `location` |
| `Unitek_enrollers` | Booked appointments | `appointments` | `buyer_uid`, `seller_uid`, `appointment_date`, `appointment_time`, `status`, `notes` |
| `Unitek_classes` | User's scheduled events | `buyer_appointments` (subcollection) | `appointment_id`, `seller_name`, `product_id`, `meeting_type` |

### MASH-Specific Fields

**Availability Slots Collection:**
```json
{
  "id": "auto-generated",
  "seller_uid": "firebase_user_uid",
  "seller_name": "Manila Urban Farm",
  "available_date": "2026-01-15",
  "available_time": "14:00",
  "duration_minutes": 30,
  "location": "On-site / Virtual",
  "meeting_type": ["consultation", "farm_tour", "bulk_order"],
  "created_at": "timestamp",
  "is_available": true
}
```

**Appointments Collection:**
```json
{
  "id": "auto-generated",
  "buyer_uid": "firebase_user_uid",
  "buyer_name": "John Doe",
  "buyer_email": "john@example.com",
  "buyer_phone": "+63 917 123 4567",
  "seller_uid": "firebase_user_uid",
  "seller_name": "Manila Urban Farm",
  "appointment_date": "2026-01-15",
  "appointment_time": "14:00",
  "duration_minutes": 30,
  "status": "pending", // pending, confirmed, cancelled, completed
  "meeting_type": "consultation",
  "product_interest": "Oyster Mushroom Growing Kit",
  "notes": "Interested in bulk orders for restaurant",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## 🔄 Workflow Actions Adaptation

### Action 1: Set Appointment (Book New Meeting)

**Original Supabase Logic:**
1. Check `interviewers` table for earliest available slot
2. Create row in `enrollers` table
3. Delete interviewer's available slot

**MASH Firebase Logic:**
1. Query `availability_slots` collection where `seller_uid` matches and `is_available == true`
2. Order by `available_date` ASC, limit 1
3. Create document in `appointments` collection
4. Update `availability_slots` document: set `is_available = false`
5. Send email notification to buyer + seller
6. Create calendar event (optional)

**n8n Nodes:**
- Google Cloud Firestore (Get All) → Filter available slots
- Google Cloud Firestore (Create) → New appointment
- Google Cloud Firestore (Update) → Mark slot unavailable
- Gmail node → Send confirmation emails

---

### Action 2: Reschedule Appointment

**Original Supabase Logic:**
1. Get enroller record
2. Reinsert previous interviewer slot
3. Find new available interviewer
4. Update enroller record
5. Delete new interviewer slot

**MASH Firebase Logic:**
1. Get appointment by `appointment_id` from `appointments` collection
2. Get old slot reference from appointment (`seller_uid` + `appointment_date`)
3. Update old slot in `availability_slots`: set `is_available = true`
4. Query new available slot matching preferred date/time
5. Update appointment document with new date/time/seller
6. Update new slot: set `is_available = false`
7. Send reschedule notification emails

**n8n Nodes:**
- Google Cloud Firestore (Get) → Fetch appointment
- Google Cloud Firestore (Update) → Release old slot
- Google Cloud Firestore (Get All) → Find new slot
- Google Cloud Firestore (Update) → Update appointment
- Google Cloud Firestore (Update) → Mark new slot unavailable
- Gmail node → Reschedule notifications

---

### Action 3: Cancel Appointment

**Original Supabase Logic:**
1. Get enroller record
2. Reinsert interviewer slot
3. Delete enroller record

**MASH Firebase Logic:**
1. Get appointment by `appointment_id`
2. Get slot reference (`seller_uid` + `appointment_date`)
3. Update `availability_slots`: set `is_available = true`
4. Update appointment document: set `status = "cancelled"`
5. Send cancellation emails

**n8n Nodes:**
- Google Cloud Firestore (Get) → Fetch appointment
- Google Cloud Firestore (Update) → Release slot
- Google Cloud Firestore (Update) → Mark cancelled
- Gmail node → Cancellation notifications

---

### Action 4: Get Appointment List (Buyer's Upcoming Meetings)

**Original Supabase Logic:**
1. Query classes by nationality number
2. Return list as JSON

**MASH Firebase Logic:**
1. Query `appointments` collection where `buyer_uid == current_user`
2. Filter by `status == "pending" OR status == "confirmed"`
3. Order by `appointment_date` ASC
4. Return JSON array

**n8n Nodes:**
- Google Cloud Firestore (Get All) → Query by buyer_uid
- Filter node → Only active appointments
- Set node → Format response JSON

---

### Action 5: Get User Info (Buyer/Seller Profile)

**Original Supabase Logic:**
1. Query enrollers table by nationality number
2. Return user data as JSON

**MASH Firebase Logic:**
1. Query `users` collection by `uid`
2. Return profile data (name, email, phone, role, preferences)

**n8n Nodes:**
- Google Cloud Firestore (Get) → Fetch user document
- Set node → Format response

---

## 🤖 AI Agent Configuration

### Ollama Models (from AI-003 task)

**Model:** Llama 3.2 3B (4.7 GB download)
- **Use Case:** Appointment scheduling logic, slot matching, conflict detection
- **Prompts:** Convert natural language requests into structured Firestore queries

**Chat Model Nodes (5 total):**
1. `Ollama Chat Model` → Set Appointment Agent
2. `Ollama Chat Model1` → Reschedule Agent
3. `Ollama Chat Model2` → Cancellation Agent
4. `Ollama Chat Model3` → List Appointments Agent
5. `Ollama Chat Model4` → User Info Agent

**Prompt Template Example (Set Appointment):**
```
You are an appointment booking assistant for MASH, a mushroom e-commerce platform.

User Request: {{ $json.body.args.request }}
Buyer Name: {{ $json.body.args.name }}
Buyer Email: {{ $json.body.args.email }}
Buyer Phone: {{ $json.body.args.phone_number }}
Seller Preference: {{ $json.body.args.seller_preference }} (optional)
Preferred Date: {{ $json.body.args.preferred_date }}
Meeting Type: {{ $json.body.args.meeting_type }}

Steps:
1. Query availability_slots collection for available slots matching preferred date
2. If no exact match, find closest available date
3. If no slots available, return error: {"error": "No available slots"}
4. Otherwise:
   - Create appointment in appointments collection
   - Update availability_slots: set is_available = false
   - Return success with appointment details
```

---

## 🔌 Webhook Routes

All appointment actions use a single webhook endpoint with action routing:

**Endpoint:** `http://localhost:5678/webhook/mash-appointments`

**Request Format:**
```json
{
  "action": "set_appointment",
  "args": {
    "buyer_uid": "firebase_user_uid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+63 917 123 4567",
    "seller_uid": "optional",
    "preferred_date": "2026-01-15",
    "preferred_time": "14:00",
    "meeting_type": "consultation",
    "notes": "Interested in bulk orders"
  }
}
```

**Actions:**
- `set_appointment` → Book new meeting
- `reschedule` → Change existing appointment
- `cancel` → Cancel appointment
- `get_list` → Get buyer's appointments
- `get_user_info` → Get buyer/seller profile

---

## 📧 Email Notifications

**Gmail SMTP Integration** (already configured in MASH):
- From: `MASH Appointments <noreply@mash-mushrooms.com>`
- Templates: Booking confirmation, reschedule notice, cancellation notice

**Email Node Configuration:**
- Use existing Gmail credentials from MASH backend
- HTML templates with MASH branding
- Include appointment details, calendar link (.ics file)

---

## 🛠️ Implementation Phases

### Phase 1: Firebase Collections Setup (30 min)
- [ ] Create `availability_slots` collection with indexes
- [ ] Create `appointments` collection with indexes
- [ ] Update Firestore security rules for appointment read/write

### Phase 2: n8n Workflow Creation (2 hours)
- [ ] Import base workflow structure from reference
- [ ] Replace all Supabase Tool nodes with Google Cloud Firestore nodes
- [ ] Update all field mappings (nationality_number → buyer_uid, etc.)
- [ ] Configure Firebase Admin SDK credential (already done in AI-002)
- [ ] Set up 5 AI agent nodes with custom prompts

### Phase 3: Ollama Integration (from AI-003)
- [ ] Install Ollama on local machine
- [ ] Download Llama 3.2 3B model
- [ ] Configure Ollama Chat Model credentials in n8n
- [ ] Test AI agent responses

### Phase 4: Email Integration (30 min)
- [ ] Configure Gmail node with MASH SMTP credentials
- [ ] Create email templates (booking, reschedule, cancel)
- [ ] Test email delivery

### Phase 5: Frontend Integration (1 hour)
- [ ] Create appointment booking component in `src/components/appointments/`
- [ ] Add appointment widget to buyer dashboard
- [ ] Add availability management to seller dashboard
- [ ] Connect to n8n webhook endpoint

### Phase 6: Testing & Debugging (1 hour)
- [ ] Test all 5 actions with PowerShell/Postman
- [ ] Verify Firestore data integrity
- [ ] Test email notifications
- [ ] Load test with multiple concurrent requests

---

## 🚀 Quick Start Commands

### 1. Test Webhook Endpoint (PowerShell)
```powershell
$body = @{
    action = "set_appointment"
    args = @{
        buyer_uid = "test_user_123"
        name = "John Doe"
        email = "john@example.com"
        phone_number = "+63 917 123 4567"
        preferred_date = "2026-01-15"
        meeting_type = "consultation"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5678/webhook/mash-appointments" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### 2. Check n8n Workflow Execution
```powershell
# View executions in n8n UI
Start-Process "http://localhost:5678/workflow/executions"
```

---

## 📚 Reference Documentation

- **Original Workflows:** See user-provided JSON in this chat
- **n8n Firebase Integration:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlefirestore/
- **Ollama n8n Integration:** https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatollama/
- **AI-002 Task:** n8n setup (COMPLETE ✅)
- **AI-003 Task:** Ollama setup (NEXT)
- **AI-004 Task:** Appointment widget UI (PENDING)

---

## 🔐 Security Considerations

1. **Firebase Security Rules:**
   - Buyers can only read their own appointments
   - Sellers can read appointments assigned to them
   - Only authenticated users can create appointments

2. **Webhook Authentication:**
   - Add API key header validation in n8n workflow
   - Store API key in environment variables

3. **PII Protection:**
   - Encrypt phone numbers in Firestore
   - Mask email addresses in logs
   - GDPR compliance for data deletion

---

## 📊 Success Metrics

- [ ] Appointment booking success rate > 95%
- [ ] Average booking time < 30 seconds
- [ ] Email delivery rate > 99%
- [ ] AI agent accuracy > 90% (correct slot selection)
- [ ] Zero data leaks or unauthorized access

---

**Status:** 📋 Ready for Implementation  
**Estimated Time:** 6-8 hours total  
**Dependencies:** AI-003 (Ollama setup) must be complete first
