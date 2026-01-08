# AI-007: Neon PostgreSQL + n8n Appointment System

**Status:** 📋 Planning Complete - Ready to Implement  
**Database:** Neon PostgreSQL (Cloud, Serverless)  
**Automation:** n8n Self-Hosted  
**AI:** Ollama Llama 3.2 3B  
**Estimated Time:** 8-12 hours

---

## 📦 What's in This Folder

| File | Purpose | Status |
|------|---------|--------|
| **PLANNING.md** | Complete 8-phase implementation guide | ✅ Complete |
| **SUPABASE_TO_POSTGRESQL_CONVERSION.md** | Supabase → PostgreSQL node mappings | ✅ Complete |
| **test-neon-workflow.ps1** | Automated test suite (5 tests) | ✅ Complete |
| **NEXT-STEPS-POSTGRESQL.md** | What to do now, step-by-step | ✅ Complete |
| workflow-neon-complete.json | Complete n8n workflow (all actions) | ⏳ Pending |

---

## 🚀 Quick Start

### Step 1: Read Planning Document
Open **[PLANNING.md](PLANNING.md)** to understand:
- Database schema (3 tables: growers, availability_slots, appointments)
- All 8 implementation phases
- SQL seed scripts
- Expected outcomes

### Step 2: Follow Next Steps Guide
Open **[NEXT-STEPS-POSTGRESQL.md](NEXT-STEPS-POSTGRESQL.md)** and choose:
- **"Start Phase 1"** - Database setup (1-2 hours)
- **"Create workflow JSON"** - Get complete n8n workflow
- **"Manual build"** - Step-by-step node creation

### Step 3: Test Everything
Run automated test suite:
```powershell
.\test-neon-workflow.ps1
```

Expected: 5 tests pass (find_sellers, get_availability, set_appointment, get_appointments, cancel_appointment)

---

## 🎯 What This System Does

**5 Appointment Actions via Single Webhook:**

1. **find_sellers** - AI-powered seller matching
   - Input: Product type, quantity, location, preferred date
   - Output: Top 3 recommended sellers with available slots
   - Uses: Ollama AI for intelligent ranking

2. **get_availability** - Query available time slots
   - Input: Seller ID, optional preferred date
   - Output: All available slots grouped by date

3. **set_appointment** - Create booking + mark slot unavailable
   - Input: Buyer/seller details, slot ID, product, quantity
   - Output: Appointment ID, confirmation details
   - Atomic: Creates appointment + updates slot in transaction

4. **get_appointments** - Retrieve appointment history
   - Input: User ID, user type (buyer/seller)
   - Output: List of all appointments for user

5. **cancel_appointment** - Cancel booking + release slot
   - Input: Appointment ID, cancel reason
   - Output: Confirmation + slot released back to available

---

## 🗂️ Database Schema

### Tables

**growers** (3 rows seeded)
- Seller profiles with specialty, location, capacity, rating

**availability_slots** (672 rows seeded)
- 3 sellers × 7 days × 8 hours = 672 available time slots

**appointments** (2 sample rows)
- Booking records linking buyers to sellers

### Connection
```
postgresql://Namias_owner:SyuJeBKs09iN@ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech/Namias?sslmode=require
```

---

## 🔧 Prerequisites

- [x] Neon PostgreSQL account (free tier OK)
- [x] n8n running locally (http://localhost:5678)
- [x] Ollama installed with Llama 3.2 3B model
- [x] Docker Desktop installed
- [ ] PostgreSQL credential configured in n8n (Phase 2)
- [ ] Database tables created (Phase 1)

---

## 📚 Documentation Highlights

### PLANNING.md
- **Phase 1:** Database Setup (1-2 hours)
  - 3 CREATE TABLE statements
  - 8 CREATE INDEX statements
  - 672 availability slots seeded
  
- **Phase 2:** n8n Credentials (30 min)
  - SSL enabled (REQUIRED)
  - Connection test query

- **Phase 3-8:** Build Workflow (6-10 hours)
  - 25+ PostgreSQL nodes
  - AI integration with Ollama
  - Response formatting

### SUPABASE_TO_POSTGRESQL_CONVERSION.md
- Node-by-node conversion examples
- SQL query patterns (SELECT, INSERT, UPDATE)
- Field mapping reference
- Common issues & solutions

### test-neon-workflow.ps1
- 5 automated tests covering all actions
- PowerShell script with colored output
- Validates full appointment lifecycle

---

## ✅ Success Criteria

**Database:**
- [ ] 3 tables created with 8 indexes
- [ ] 3 growers, 672 slots, 2 appointments seeded
- [ ] SSL connection working

**n8n Workflow:**
- [ ] Webhook endpoint active
- [ ] PostgreSQL nodes configured
- [ ] All 5 actions implemented
- [ ] Workflow saved and activated

**Testing:**
- [ ] All 5 automated tests pass
- [ ] Response time <2 seconds
- [ ] Data persists in Neon
- [ ] No SQL errors in n8n logs

---

## 🆘 Troubleshooting

### "no pg_hba.conf entry for host"
✅ Enable SSL in n8n credential (checkbox + ssl mode=require)

### "connect ETIMEDOUT"
✅ Check firewall, try different network

### "invalid input syntax for type uuid"
✅ Cast strings to UUID: `'value'::UUID`

### "No sellers returned"
✅ Run Phase 1 seed scripts again

---

## 🔗 Related Files

- **AI-001:** Epic overview ([AI_AUTOMATION_GITHUB_TASKS.md](../AI_AUTOMATION_GITHUB_TASKS.md))
- **AI-002:** n8n Setup ([ai-002-n8n-setup/](../ai-002-n8n-setup/))
- **AI-003:** Ollama Setup ([ai-003-ollama-setup/](../ai-003-ollama-setup/))
- **AI-004:** Frontend Widget ([ai-004-appointment-widget/](../ai-004-appointment-widget/))
- **AI-005:** Firebase Collections (replaced by this PostgreSQL approach)

---

## 🚀 Next Actions

**Choose ONE:**

1. **Start Implementation**
   ```
   Read: NEXT-STEPS-POSTGRESQL.md
   Action: Reply "Start Phase 1"
   ```

2. **Get Complete Workflow**
   ```
   Read: PLANNING.md to understand structure
   Action: Reply "Create workflow JSON"
   ```

3. **Manual Build**
   ```
   Read: PLANNING.md Phase 3-8
   Action: Reply "Manual build Phase 3"
   ```

---

**Ready to build your AI-powered appointment system? Let's go! 🎉**
