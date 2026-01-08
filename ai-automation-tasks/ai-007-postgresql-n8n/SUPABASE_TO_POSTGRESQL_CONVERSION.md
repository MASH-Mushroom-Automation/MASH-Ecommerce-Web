# Supabase → Neon PostgreSQL Conversion Guide

> **From:** Supabase Tool nodes (reference workflow)  
> **To:** Native PostgreSQL nodes with Neon connection  
> **Created:** January 9, 2026

---

## 🎯 Core Differences

| Aspect | Supabase (Original) | Neon PostgreSQL (MASH) |
|--------|---------------------|------------------------|
| **Node Type** | `n8n-nodes-base.supabaseTool` | `n8n-nodes-base.postgres` |
| **Connection** | Supabase API key | PostgreSQL connection string (SSL required) |
| **Query Style** | Tool-specific operations | Raw SQL queries |
| **Data Format** | Supabase JSON | PostgreSQL row objects |
| **Authentication** | API key in headers | Username/password in credential |
| **SSL** | Auto-managed | Must enable explicitly |

---

## 🔄 Node-by-Node Conversion Map

### 1. Load Interviewers Table → Query Growers

**Supabase (Original):**
```json
{
  "name": "Load Interviewers Table",
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "authentication": "supabaseApi",
    "tableId": "Unitek_interviewers",
    "operation": "getAll",
    "returnAll": true
  }
}
```

**Neon PostgreSQL (Converted):**
```json
{
  "name": "Query Growers",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT user_uid AS seller_uid, name, email, phone, specialty, location, capacity_kg, rating FROM growers WHERE role = 'SELLER' ORDER BY rating DESC;",
    "additionalFields": {}
  },
  "credentials": {
    "postgres": {
      "id": "NEON_POSTGRES_CREDENTIAL_ID",
      "name": "Neon PostgreSQL - MASH"
    }
  }
}
```

**Key Changes:**
- ✅ Table name: `Unitek_interviewers` → `growers`
- ✅ Field mapping: `interviewer name` → `name`, `available` → handled in `availability_slots`
- ✅ Added `WHERE role = 'SELLER'` filter
- ✅ Raw SQL with explicit column selection

---

### 2. Create Interview Record → Insert Appointment

**Supabase (Original):**
```json
{
  "name": "Create Interview Record",
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_enrollers",
    "operation": "create",
    "fieldsUi": {
      "fieldValues": [
        {"fieldId": "enroller name", "fieldValue": "={{ $json.body.args.name }}"},
        {"fieldId": "nationality id", "fieldValue": "={{ $json.body.args.nationality_number }}"},
        {"fieldId": "interviewer name", "fieldValue": "={{ $fromAI('...') }}"}
      ]
    }
  }
}
```

**Neon PostgreSQL (Converted):**
```json
{
  "name": "Create Appointment",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "executeQuery",
    "query": "INSERT INTO appointments (buyer_uid, buyer_name, buyer_email, buyer_phone, seller_uid, seller_name, product_type, quantity_kg, scheduled_time, location, status, meeting_type, notes) VALUES ('{{ $('Webhook').item.json.body.buyerUid }}', '{{ $('Webhook').item.json.body.buyerName }}', '{{ $('Webhook').item.json.body.buyerEmail }}', '{{ $('Webhook').item.json.body.buyerPhone }}', '{{ $('Webhook').item.json.body.sellerUid }}', '{{ $('Webhook').item.json.body.sellerName }}', '{{ $('Webhook').item.json.body.productType }}', {{ $('Webhook').item.json.body.quantity }}, '{{ $('Webhook').item.json.body.scheduledTime }}'::TIMESTAMP, '{{ $('Webhook').item.json.body.location }}', 'pending', '{{ $('Webhook').item.json.body.meetingType || 'consultation' }}', '{{ $('Webhook').item.json.body.notes || '' }}') RETURNING id, buyer_uid, seller_uid, product_type, scheduled_time, status, created_at;",
    "additionalFields": {}
  }
}
```

**Key Changes:**
- ✅ Table name: `Unitek_enrollers` → `appointments`
- ✅ Field mapping:
  - `nationality id` → `buyer_uid`
  - `enroller name` → `buyer_name`
  - `interviewer name` → `seller_name`
  - `date of interview` → `scheduled_time`
- ✅ Added NEW fields: `product_type`, `quantity_kg`, `location`, `meeting_type`, `notes`
- ✅ Using `RETURNING` clause to get inserted data back
- ✅ Explicit type casting for timestamp: `::TIMESTAMP`

---

### 3. Delete Interviewer Record → Update Availability Slot

**Supabase (Original):**
```json
{
  "name": "Delete Interviewer Record",
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_interviewers",
    "operation": "delete",
    "filterType": "manual",
    "matchingColumns": [
      {"column": "interviewer name", "value": "={{ $fromAI('...') }}"},
      {"column": "available", "value": "={{ $fromAI('...') }}"}
    ]
  }
}
```

**Neon PostgreSQL (Converted):**
```json
{
  "name": "Mark Slot as Booked",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "executeQuery",
    "query": "UPDATE availability_slots SET is_available = FALSE, booked_by = '{{ $('Webhook').item.json.body.buyerUid }}', appointment_id = '{{ $('Create Appointment').item.json.id }}'::UUID, updated_at = CURRENT_TIMESTAMP WHERE id = '{{ $('Webhook').item.json.body.slotId }}'::UUID RETURNING id, seller_uid, available_date, start_time, is_available;",
    "additionalFields": {}
  }
}
```

**Key Changes:**
- ✅ Operation: DELETE → UPDATE (don't delete slots, mark as unavailable)
- ✅ Table: `Unitek_interviewers` → `availability_slots`
- ✅ Logic: Set `is_available = FALSE` instead of deleting row
- ✅ Added foreign key: `appointment_id` links to `appointments.id`
- ✅ UUID type casting: `::UUID` for id fields

---

### 4. Fetch Enroller Record → Query Appointments

**Supabase (Original):**
```json
{
  "name": "Fetch Enroller Record",
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_enrollers",
    "operation": "get",
    "filterType": "manual",
    "matchingColumns": [
      {"column": "nationality id", "value": "={{ $json.body.args.nationality_number }}"}
    ],
    "returnAll": false
  }
}
```

**Neon PostgreSQL (Converted):**
```json
{
  "name": "Query Appointments",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT id AS appointment_id, buyer_uid, buyer_name, buyer_email, seller_uid, seller_name, product_type, quantity_kg, scheduled_time, location, status, meeting_type, notes, created_at, updated_at FROM appointments WHERE CASE WHEN '{{ $('Webhook').item.json.body.userType }}' = 'buyer' THEN buyer_uid = '{{ $('Webhook').item.json.body.userId }}' WHEN '{{ $('Webhook').item.json.body.userType }}' = 'seller' THEN seller_uid = '{{ $('Webhook').item.json.body.userId }}' ELSE FALSE END ORDER BY scheduled_time DESC;",
    "additionalFields": {}
  }
}
```

**Key Changes:**
- ✅ Table: `Unitek_enrollers` → `appointments`
- ✅ Filter field: `nationality id` → `buyer_uid` OR `seller_uid` (role-based)
- ✅ Added `CASE` statement for flexible buyer/seller queries
- ✅ All appointment fields returned
- ✅ Sorted by `scheduled_time DESC` (newest first)

---

### 5. Update Enroller Record → Update Appointment Status

**Supabase (Original):**
```json
{
  "name": "Update Enroller Record",
  "type": "n8n-nodes-base.supabaseTool",
  "parameters": {
    "tableId": "Unitek_enrollers",
    "operation": "update",
    "filterType": "manual",
    "matchingColumns": [
      {"column": "nationality id", "value": "={{ $json.body.args.nationality_number }}"}
    ],
    "fieldsUi": {
      "fieldValues": [
        {"fieldId": "interviewer name", "fieldValue": "={{ $fromAI('new_interviewer') }}"},
        {"fieldId": "date of interview", "fieldValue": "={{ $fromAI('new_date') }}"}
      ]
    }
  }
}
```

**Neon PostgreSQL (Converted):**
```json
{
  "name": "Update Appointment to Cancelled",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "executeQuery",
    "query": "UPDATE appointments SET status = 'cancelled', cancel_reason = '{{ $('Webhook').item.json.body.cancelReason || 'User cancelled' }}', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = '{{ $('Webhook').item.json.body.appointmentId }}'::UUID RETURNING id, status, cancelled_at;",
    "additionalFields": {}
  }
}
```

**Key Changes:**
- ✅ Filter: `nationality id` → `id` (direct appointment ID)
- ✅ Status field: `status = 'cancelled'` (enum-like value)
- ✅ Added audit fields: `cancel_reason`, `cancelled_at`, `updated_at`
- ✅ UUID type casting for `id`

---

## 🗂️ Field Mapping Reference

### Original Supabase → MASH PostgreSQL

| Supabase Table | Supabase Field | PostgreSQL Table | PostgreSQL Field | Type | Notes |
|----------------|----------------|------------------|------------------|------|-------|
| `Unitek_interviewers` | `interviewer name` | `growers` | `name` | VARCHAR(255) | Seller's full name |
| `Unitek_interviewers` | `available` | `availability_slots` | `available_date` | DATE | Moved to separate table |
| `Unitek_interviewers` | `location` | `growers` | `location` | VARCHAR(255) | City/region |
| `Unitek_enrollers` | `nationality id` | `appointments` | `buyer_uid` | VARCHAR(255) | Firebase Auth UID |
| `Unitek_enrollers` | `enroller name` | `appointments` | `buyer_name` | VARCHAR(255) | Buyer's full name |
| `Unitek_enrollers` | `email` | `appointments` | `buyer_email` | VARCHAR(255) | Same field |
| `Unitek_enrollers` | `phone_number` | `appointments` | `buyer_phone` | VARCHAR(50) | Same field |
| `Unitek_enrollers` | `program` | `appointments` | `meeting_type` | VARCHAR(50) | consultation/farm_tour/bulk_order |
| `Unitek_enrollers` | `date of interview` | `appointments` | `scheduled_time` | TIMESTAMP | Date + time combined |
| N/A | N/A | `appointments` | `product_type` | VARCHAR(255) | **NEW:** Mushroom type |
| N/A | N/A | `appointments` | `quantity_kg` | INTEGER | **NEW:** Order quantity |
| N/A | N/A | `appointments` | `status` | VARCHAR(50) | **NEW:** pending/confirmed/cancelled/completed |
| N/A | N/A | `availability_slots` | `start_time` | TIME | **NEW:** Slot start |
| N/A | N/A | `availability_slots` | `end_time` | TIME | **NEW:** Slot end |
| N/A | N/A | `availability_slots` | `is_available` | BOOLEAN | **NEW:** Booking status |

---

## 🔧 SQL Pattern Conversions

### Pattern 1: Get All Records

**Supabase Tool:**
```json
{
  "operation": "getAll",
  "tableId": "table_name",
  "returnAll": true
}
```

**PostgreSQL:**
```sql
SELECT * FROM table_name;
```

---

### Pattern 2: Get with Filter

**Supabase Tool:**
```json
{
  "operation": "get",
  "filterType": "manual",
  "matchingColumns": [
    {"column": "user_id", "value": "123"}
  ]
}
```

**PostgreSQL:**
```sql
SELECT * FROM table_name WHERE user_id = '123';
```

---

### Pattern 3: Insert Record

**Supabase Tool:**
```json
{
  "operation": "create",
  "fieldsUi": {
    "fieldValues": [
      {"fieldId": "name", "fieldValue": "John"},
      {"fieldId": "email", "fieldValue": "john@example.com"}
    ]
  }
}
```

**PostgreSQL:**
```sql
INSERT INTO table_name (name, email) 
VALUES ('John', 'john@example.com')
RETURNING *;
```

---

### Pattern 4: Update Record

**Supabase Tool:**
```json
{
  "operation": "update",
  "matchingColumns": [{"column": "id", "value": "123"}],
  "fieldsUi": {
    "fieldValues": [{"fieldId": "status", "fieldValue": "active"}]
  }
}
```

**PostgreSQL:**
```sql
UPDATE table_name 
SET status = 'active', updated_at = CURRENT_TIMESTAMP 
WHERE id = '123'
RETURNING *;
```

---

### Pattern 5: Delete Record

**Supabase Tool:**
```json
{
  "operation": "delete",
  "matchingColumns": [{"column": "id", "value": "123"}]
}
```

**PostgreSQL:**
```sql
DELETE FROM table_name WHERE id = '123';
```

---

## 🎯 AI Agent Prompt Updates

### Original Supabase Prompt:
```
Check the "interviewers" table for the earliest available interviewer.
If no interviewers exist, output: {"error": "No interviewers available"}.
Otherwise:
  - create a row in the "Unitek_enrollers" table with enroller details.
  - delete the interviewer's row in the "Unitek_interviewers" table.
Return JSON with appointment details.
```

### Updated PostgreSQL Prompt:
```
Check the "availability_slots" table for the earliest available slot where is_available = TRUE and available_date >= CURRENT_DATE.
If no slots exist, output: {"error": "No available appointment slots"}.
Otherwise:
  1. INSERT into "appointments" table with buyer_uid, buyer_name, buyer_email, seller_uid, seller_name, product_type, quantity_kg, scheduled_time, location, status='pending', meeting_type, notes.
  2. UPDATE the selected "availability_slots" row: SET is_available = FALSE, booked_by = buyer_uid, appointment_id = [inserted appointment id], updated_at = CURRENT_TIMESTAMP.
  3. Return JSON with appointment_id, scheduled_time, seller details, and confirmation message.
```

---

## 🔐 Credential Configuration

### Supabase Credential (Original):
```
Type: Supabase API
URL: https://project-id.supabase.co
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Neon PostgreSQL Credential (MASH):
```
Type: Postgres
Host: ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech
Database: Namias
User: Namias_owner
Password: SyuJeBKs09iN
Port: 5432
SSL: Enabled (Required)
SSL Mode: require
```

**Connection String:**
```
postgresql://Namias_owner:SyuJeBKs09iN@ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech/Namias?sslmode=require
```

---

## ⚙️ Common Issues & Solutions

### Issue 1: SSL Required Error

**Error:**
```
no pg_hba.conf entry for host, SSL off
```

**Solution:**
- In n8n PostgreSQL credential, check ✅ **SSL** box
- Set **SSL Mode** to `require`

---

### Issue 2: UUID Type Mismatch

**Error:**
```
invalid input syntax for type uuid: "some-string"
```

**Solution:**
Cast string to UUID in SQL:
```sql
WHERE id = '{{ $json.id }}'::UUID
```

---

### Issue 3: Timestamp Format

**Error:**
```
invalid input syntax for type timestamp
```

**Solution:**
Use explicit casting:
```sql
VALUES ('2026-01-15T10:00:00'::TIMESTAMP)
```

---

### Issue 4: Connection Timeout

**Error:**
```
connect ETIMEDOUT
```

**Solution:**
- Check firewall allows port 5432
- Verify host DNS resolves correctly
- Try increasing timeout in n8n settings

---

## 📋 Migration Checklist

- [ ] All Supabase Tool nodes identified
- [ ] PostgreSQL credential created in n8n
- [ ] SSL enabled and tested
- [ ] Tables created in Neon with indexes
- [ ] Field mappings documented
- [ ] SQL queries written for each operation
- [ ] AI prompts updated for new schema
- [ ] Test queries validated
- [ ] Workflow imported and activated
- [ ] End-to-end tests passed

---

## 🎓 Learning Resources

- [Neon PostgreSQL Docs](https://neon.tech/docs/introduction)
- [n8n PostgreSQL Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/)
- [PostgreSQL RETURNING Clause](https://www.postgresql.org/docs/current/dml-returning.html)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html)

---

**Status:** Complete conversion guide  
**Next:** Create n8n workflow JSON file with PostgreSQL nodes
