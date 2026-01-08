# 🚀 START HERE: Phase 1 - Database Setup

**Time Required:** 5-10 minutes  
**Difficulty:** Easy (Copy & Paste)

---

## ✅ What You'll Accomplish

- [x] Create 3 PostgreSQL tables in Neon (growers, availability_slots, appointments)
- [x] Create 8 performance indexes
- [x] Seed 3 test sellers
- [x] Generate 672 available time slots (3 sellers × 7 days × 8 hours)
- [x] Add 2 sample appointments

---

## 📋 Step-by-Step Instructions

### Step 1: Open Neon SQL Editor (30 seconds)

1. Go to: **https://console.neon.tech**
2. **Login** with your account
3. Select project: **"Namias"**
4. Click **"SQL Editor"** tab (left sidebar - looks like `</>` icon)
5. Click **"+ New Query"** button (top right)

You should see a blank SQL editor panel.

---

### Step 2: Run Database Setup Script (2 minutes)

1. **Open the file:** `01-setup-database.sql` in this folder
2. **Select ALL content** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. **Paste** into Neon SQL Editor (Ctrl+V)
5. **Click "Run" button** (top right, green play icon ▶️)

**Wait for:** "Query completed successfully" message (appears ~30 seconds)

---

### Step 3: Verify Data (1 minute)

The script automatically runs verification queries. Look for output at bottom:

```
table_name              | row_count
------------------------|----------
Growers                 | 3
Availability Slots      | 672
Appointments            | 2
```

✅ **If you see these numbers, Phase 1 is COMPLETE!**

---

## ❌ Troubleshooting

### Problem: "relation already exists"
**Solution:** Tables already created, skip Step 2. Proceed to Phase 2.

### Problem: "permission denied"
**Solution:** Check you're logged into correct Neon account (Namias_owner)

### Problem: "connection timeout"
**Solution:** Refresh page, ensure stable internet, try again

### Problem: Row count is 0
**Solution:** Re-run the INSERT statements from `01-setup-database.sql` (Step 4-6 sections)

---

## 🎯 Next Steps

### ✅ Phase 1 Complete? Proceed to Phase 2:

**Option A: Configure n8n Credential Manually**
- Open [NEXT-STEPS-POSTGRESQL.md](NEXT-STEPS-POSTGRESQL.md)
- Follow "Phase 2: n8n PostgreSQL Credentials"
- Takes ~5 minutes

**Option B: Import Complete Workflow (FASTEST)**
- I'll create the complete workflow JSON file
- You import it into n8n in 2 minutes
- All 5 appointment actions ready instantly
- **Reply:** "Create workflow JSON"

---

## 📊 What You Created

### Tables Structure

**growers** - Seller profiles
- 3 rows (Manila Urban Farm, Quezon City Growers, Makati Mushroom Co)
- Fields: name, email, phone, specialty, location, capacity, rating

**availability_slots** - Time slots
- 672 rows (next 7 days, 9 AM - 5 PM, 1-hour slots)
- Fields: seller_uid, date, start_time, end_time, is_available

**appointments** - Bookings
- 2 sample rows (1 confirmed, 1 pending)
- Fields: buyer info, seller info, product, quantity, scheduled time, status

---

## 🔍 Explore Your Data

Run these queries in Neon SQL Editor:

```sql
-- View all sellers
SELECT * FROM growers ORDER BY rating DESC;

-- View available slots for tomorrow
SELECT seller_uid, available_date, start_time 
FROM availability_slots 
WHERE is_available = TRUE 
AND available_date = CURRENT_DATE + 1
ORDER BY start_time;

-- View appointments
SELECT buyer_name, seller_name, product_type, scheduled_time 
FROM appointments 
ORDER BY scheduled_time;
```

---

## ⏭️ Ready for Phase 2?

**Choose your path:**

1. **Manual Setup** - "Go to Phase 2" (I'll guide you through n8n credential config)
2. **Fast Track** - "Create workflow JSON" (Get complete workflow file ready to import)

Reply with your choice and I'll continue! 🎉
