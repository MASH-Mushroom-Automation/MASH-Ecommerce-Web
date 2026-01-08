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
| **START-HERE.md** | ⭐ Quick start guide for Phase 1 (database setup) | ✅ Complete |
| **IMPORT-WORKFLOW-GUIDE.md** | ⚡ Fast track: Import workflow in 5 minutes | ✅ Complete |
| **workflow-neon-complete.json** | Complete n8n workflow (30+ nodes, 5 actions) | ✅ Complete |
| **01-setup-database.sql** | Single SQL script for complete database setup | ✅ Complete |
| **test-neon-workflow.ps1** | Automated test suite (5 comprehensive tests) | ✅ Complete |
| **TROUBLESHOOTING-N8N.md** | 🆘 Fix Ollama, PostgreSQL, and workflow errors | ✅ Complete |
| **PLANNING.md** | Complete 8-phase implementation guide | ✅ Complete |
| **SUPABASE_TO_POSTGRESQL_CONVERSION.md** | Supabase → PostgreSQL node mappings | ✅ Complete |
| **NEXT-STEPS-POSTGRESQL.md** | Detailed step-by-step implementation guide | ✅ Complete |

---

## 🚀 Quick Start (Choose Your Path)

### ⚡ FASTEST: Import Complete Workflow (5 minutes)

1. **Setup Database** (2 min)
   - Open [START-HERE.md](START-HERE.md)
   - Run `01-setup-database.sql` in Neon Console
   - Creates 3 tables, 8 indexes, seeds 672 test slots

2. **Import Workflow** (3 min)
   - Open [IMPORT-WORKFLOW-GUIDE.md](IMPORT-WORKFLOW-GUIDE.md)
   - Import `workflow-neon-complete.json` into n8n
   - Configure PostgreSQL credential (copy-paste connection details)

3. **Test Everything** (2 min)
   ```powershell
   .\test-neon-workflow.ps1
   ```
   Expected: 5 tests pass ✅

**Total time: 10 minutes to working AI appointment system!**

---

### 📚 DETAILED: Step-by-Step Manual Build

1. Read [PLANNING.md](PLANNING.md) - Complete 8-phase technical plan
2. Follow [NEXT-STEPS-POSTGRESQL.md](NEXT-STEPS-POSTGRESQL.md) - Detailed implementation guide
3. Use [SUPABASE_TO_POSTGRESQL_CONVERSION.md](SUPABASE_TO_POSTGRESQL_CONVERSION.md) - Query pattern reference

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

Before starting, ensure you have:

- [x] **Neon PostgreSQL account** (free tier OK) - Sign up at https://console.neon.tech
- [x] **n8n running** locally at http://localhost:5678 (see ai-002-n8n-setup if needed)
- [x] **Ollama installed** with Llama 3.2 3B: `ollama pull llama3.2:latest`
- [x] **Docker Desktop** installed and running
- [ ] **PostgreSQL credential** configured in n8n → Follow [IMPORT-WORKFLOW-GUIDE.md](IMPORT-WORKFLOW-GUIDE.md) Step 2
- [ ] **Database tables** created → Run `01-setup-database.sql` in Neon Console

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
