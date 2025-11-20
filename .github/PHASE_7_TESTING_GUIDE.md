# 🧪 Phase 7 Testing Guide - Inventory Management

**Phase Status**: ✅ Implementation Complete - Ready for Testing  
**Date**: November 20, 2025  
**Time to Test**: ~15 minutes

---

## 🎯 What to Test

Phase 7 added **real-time inventory management** with automatic stock tracking, low stock alerts, and out-of-stock detection.

---

## 📋 Testing Checklist

### Test 1: Verify Development Servers Running ✅

```bash
# Should see both servers running:
npm run dev          # Next.js on http://localhost:3001
cd studio && npm run dev  # Sanity Studio on http://localhost:3333
```

**Expected Result**: Both servers running without errors

---

### Test 2: Enable Inventory Tracking in Sanity Studio

1. Open **Sanity Studio**: http://localhost:3333
2. Navigate to **Products** in sidebar
3. Select any product (or create a new one)
4. Scroll down to **Inventory Management** section
5. Set these values:
   - ✅ **Track Inventory**: `true`
   - **Quantity in Stock**: `50`
   - **Low Stock Threshold**: `10`
   - **Allow Backorders**: `false`
6. Click **Publish** button

**Expected Result**: Product saved with inventory tracking enabled

---

### Test 3: View Real-Time Inventory Dashboard

1. Open **Inventory Dashboard**: http://localhost:3001/inventory-dashboard
2. Check if your product appears in the list
3. Verify the summary cards show:
   - **Total Products**: Shows correct count
   - **In Stock**: Your product should be here (50 units)
   - **Low Stock Alerts**: Should be 0
   - **Out of Stock**: Should be 0

**Expected Result**: Dashboard shows live inventory data with correct counts

---

### Test 4: Test Real-Time Updates (1-2 Seconds)

1. Keep the **Inventory Dashboard** open in your browser
2. Open **Sanity Studio** in another tab
3. Edit the same product:
   - Change **Quantity in Stock** from `50` to `8`
   - Click **Publish**
4. **Switch back to Dashboard tab** - Don't refresh!

**Expected Result**: 
- Dashboard updates automatically in **1-2 seconds**
- Product moves to "Low Stock" status
- Low Stock count increases by 1
- Console shows: `🔄 [INVENTORY] Product updated in real-time!`

---

### Test 5: Test Out of Stock Detection

1. In Sanity Studio, edit the product again:
   - Change **Quantity in Stock** to `0`
   - Click **Publish**
2. Watch the Dashboard

**Expected Result**:
- Dashboard updates in 1-2 seconds
- Product shows "❌ Out of Stock" badge
- Out of Stock count increases by 1
- Low Stock count decreases by 1

---

### Test 6: Test Stock Badges on Product Cards

1. Open **Shop Page**: http://localhost:3001/shop
2. Find your product in the catalog
3. Look for the **stock badge** below the product name

**Expected Result**:
- Product card shows stock badge (e.g., "Out of Stock")
- Badge color matches status (red for out of stock)
- Badge updates in real-time when you change stock in Sanity

---

### Test 7: Test Backorder Feature

1. In Sanity Studio, with stock at `0`:
   - Toggle **Allow Backorders** to `true`
   - Click **Publish**
2. Check Dashboard and Shop page

**Expected Result**:
- Badge text changes to "Backorder available"
- Dashboard shows "Backorders enabled" tag

---

### Test 8: Test Low Stock Threshold

1. In Sanity Studio:
   - Set **Quantity in Stock** to `15`
   - Set **Low Stock Threshold** to `20`
   - Click **Publish**
2. Check Dashboard

**Expected Result**:
- Product shows "⚠️ Low Stock" status
- Message: "Only 15 left!"
- Low Stock card count increases

---

## 🎉 Success Criteria

All tests should pass with these results:

- ✅ Inventory Dashboard loads without errors
- ✅ Products with `trackInventory: true` appear in dashboard
- ✅ Real-time updates happen in **1-2 seconds**
- ✅ Stock badges display correctly on product cards
- ✅ Low stock alerts trigger at threshold
- ✅ Out of stock detection works
- ✅ Backorder toggle affects badge text
- ✅ Summary cards show accurate counts
- ✅ Console logs show real-time subscription messages

---

## 🐛 Troubleshooting

### Problem: Dashboard shows "Loading inventory..."
**Solution**: 
- Check if any products have `inventory.trackInventory = true`
- Verify Sanity Studio is running
- Check browser console for errors

### Problem: Real-time updates not working
**Solution**:
- Check console for: `🧹 [INVENTORY] Setting up real-time subscription...`
- Verify WebSocket connection (check Network tab in DevTools)
- Restart Next.js dev server

### Problem: Stock badges not showing on product cards
**Solution**:
- Verify product has `inventory.trackInventory = true`
- Check product ID matches between Sanity and frontend
- Ensure StockBadge component is imported in ProductCard.tsx

### Problem: "No Products Tracked" message
**Solution**:
- Go to Sanity Studio
- Edit a product
- Enable "Track Inventory" toggle
- Publish the product

---

## 📊 What You Should See in Console

When everything works correctly, your console should show:

```
📦 [INVENTORY] Fetching inventory from Sanity CMS...
🧹 [INVENTORY] Setting up real-time subscription...
📊 [INVENTORY] Inventory loaded: { total: 5, inStock: 3, lowStock: 1, outOfStock: 1 }
```

When you update stock in Sanity Studio:

```
🔄 [INVENTORY] Product updated in real-time! Refreshing inventory...
📦 [INVENTORY] Fetching inventory from Sanity CMS...
📊 [INVENTORY] Inventory loaded: { total: 5, inStock: 2, lowStock: 2, outOfStock: 1 }
```

---

## 🚀 Next Steps

Once testing is complete:

1. Mark Test 6 as complete in todo list
2. Update master plan with test results
3. **Start Phase 8**: Customer Reviews System (2 hours)

---

## 📸 Expected Screenshots

### Inventory Dashboard
- Summary cards with counts
- Live product inventory table
- Color-coded status badges
- "Live" indicator (green dot)

### Product Card
- Stock badge below product name
- Badge matches current stock status
- Updates without page refresh

### Sanity Studio
- Inventory Management section in product
- All inventory fields visible
- Stock history array (read-only)

---

**Testing Time**: 15 minutes  
**Next Phase**: Phase 8 - Customer Reviews  
**Progress**: 7 of 12 phases complete (58%)
