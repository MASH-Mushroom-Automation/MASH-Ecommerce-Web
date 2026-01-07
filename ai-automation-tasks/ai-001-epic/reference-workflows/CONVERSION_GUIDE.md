# Supabase → Firebase Conversion Guide for MASH Appointment Workflow

> **Source:** reference-workflows/supabase-appointment-workflow.json  
> **Target:** Firebase-based MASH appointment system  
> **Created:** January 8, 2026

---

## 📊 Node-by-Node Conversion Mapping

### ✅ No Changes Required

| Node Name | Type | Notes |
|-----------|------|-------|
| Webhook | `n8n-nodes-base.webhook` | Keep as-is, just update path |
| Appointment Actions | `n8n-nodes-base.set` | Update prompt templates only |
| Switch | `n8n-nodes-base.switch` | Keep routing logic as-is |
| All Ollama Chat Models | `@n8n/n8n-nodes-langchain.lmChatOllama` | Keep, change model to `llama3.2:3b` |
| All AI Agents | `@n8n/n8n-nodes-langchain.agent` | Keep, just update prompts |
| Respond nodes | `n8n-nodes-base.respondToWebhook` | Keep as-is |
| If nodes (Email checks) | `n8n-nodes-base.if` | Keep as-is |
| NoOp nodes | `n8n-nodes-base.noOp` | Keep as-is |
| Sticky Notes | `n8n-nodes-base.stickyNote` | Update content for MASH |

---

## 🔄 Nodes Requiring Conversion

### 1. Load Interviewers Table → Query Availability Slots

**Original (Supabase):**
```json
{
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_interviewers",
    "operation": "getAll",
    "returnAll": true
  }
}
```

**Converted (Firebase):**
```json
{
  "type": "n8n-nodes-base.googleFirestore",
  "parameters": {
    "operation": "getAllDocuments",
    "collection": "availability_slots",
    "filters": {
      "conditions": [
        {
          "keyName": "is_available",
          "keyValue": "true",
          "condition": "eq"
        }
      ]
    },
    "options": {
      "orderBy": "available_date",
      "direction": "asc",
      "limit": 10
    }
  },
  "credentials": {
    "googleFirestoreApi": {
      "id": "RhVuEUgqpi4xoIfQ",
      "name": "Firebase Admin SDK"
    }
  }
}
```

---

### 2. Create Interview Record → Create Appointment

**Original (Supabase):**
```json
{
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_enrollers",
    "fieldsUi": {
      "fieldValues": [
        {"fieldId": "enroller name", "fieldValue": "={{ $('Webhook').item.json.body.args.name }}"},
        {"fieldId": "interviewer name", "fieldValue": "={{ $fromAI('...') }}"},
        {"fieldId": "nationality id", "fieldValue": "={{ $json.body.args.nationality_number }}"}
      ]
    }
  }
}
```

**Converted (Firebase):**
```json
{
  "type": "n8n-nodes-base.googleFirestore",
  "parameters": {
    "operation": "create",
    "collection": "appointments",
    "documentData": {
      "buyer_uid": "={{ $('Webhook').item.json.body.args.buyer_uid }}",
      "buyer_name": "={{ $('Webhook').item.json.body.args.name }}",
      "buyer_email": "={{ $('Webhook').item.json.body.args.email }}",
      "buyer_phone": "={{ $('Webhook').item.json.body.args.phone_number }}",
      "seller_uid": "={{ $fromAI('seller_uid') }}",
      "seller_name": "={{ $fromAI('seller_name') }}",
      "appointment_date": "={{ $fromAI('appointment_date') }}",
      "appointment_time": "={{ $fromAI('appointment_time') }}",
      "status": "pending",
      "meeting_type": "={{ $json.body.args.meeting_type || 'consultation' }}",
      "product_interest": "={{ $json.body.args.product_interest || '' }}",
      "location": "={{ $json.body.args.location }}",
      "notes": "={{ $json.body.args.notes || '' }}",
      "created_at": "={{ $now.toISO() }}",
      "updated_at": "={{ $now.toISO() }}"
    }
  },
  "credentials": {
    "googleFirestoreApi": {
      "id": "RhVuEUgqpi4xoIfQ",
      "name": "Firebase Admin SDK"
    }
  }
}
```

---

### 3. Delete Interviewer Record → Update Availability Slot

**Original (Supabase):**
```json
{
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_interviewers",
    "operation": "delete",
    "filters": {
      "conditions": [
        {"keyName": "interviewer name", "keyValue": "={{ $fromAI('...') }}"},
        {"keyName": "available", "keyValue": "={{ $fromAI('...') }}"}
      ]
    }
  }
}
```

**Converted (Firebase):**
```json
{
  "type": "n8n-nodes-base.googleFirestore",
  "parameters": {
    "operation": "update",
    "collection": "availability_slots",
    "documentId": "={{ $fromAI('slot_id') }}",
    "updateData": {
      "is_available": false,
      "updated_at": "={{ $now.toISO() }}"
    }
  },
  "credentials": {
    "googleFirestoreApi": {
      "id": "RhVuEUgqpi4xoIfQ",
      "name": "Firebase Admin SDK"
    }
  }
}
```

---

### 4. Fetch Enroller Record → Get Appointment

**Original (Supabase):**
```json
{
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_enrollers",
    "operation": "get",
    "filters": {
      "conditions": [
        {"keyName": "nationality id", "keyValue": "={{ $json.body.args.nationality_number }}"}
      ]
    }
  }
}
```

**Converted (Firebase):**
```json
{
  "type": "n8n-nodes-base.googleFirestore",
  "parameters": {
    "operation": "query",
    "collection": "appointments",
    "filters": {
      "conditions": [
        {"keyName": "buyer_uid", "keyValue": "={{ $json.body.args.buyer_uid }}", "condition": "=="}
      ]
    },
    "options": {
      "limit": 1
    }
  },
  "credentials": {
    "googleFirestoreApi": {
      "id": "RhVuEUgqpi4xoIfQ",
      "name": "Firebase Admin SDK"
    }
  }
}
```

---

### 5. Update Enroller Record → Update Appointment

**Original (Supabase):**
```json
{
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_enrollers",
    "operation": "update",
    "filters": {
      "conditions": [
        {"keyName": "nationality id", "keyValue": "={{ $json.body.args.nationality_number }}"}
      ]
    },
    "fieldsUi": {
      "fieldValues": [
        {"fieldId": "interviewer name", "fieldValue": "={{ $fromAI('...') }}"},
        {"fieldId": "date of interview", "fieldValue": "={{ $fromAI('...') }}"}
      ]
    }
  }
}
```

**Converted (Firebase):**
```json
{
  "type": "n8n-nodes-base.googleFirestore",
  "parameters": {
    "operation": "update",
    "collection": "appointments",
    "documentId": "={{ $fromAI('appointment_id') }}",
    "updateData": {
      "seller_uid": "={{ $fromAI('new_seller_uid') }}",
      "seller_name": "={{ $fromAI('new_seller_name') }}",
      "appointment_date": "={{ $fromAI('new_date') }}",
      "appointment_time": "={{ $fromAI('new_time') }}",
      "status": "rescheduled",
      "updated_at": "={{ $now.toISO() }}"
    }
  },
  "credentials": {
    "googleFirestoreApi": {
      "id": "RhVuEUgqpi4xoIfQ",
      "name": "Firebase Admin SDK"
    }
  }
}
```

---

## 🔑 Field Mapping Reference

| Original Supabase Field | MASH Firebase Field | Type | Notes |
|-------------------------|---------------------|------|-------|
| `nationality_number` | `buyer_uid` | string | Firebase user UID |
| `enroller name` | `buyer_name` | string | From Firebase Auth |
| `interviewer name` | `seller_name` | string | From `users` collection |
| `date of interview` | `appointment_date` | timestamp | ISO 8601 format |
| `available` | `available_date` | timestamp | ISO 8601 format |
| `program` | `meeting_type` | string | 'consultation' \| 'farm_tour' \| 'bulk_order' |
| `location` | `location` | string | 'On-site' \| 'Virtual' |
| `email` | `buyer_email` | string | Keep same |
| `phone_number` | `buyer_phone` | string | Keep same |
| N/A | `product_interest` | string | NEW: Product name/ID |
| N/A | `status` | string | NEW: 'pending' \| 'confirmed' \| 'cancelled' \| 'completed' |
| N/A | `duration_minutes` | number | NEW: Default 30 |
| N/A | `notes` | string | NEW: Optional buyer notes |

---

## 🤖 AI Prompt Updates

### Set Appointment Prompt

**Original:**
```
Check the "interviewers" table for the earliest available interviewer.
If no interviewers exist, output: {"error": "No interviewers available"}.
Otherwise:
  - create a row in the "Unitek_enrollers".
  - delete the interviewer's row in the "Unitek_interviewers".
```

**MASH Version:**
```
Check the "availability_slots" collection for the earliest available slot where is_available == true.
If no slots exist, output: {"error": "No available appointment slots"}.
Otherwise:
  1. Create document in "appointments" collection with:
     - buyer_uid, buyer_name, buyer_email, buyer_phone
     - seller_uid, seller_name (from availability slot)
     - appointment_date, appointment_time
     - status = "pending"
     - meeting_type, product_interest, location, notes
  2. Update the selected availability_slots document:
     - Set is_available = false
     - Set updated_at = current timestamp
  3. Return appointment_id and confirmation details
```

---

## 🔗 Webhook Endpoint Updates

**Original:**
```
http://localhost:5678/webhook/46161ac6-9838-4b3d-ad4a-c8d62362a656
```

**MASH:**
```
http://localhost:5678/webhook/mash-appointments
```

**Request Body Changes:**

**Original:**
```json
{
  "name": "set_appointment",
  "args": {
    "name": "John Doe",
    "nationality_number": "12345678",
    "phone_number": "+1234567890",
    "email": "john@example.com",
    "location": "Campus A",
    "program": "Engineering"
  }
}
```

**MASH:**
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
    "product_interest": "Oyster Mushroom Growing Kit",
    "location": "Manila Urban Farm",
    "notes": "Interested in bulk orders"
  }
}
```

---

## 📧 Email Node Integration

Add Gmail nodes for notifications (not in original workflow):

```json
{
  "type": "n8n-nodes-base.gmail",
  "parameters": {
    "operation": "send",
    "emailAddress": "={{ $('Webhook').item.json.body.args.email }}",
    "subject": "Appointment Confirmation - MASH",
    "body": "={{ `<h1>Appointment Confirmed</h1>
      <p>Dear ${$json.buyer_name},</p>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li><strong>Date:</strong> ${$json.appointment_date}</li>
        <li><strong>Time:</strong> ${$json.appointment_time}</li>
        <li><strong>Seller:</strong> ${$json.seller_name}</li>
        <li><strong>Location:</strong> ${$json.location}</li>
      </ul>
      <p>Thank you for choosing MASH!</p>` }}"
  },
  "credentials": {
    "gmailApi": {
      "id": "your-gmail-credential-id",
      "name": "Gmail SMTP"
    }
  }
}
```

---

## 🛠️ Implementation Checklist

### Phase 1: Firestore Collections Setup
- [ ] Create `availability_slots` collection with sample data
- [ ] Create `appointments` collection (initially empty)
- [ ] Update Firestore indexes in `firestore.indexes.json`
- [ ] Update security rules in `firestore.rules`

### Phase 2: Workflow Conversion
- [ ] Import original workflow to n8n
- [ ] Replace all Supabase Tool nodes with Google Cloud Firestore nodes
- [ ] Update all field references (nationality_number → buyer_uid)
- [ ] Update AI prompts with MASH-specific instructions
- [ ] Add Gmail notification nodes
- [ ] Update webhook path to `mash-appointments`

### Phase 3: Credential Configuration
- [ ] Verify Firebase Admin SDK credential (already done in AI-002)
- [ ] Add Gmail SMTP credential
- [ ] Test credential connections

### Phase 4: AI Model Setup (requires AI-003)
- [ ] Install Ollama
- [ ] Download `llama3.2:3b` model
- [ ] Configure Ollama credentials in n8n
- [ ] Update all Chat Model nodes to use `llama3.2:3b`

### Phase 5: Testing
- [ ] Test `set_appointment` action
- [ ] Test `reschedule` action
- [ ] Test `cancel` action
- [ ] Test `get_list` action
- [ ] Test `get_user_info` action
- [ ] Verify email notifications sent
- [ ] Check Firestore data integrity

---

## 🚀 Quick Test Commands

### Test Set Appointment
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
        product_interest = "Oyster Mushroom Kit"
        location = "Manila Urban Farm"
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:5678/webhook/mash-appointments" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Test Reschedule
```powershell
$body = @{
    action = "reschedule"
    args = @{
        buyer_uid = "test_user_123"
        preferred_date = "2026-01-20"
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:5678/webhook/mash-appointments" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 📚 Reference Documents

- [WORKFLOW_ADAPTATION_PLAN.md](../WORKFLOW_ADAPTATION_PLAN.md) - Full data model & implementation guide
- [AI-002 PROGRESS.md](../../ai-002-n8n-setup/PROGRESS.md) - n8n setup complete
- [AI-003 README.md](../../ai-003-ollama-setup/README.md) - Ollama setup (next)
- [Firebase Collections Structure](../../../firestore.indexes.json) - Existing indexes

---

**Status:** 📋 Ready for manual conversion in n8n UI  
**Dependencies:** AI-003 (Ollama) must be complete before testing AI agents  
**Estimated Conversion Time:** 2-3 hours
