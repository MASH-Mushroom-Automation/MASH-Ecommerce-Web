# 🚀 Run Production Test NOW - Quick Steps

**Time Required:** 5 minutes setup + 30 minutes delivery = **35 minutes total**  
**Cost:** ₱64-₱100 (one-time, non-refundable)  
**Status:** Ready to execute real delivery

---

## ✅ PRE-FLIGHT CHECKLIST (2 minutes)

**Before you start, verify:**

- [ ] Paulo is at 266 Quirino Hwy, Novaliches with package ready
- [ ] Mary Jane is at Phone Craft Cellphone Repair, Caloocan ready to receive
- [ ] Both phone numbers work (+63 932 767 7205, +63 927 253 3969)
- [ ] You have ₱100+ in Lalamove Business account
- [ ] You're okay spending ₱64-₱100 for this test
- [ ] Internet connection is stable

**If ANY checkbox is unchecked → STOP! Do not proceed.**

---

## 🔑 STEP 1: Get Production API Keys (3 minutes)

### Option A: You Already Have Production Keys

Skip to Step 2!

### Option B: Generate New Production Keys

1. Go to: https://business.lalamove.com/settings/api
2. Log in with your Lalamove Business account
3. Click "Generate Production API Keys"
4. Copy both keys (starts with `pk_prod_` and `sk_prod_`)
5. Continue to Step 2

---

## 📝 STEP 2: Update Environment File (2 minutes)

Open `.env.local` in the ROOT directory:

```powershell
# Open in VS Code
code .env.local
```

**Find these lines** (around line 40-44):

```env
# Lalamove API (Same-Day Delivery)
LALAMOVE_API_KEY="pk_test_8611e4fa8a2f51f6664d26aded0e5d2b"
LALAMOVE_API_SECRET="sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq"
LALAMOVE_HOST="https://rest.sandbox.lalamove.com"
LALAMOVE_MARKET="PH"
```

**Replace with YOUR production keys:**

```env
# Lalamove API (Same-Day Delivery) - PRODUCTION MODE
LALAMOVE_API_KEY="pk_prod_YOUR_PRODUCTION_KEY_HERE"
LALAMOVE_API_SECRET="sk_prod_YOUR_PRODUCTION_SECRET_HERE"
LALAMOVE_HOST="https://rest.lalamove.com"  # ⚠️ NO "sandbox"!
LALAMOVE_MARKET="PH"
```

**Save the file** (Ctrl+S)

**⚠️ CRITICAL:** Make sure `LALAMOVE_HOST` is `https://rest.lalamove.com` (NOT sandbox!)

---

## 🚀 STEP 3: Run Test Script (10 seconds)

Open terminal in VS Code:

```powershell
# Navigate to project
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Run test script
node scripts/test-lalamove-delivery.js
```

**You'll see:**
```
🚨 PRODUCTION MODE DETECTED - THIS IS NOT A TEST!

💰 Real Money: ~₱64-₱100 will be charged
🚗 Real Driver: Will be dispatched immediately
📞 Real Delivery: Paulo → Mary Jane

📍 Pickup: 266 Quirino Hwy, Novaliches (Paulo tongco)
📍 Dropoff: Phone Craft, Caloocan (Mary Jane Bahay)

⏱️  10-SECOND COUNTDOWN - Press Ctrl+C to cancel!

   ⏰ Starting in 10 seconds...
```

**👉 YOU HAVE 10 SECONDS TO CANCEL!**

- **Want to cancel?** Press `Ctrl+C` NOW
- **Ready to proceed?** Wait for countdown to finish

---

## 📊 STEP 4: Review Quotation (1 minute)

After countdown, script will get quotation:

```
✅ Quotation SUCCESS

quotationId: "3372666667334578492"
total: "64" PHP
distance: "4620" m
expiresAt: "2025-11-26T10:45:00Z"

Price Breakdown:
- Base: ₱39
- Extra Mileage: ₱23
- Admin Fee: ₱2
------------------
- Total: ₱64
```

**Decision time:**

✅ **Price acceptable?** → Continue to Step 5  
❌ **Too expensive?** → Press Ctrl+C to cancel (NO CHARGE yet!)

**⏰ You have 5 MINUTES to decide!** After 5 minutes, quotation expires.

---

## 🎯 STEP 5: Configure Cash on Delivery (COD) - IMPORTANT! 💰

**⚠️ CRITICAL FOR E-COMMERCE:** Enable COD so driver collects payment from Mary Jane!

### What is COD (Cash on Delivery)?

- Driver collects cash from Mary Jane (recipient)
- Driver gives money to you later (via Lalamove settlement)
- Perfect for e-commerce when customer hasn't paid online
- **Example:** Mary Jane pays ₱500 to driver → Lalamove transfers ₱500 to you

### Enable COD in Test Script:

```powershell
# Set COD amount (in PHP)
set LALAMOVE_COD_AMOUNT=500

# Enable order placement
set ENABLE_ORDER_TEST=true

# Re-run script
node scripts/test-lalamove-delivery.js
```

**COD Settings:**
- **COD Amount:** ₱500 (or your product price)
- **Delivery Fee:** ₱64-₱100 (you pay Lalamove)
- **Net Amount:** Mary Jane pays ₱500 → You receive ₱500 - ₱64 = ₱436

---

## 🎯 STEP 6: Place Order (OPTIONAL - Only if you want!)

**⚠️ THIS CHARGES YOUR ACCOUNT!**

### If Script Asks "Place order? (y/n)":

Type `y` and press Enter → Order placed immediately!

### If Script Only Shows Quotation:

Order placement is DISABLED by default for safety. To enable:

```powershell
# WITHOUT COD (driver doesn't collect money)
set ENABLE_ORDER_TEST=true

# WITH COD (driver collects ₱500 from Mary Jane)
set LALAMOVE_COD_AMOUNT=500
set ENABLE_ORDER_TEST=true

# Re-run script (will use cached quotation)
node scripts/test-lalamove-delivery.js
```

---

## 📱 STEP 6: Track Delivery (30 minutes)

**Timeline:**

| Time | Status | What's Happening |
|------|--------|------------------|
| 0-2 min | ASSIGNING_DRIVER | Finding driver |
| 2-10 min | ON_GOING | Driver going to Paulo |
| 10-15 min | PICKED_UP | Paulo gives package |
| 15-35 min | ON_GOING | Driver going to Mary Jane |
| 35-40 min | COMPLETED | Mary Jane receives |

**Track via Postman:**

1. Open Postman collection (`.github/postman/MASH-Lalamove-PH.postman_collection.json`)
2. Run **Test 6: Get Order Details** every 2 minutes
3. Check `status` field for updates

**Or use this command:**

```powershell
# Get order status (replace {orderId} with actual ID from Step 5)
curl -X GET "https://rest.lalamove.com/v3/orders/{orderId}" ^
  -H "Authorization: Bearer %LALAMOVE_API_KEY%" ^
  -H "X-LLM-Signature: {signature}"
```

---

## ☎️ STEP 7: Communication

### Driver Calls Paulo (Pickup):

**Driver:** "I'm outside 266 Quirino Highway, where are you?"  
**Paulo should say:** "I'm at the cellphone shop next to McDonald's in Susano China Town. Shop name is Paulo."

### Driver Calls Mary Jane (Dropoff):

**Driver:** "I have your delivery, where should I go?"  
**Mary Jane should say:** "I'm at Phone Craft Cellphone Repair, 936 Llano Road. We're across from INFINITY WASH, near 7-Eleven."

---

## 🎉 STEP 8: Delivery Complete!

**When Mary Jane receives package:**

✅ Delivery complete!  
✅ Order status changes to "COMPLETED"  
✅ You'll be charged the exact quotation amount  
✅ Driver receives payment automatically

**Document your results:**

1. Order ID: _____________
2. Actual cost: ₱_______
3. Total time: _____ minutes
4. Issues: None / [describe]
5. Rating: ⭐⭐⭐⭐⭐ (5 stars = perfect)

---

## 🚨 TROUBLESHOOTING

### No Driver Assigned After 5 Minutes

**Call Lalamove Support:**
- Phone: +63 2 8234 5678
- Say: "I placed order {orderId}, no driver assigned yet"

### Driver Can't Find Pickup

**Driver will call Paulo** - answer and guide them!

**Backup:** Send Google Maps link via SMS:
```
Paulo, send this to driver: https://maps.app.goo.gl/p6uNezpEBMA2mENi9
```

### Driver Can't Find Dropoff

**Driver will call Mary Jane** - answer and guide them!

**Backup:** Send Google Maps link via SMS:
```
Mary Jane, send this to driver: https://maps.app.goo.gl/7Z4qrJS6w24t2mh99
```

### Need to Cancel

**⚠️ Can only cancel within 5 minutes of driver assignment!**

```powershell
# Use Postman Test 9: Cancel Order
# Or call Lalamove Support: +63 2 8234 5678
```

---

## 📊 SUCCESS CRITERIA

**Test is successful if:**

- ✅ Quotation returned price (₱64-₱100)
- ✅ Order placed without errors
- ✅ Driver assigned within 5 minutes
- ✅ Package delivered within 45 minutes
- ✅ Paulo and Mary Jane both satisfied
- ✅ Total cost = quotation price

**Test needs improvement if:**

- ⚠️ Driver took over 10 minutes to accept
- ⚠️ Driver got lost
- ⚠️ Delivery took over 60 minutes

**Test FAILED if:**

- ❌ Order placement returned error
- ❌ No driver after 15 minutes
- ❌ Package not delivered after 90 minutes
- ❌ Package damaged

---

## 📁 AFTER TEST: Update Documentation

**Files to update:**

1. `.github/PRODUCTION_TEST_PLAN.md` - Add results section
2. `.github/LALAMOVE_SUCCESS_REPORT.md` - Update with production data
3. `.github/LALAMOVE_INTEGRATION_COMPLETE.md` - Add production notes

**Template:**

```markdown
## Production Test Results - November 26, 2025

**Order Details:**
- Order ID: {orderId}
- Quotation: ₱{price}
- Actual Charge: ₱{price}
- Distance: {distance} km
- Vehicle: MOTORCYCLE

**Timeline:**
- Quotation: 10:00 AM
- Order Placed: 10:02 AM
- Driver Assigned: 10:05 AM (+3 min)
- Pickup: 10:15 AM (+13 min)
- Dropoff: 10:40 AM (+38 min)
- **Total: 38 minutes** ✅

**Issues:** None - smooth delivery!

**Rating:** ⭐⭐⭐⭐⭐ (5/5)

**Would Use Again:** YES!
```

---

## ✅ YOU'RE READY!

**Final checklist:**

- [ ] Production API keys in `.env.local`
- [ ] Paulo and Mary Jane both ready
- [ ] Lalamove account has ₱100+ balance
- [ ] You understand this is real delivery
- [ ] Emergency contacts saved

**Run this command when ready:**

```powershell
node scripts/test-lalamove-delivery.js
```

**⏱️ Time:** 5 min setup + 30 min delivery = **35 minutes total**  
**💰 Cost:** ₱64-₱100 (one-time test)

**🎉 Let's do this!** 🚀

---

**Questions?** See `.github/PRODUCTION_TEST_PLAN.md` for detailed guide  
**Emergency?** Call Lalamove Support: +63 2 8234 5678  
**Technical Issues?** See `.github/LALAMOVE_INTEGRATION_COMPLETE.md` troubleshooting
