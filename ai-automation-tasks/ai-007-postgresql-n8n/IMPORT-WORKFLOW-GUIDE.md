# ⚡ FASTEST PATH: Import Workflow in 5 Minutes

**Total Time:** 5-10 minutes  
**Difficulty:** Easy  
**Result:** Complete AI-powered appointment system ready to test

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] n8n running at http://localhost:5678
- [ ] Ollama installed with Llama 3.2 model (`ollama pull llama3.2:latest`)
- [ ] Database setup completed (see [START-HERE.md](START-HERE.md) Phase 1)
- [ ] Workflow file ready: `workflow-neon-complete.json`

---

## 🚀 Step 1: Import Workflow (2 minutes)

### 1.1 Open n8n

1. Go to: **http://localhost:5678**
2. Click **"Workflows"** (left sidebar)
3. Click **"+ Add Workflow"** button (top right)

### 1.2 Import JSON

1. **Click the 3-dot menu** (top right, next to workflow name)
2. Select **"Import from File..."**
3. **Choose file:** `workflow-neon-complete.json` from this folder
4. Click **"Open"**

✅ **You should now see the complete workflow with 30+ nodes!**

---

## 🔧 Step 2: Configure PostgreSQL Credential (3 minutes)

### 2.1 Create Neon Credential

1. **Click Settings** (bottom left, gear icon ⚙️)
2. Click **"Credentials"** tab
3. Click **"+ Add Credential"** button
4. Search: **"postgres"**
5. Select: **"Postgres account"**

### 2.2 Fill Connection Details

```
Name: Neon PostgreSQL - MASH
Host: ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech
Database: Namias
User: Namias_owner
Password: SyuJeBKs09iN
Port: 5432
SSL: ✅ ENABLE (CHECK THIS BOX!)
SSL Mode: require
```

### 2.3 Test Connection

1. Click **"Test"** button (bottom of form)
2. **Expected:** ✅ "Connection successful"
3. Click **"Save"** button

---

## 🔗 Step 3: Link Credential to Workflow (2 minutes)

### 3.1 Assign Credential to PostgreSQL Nodes

1. **Go back to workflow** (click "< Back to Workflows" or press Esc)
2. **Select the first PostgreSQL node** ("Query Growers")
3. In right panel, find **"Credential for Postgres"**
4. Click dropdown → Select **"Neon PostgreSQL - MASH"**
5. **Repeat for ALL PostgreSQL nodes:**
   - Query Growers
   - Get Seller Available Slots
   - Query Availability Slots
   - Check Slot Available
   - Create Appointment
   - Mark Slot as Booked
   - Get Appointment
   - Cancel Appointment
   - Release Slot
   - Query Appointments

**⚡ Quick Tip:** Hold Ctrl and click multiple PostgreSQL nodes, then assign credential once!

---

## 💾 Step 4: Save & Activate Workflow (30 seconds)

1. **Rename workflow** (click "My workflow" at top)
   - New name: **"MASH Appointment System - PostgreSQL"**
2. **Save workflow:** Press **Ctrl+S** or click "Save" button
3. **Activate workflow:** Toggle the **"Active" switch** (top right) to ON (green)

✅ **Your workflow is now LIVE!**

---

## 🎯 Step 5: Test with Automated Scripts (2 minutes)

### 5.1 Run Test Suite

Open PowerShell in this folder:

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\ai-automation-tasks\ai-007-postgresql-n8n"
.\test-neon-workflow.ps1
```

### 5.2 Expected Results

```
🧪 MASH PostgreSQL Appointment System - Test Suite
=================================================

✅ n8n server is running

🧪 Test 1: Find Sellers (AI matching)
✅ PASS - Found 3 sellers

🧪 Test 2: Get Availability
✅ PASS - Found 672 available slots

🧪 Test 3: Set Appointment
✅ PASS - Appointment created (ID: abc-123-uuid)

🧪 Test 4: Get Appointments
✅ PASS - Found 1 appointments

🧪 Test 5: Cancel Appointment
✅ PASS - Appointment cancelled

🎉 Test Suite Complete!
```

---

## ✅ Success Verification

### Your system is working if:

- [ ] Workflow shows "Active" (green toggle)
- [ ] All 5 tests pass (✅ green checkmarks)
- [ ] No errors in n8n "Executions" sidebar
- [ ] Data appears in Neon PostgreSQL console

### Check n8n Executions

1. Click **"Executions"** tab (left sidebar)
2. You should see 5 successful executions (green circles)
3. Click any execution to see detailed logs

### Check Database

```sql
-- Run in Neon SQL Editor
SELECT COUNT(*) FROM appointments WHERE buyer_uid = 'buyer_test_999';
-- Expected: 1 (from test script)
```

---

## 🎉 What You Have Now

### **Complete AI-Powered Appointment System:**

✅ **5 Appointment Actions:**
1. `find_sellers` - AI ranks sellers by rating, specialty, availability
2. `get_availability` - Query time slots for specific seller
3. `set_appointment` - Book appointment + mark slot unavailable (atomic)
4. `cancel_appointment` - Cancel booking + release slot
5. `get_appointments` - Get user's appointment history

✅ **Single Webhook Endpoint:**
- URL: `http://localhost:5678/webhook/mash-appointments`
- Method: POST
- All actions via `{"action": "find_sellers", ...}` body

✅ **PostgreSQL Database (Neon):**
- 3 tables: growers, availability_slots, appointments
- 8 performance indexes
- 672 test slots seeded
- Cloud-hosted, managed, auto-backups

✅ **AI Integration (Ollama):**
- Llama 3.2 3B model for intelligent matching
- Context-aware seller recommendations
- Natural language query processing

✅ **Automated Testing:**
- PowerShell test suite (5 comprehensive tests)
- Full lifecycle coverage (create → query → cancel)
- Validates database integrity

---

## 🔗 Connect to Frontend

### Update Your Next.js AppointmentWidget:

```typescript
// src/components/AppointmentWidget.tsx
const WEBHOOK_URL = "http://localhost:5678/webhook/mash-appointments";

// Example: Find sellers
const findSellers = async (productType: string, quantity: number) => {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "find_sellers",
      productType,
      quantity,
      location: "Manila",
      preferredDate: "2026-01-15"
    })
  });
  return response.json();
};
```

---

## 🆘 Troubleshooting

### Workflow not showing up?
- Refresh n8n page (F5)
- Check browser console for errors

### PostgreSQL nodes show red X?
- Verify credential is saved
- Test connection in Settings → Credentials
- Check SSL is enabled

### Tests fail with "Connection timeout"?
- Ensure Ollama is running: `ollama serve`
- Check n8n is active (not sleeping)
- Verify webhook URL: http://localhost:5678/webhook/mash-appointments

### "No sellers returned" error?
- Re-run Phase 1 database setup: `01-setup-database.sql`
- Verify 3 growers exist: `SELECT COUNT(*) FROM growers;`

---

## 📚 Next Steps

### 1. Deploy to Production
- Export workflow: Settings → Export workflow
- Set up production n8n instance (Railway, Render, DigitalOcean)
- Update frontend webhook URL

### 2. Add Email Notifications
- Install Gmail node in n8n
- Add email confirmation after appointment creation
- Send reminders 24 hours before appointment

### 3. Build Seller Dashboard
- Create seller portal in Next.js
- Show available slots, bookings, revenue
- Allow sellers to manage availability

### 4. Analytics & Insights
- Query popular products: `SELECT product_type, COUNT(*) FROM appointments GROUP BY product_type`
- Track seller performance: `SELECT seller_name, AVG(rating) FROM appointments`
- Monitor peak booking times

---

## 🎯 You're Done!

**Congratulations! Your AI-powered appointment system is:**

- ✅ Fully functional
- ✅ Database-backed (PostgreSQL)
- ✅ AI-enhanced (Ollama)
- ✅ Tested & validated
- ✅ Ready for production

**Need help?** Open an issue or check documentation:
- [PLANNING.md](PLANNING.md) - Complete technical plan
- [SUPABASE_TO_POSTGRESQL_CONVERSION.md](SUPABASE_TO_POSTGRESQL_CONVERSION.md) - Query patterns
- [NEXT-STEPS-POSTGRESQL.md](NEXT-STEPS-POSTGRESQL.md) - Detailed guides

**Time to integrate with your frontend! 🚀**
