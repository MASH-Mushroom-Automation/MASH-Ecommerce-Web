# 🚀 QUICK COMMANDS - Run Production Test with COD

**Copy-paste these commands to test Lalamove with Cash on Delivery!**

---

## ✅ STEP 1: Update Environment File

**File:** `.env.local` (in project root)

**Replace these lines** (around line 40-44):

```env
# OLD (Sandbox)
LALAMOVE_API_KEY="pk_test_8611e4fa8a2f51f6664d26aded0e5d2b"
LALAMOVE_API_SECRET="sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq"
LALAMOVE_HOST="https://rest.sandbox.lalamove.com"

# NEW (Production) - Get keys from https://business.lalamove.com/settings/api
LALAMOVE_API_KEY="pk_prod_YOUR_PRODUCTION_KEY_HERE"
LALAMOVE_API_SECRET="sk_prod_YOUR_PRODUCTION_SECRET_HERE"
LALAMOVE_HOST="https://rest.lalamove.com"
LALAMOVE_MARKET="PH"
```

---

## 🎯 STEP 2: Run Test WITHOUT COD (Just Quotation)

**Command:**

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"
node scripts/test-lalamove-delivery.js
```

**What happens:**
- Gets quotation (₱64-₱100)
- Shows delivery details
- Does NOT place order
- No money charged
- Safe to test API connection

---

## 💰 STEP 3: Run Test WITH COD (₱500 Collection)

**Commands:**

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"
set LALAMOVE_COD_AMOUNT=500
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

**What happens:**
- Gets quotation (₱64-₱100)
- 10-second countdown warning
- Places REAL order with COD enabled
- Driver will collect ₱500 from Mary Jane
- You pay ₱64 delivery fee
- You receive ₱500 - ₱64 = ₱436 net

**⚠️ WARNING: This charges REAL money!**

---

## 📊 STEP 4: Test Different COD Amounts

### Test with ₱1,000 COD

```powershell
set LALAMOVE_COD_AMOUNT=1000
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

### Test with ₱250 COD

```powershell
set LALAMOVE_COD_AMOUNT=250
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

### Test WITHOUT COD (driver doesn't collect)

```powershell
set LALAMOVE_COD_AMOUNT=
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

---

## 🔍 STEP 5: Verify COD in Output

**Look for this in terminal:**

```
💰 CASH ON DELIVERY ENABLED!
   Amount to collect: ₱500

📦 Order Details:
   Quotation ID: 3372666667334578492
   Delivery Fee: ₱64
   COD Amount: ₱500
   Net to You: ₱436

⚠️  DRIVER WILL COLLECT ₱500 FROM MARY JANE
```

**If you see "NO COD" message:**
```
💳 NO COD - Driver will NOT collect payment
```
→ COD is disabled. Set `LALAMOVE_COD_AMOUNT` environment variable.

---

## 📱 STEP 6: Notify Mary Jane Before Test

**Send this SMS/message:**

```
Hi Mary Jane!

Test delivery coming your way soon!

📦 Package: Test item
💰 Payment: ₱500 CASH ON DELIVERY
📍 Location: Phone Craft Cellphone Repair

Driver will collect ₱500 cash from you.
Please prepare exact change!

Thanks!
- Paulo
```

---

## 🎉 STEP 7: After Successful Delivery

**Document results:**

1. Order ID: ________________
2. Quotation Amount: ₱______
3. COD Amount: ₱500 ✅
4. Delivery Time: _____ minutes
5. Issues: None / [describe]
6. Mary Jane paid cash? YES ✅
7. Driver gave receipt? YES ✅

**Update documentation:**
- `.github/PRODUCTION_TEST_PLAN.md` - Add results section
- `.github/LALAMOVE_COD_GUIDE.md` - Update with actual experience
- `RUN_PRODUCTION_TEST_NOW.md` - Add notes for future tests

---

## 🚨 EMERGENCY COMMANDS

### Cancel Order (within 5 minutes)

**Use Postman:**
1. Open `.github/postman/MASH-Lalamove-PH.postman_collection.json`
2. Run **Test 9: Cancel Order**
3. Enter order ID from test output

**Or call Lalamove:**
- Phone: +63 2 8234 5678
- Say: "Cancel order {orderId}"

### Check Order Status

```powershell
# Replace {orderId} with actual order ID
curl -X GET "https://rest.lalamove.com/v3/orders/{orderId}" ^
  -H "Authorization: Bearer %LALAMOVE_API_KEY%" ^
  -H "Content-Type: application/json"
```

### Check Settlement Report

**After 7 days (next Monday):**
1. Go to: https://business.lalamove.com/reports
2. Select "COD Settlements"
3. Find your test order
4. Verify net amount: ₱436 (₱500 - ₱64)

---

## 📚 COMPLETE DOCUMENTATION

**Quick Start:**
- `RUN_PRODUCTION_TEST_NOW.md` - Step-by-step production test

**COD Guide:**
- `.github/LALAMOVE_COD_GUIDE.md` - Complete COD documentation

**Integration Guide:**
- `.github/LALAMOVE_INTEGRATION_COMPLETE.md` - Full API docs

**Test Results:**
- `.github/LALAMOVE_SUCCESS_REPORT.md` - Sandbox test results

**Postman Collection:**
- `.github/postman/MASH-Lalamove-PH.postman_collection.json`

---

## ✅ PRE-FLIGHT CHECKLIST

**Before running production test:**

- [ ] Production API keys in `.env.local`
- [ ] Paulo at 266 Quirino Hwy with package
- [ ] Mary Jane at Phone Craft ready to receive
- [ ] Mary Jane has ₱500 cash ready
- [ ] Both phone numbers verified (+63 932 767 7205, +63 927 253 3969)
- [ ] Lalamove account has ₱100+ balance
- [ ] You understand this is REAL delivery
- [ ] Emergency contacts saved

**ALL CHECKED?** → Run Step 3 commands! 🚀

---

**Questions?**
- Read: `.github/LALAMOVE_COD_GUIDE.md`
- Support: +63 2 8234 5678
- Email: partner.support@lalamove.com

**🎉 You're ready to test COD delivery!** 💰
