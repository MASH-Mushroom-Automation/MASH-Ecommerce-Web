# 🚨 Lalamove API Test Results - Error Analysis & Fix Plan

**Test Date**: November 26, 2025  
**Environment**: Sandbox  
**Test Addresses**: Novaliches → Caloocan (~4km)  
**Status**: ❌ FAILED - 3 Critical Issues Found

---

## 📊 Test Summary

| Test | Status | Error Code | Issue |
|------|--------|-----------|-------|
| Get Quotation | ❌ FAILED | 422 | ERR_INVALID_LOCALE |
| Get Cities | ✅ PASSED | 200 | Success |
| Get Vehicle Types | ❌ FAILED | 401 | ERR_AUTHENTICATE (HMAC mismatch) |
| Place Order | ⏭️ SKIPPED | - | No quotation ID |

---

## 🔴 CRITICAL ISSUE #1: Invalid Locale (ERR_INVALID_LOCALE)

### Error Details
```json
{
  "errors": [
    {
      "id": "ERR_INVALID_LOCALE"
    }
  ]
}
```

### Root Cause
Lalamove API expects a **`locale`** field in the request body, which we're missing.

### Fix Required
Add `locale` field to quotation request body:

```javascript
// ❌ BEFORE (Missing locale)
{
  data: {
    market: "PH",
    serviceType: "COURIER",
    stops: [...]
  }
}

// ✅ AFTER (With locale)
{
  data: {
    market: "PH",
    language: "en_PH",  // Add this!
    serviceType: "COURIER",
    stops: [...]
  }
}
```

**Supported Locales for PH Market**:
- `en_PH` - English (Philippines) ✅ RECOMMENDED
- `tl_PH` - Tagalog (Philippines)

### Action Items
- [ ] Update `test-lalamove-delivery.js` to include `language: "en_PH"`
- [ ] Update `LALAMOVE_INTEGRATION_COMPLETE.md` Phase 1 code examples
- [ ] Add locale to all API request templates
- [ ] Update Postman collection with locale field

---

## 🔴 CRITICAL ISSUE #2: HMAC Signature Mismatch (ERR_AUTHENTICATE)

### Error Details
```json
{
  "errors": [
    {
      "id": "ERR_AUTHENTICATE",
      "message": "HMAC signature doesn't match the provided payload."
    }
  ]
}
```

### Root Cause
**GET requests with query parameters** require different signature calculation than POST requests.

### Current Signature Logic (WRONG for GET)
```javascript
// Works for POST /v3/quotations
const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;

// ❌ FAILS for GET /v3/vehicle-types?market=PH
// Because query params not included in path variable
```

### Fix Required
Include full path with query string:

```javascript
// ✅ CORRECT for GET with query params
function generateSignature(timestamp, method, fullPath, body) {
  // fullPath should include query string: "/v3/vehicle-types?market=PH"
  const rawSignature = `${timestamp}\r\n${method}\r\n${fullPath}\r\n\r\n${body}`;
  
  return crypto
    .createHmac('sha256', process.env.LALAMOVE_API_SECRET)
    .update(rawSignature)
    .digest('hex');
}

// Example usage:
const path = '/v3/vehicle-types?market=PH';  // Include query string!
const signature = generateSignature(timestamp, 'GET', path, '');
```

### Action Items
- [ ] Fix `makeRequest()` function to pass full path with query string
- [ ] Update signature generation to handle GET/POST differently
- [ ] Re-test GET endpoints (cities, vehicle types)
- [ ] Document HMAC signature rules in integration guide

---

## 🟡 ISSUE #3: City Names Not Matching

### Observation
```
Supported Cities: 
  - Cebu Islandwide
  - Manila NCR and South Luzon ✅ (This is our area!)
  - North and Central Luzon

Our Test Locations:
  - Quezon City (Pickup): ❌ Not Found
  - Caloocan (Dropoff): ❌ Not Found
```

### Analysis
Cities endpoint returns **regions**, not individual cities. Our addresses are within "Manila NCR and South Luzon" region.

### Fix Required
**No code fix needed** - this is expected behavior. The quotation API will validate addresses automatically.

### Clarification
- Lalamove PH uses **regional coverage** (NCR = National Capital Region)
- Quezon City + Caloocan are both within NCR
- The API accepts specific coordinates, not city names
- Cities endpoint is informational only

---

## 🔧 IMMEDIATE FIXES TO APPLY

### Fix 1: Add Locale to Quotation Request

**File**: `scripts/test-lalamove-delivery.js` (Lines 149-179)

```javascript
const requestBody = {
  data: {
    market: process.env.LALAMOVE_MARKET,
    language: 'en_PH',  // ✅ ADD THIS LINE
    serviceType: 'COURIER',
    stops: [
      // ... rest of config
    ]
  }
};
```

### Fix 2: Fix HMAC Signature for GET Requests

**File**: `scripts/test-lalamove-delivery.js` (Lines 70-109)

```javascript
// ❌ BEFORE
function makeRequest(method, path, body = null) {
  const url = new URL(process.env.LALAMOVE_HOST + path);
  const signature = generateSignature(timestamp, method, path, bodyString);
  // path doesn't include query params!
}

// ✅ AFTER
function makeRequest(method, path, body = null) {
  const url = new URL(process.env.LALAMOVE_HOST + path);
  
  // Use full path including query string for signature
  const pathForSignature = url.pathname + url.search;
  const signature = generateSignature(timestamp, method, pathForSignature, bodyString);
  
  const options = {
    hostname: url.hostname,
    path: pathForSignature,  // Use full path here too
    method: method,
    // ... rest of config
  };
}
```

### Fix 3: Update Integration Guide

**File**: `.github/LALAMOVE_INTEGRATION_COMPLETE.md`

Add to Phase 1 (Lines 159-220):

```typescript
// src/lib/lalamove/client.ts
async getQuotation(params) {
  const body = JSON.stringify({
    data: {
      market: this.market,
      language: 'en_PH',  // ✅ REQUIRED FIELD
      serviceType: 'COURIER',
      stops: [/* ... */],
      // ... rest of config
    }
  });
}
```

---

## 📋 COMPLETE FIX CHECKLIST

### Step 1: Update Test Script (5 min)
- [ ] Add `language: 'en_PH'` to quotation request body
- [ ] Fix `makeRequest()` to use full path with query string
- [ ] Fix signature generation to handle query params
- [ ] Re-test all endpoints

### Step 2: Update Integration Guide (10 min)
- [ ] Add locale field to Phase 1 quotation example
- [ ] Document HMAC signature rules for GET vs POST
- [ ] Add troubleshooting section for ERR_INVALID_LOCALE
- [ ] Add troubleshooting section for ERR_AUTHENTICATE
- [ ] Update Postman collection templates

### Step 3: Update All Code Examples (15 min)
- [ ] Update LalamoveClient class in guide
- [ ] Update frontend component examples
- [ ] Update API route examples
- [ ] Add locale to all request bodies

### Step 4: Re-Test Everything (10 min)
- [ ] Run `node scripts/test-lalamove-delivery.js` again
- [ ] Verify quotation returns 200 with price
- [ ] Verify GET endpoints work (cities, vehicle types)
- [ ] Document successful test results

---

## 🎯 EXPECTED RESULTS AFTER FIXES

### Test 1: Get Quotation
```json
Status: 200 ✅
{
  "data": {
    "quotationId": "QUO_...",
    "priceBreakdown": {
      "total": "180.00",
      "currency": "PHP",
      "base": "150.00"
    },
    "distance": {
      "value": "4.0",
      "unit": "km"
    },
    "estimatedPickupTime": "2025-11-26T14:30:00Z",
    "estimatedDropoffTime": "2025-11-26T14:55:00Z"
  }
}
```

### Test 2: Get Vehicle Types
```json
Status: 200 ✅
{
  "data": [
    {
      "key": "MOTORCYCLE",
      "name": "Motorcycle"
    },
    {
      "key": "SEDAN",
      "name": "Sedan"
    },
    {
      "key": "MPV",
      "name": "MPV/SUV"
    }
  ]
}
```

---

## 📝 UPDATED IMPLEMENTATION PHASES

### Phase 0: API Testing & Validation (NEW - 2 hours)
**Status**: 🟡 IN PROGRESS  
**Goal**: Fix all API errors before building frontend

#### Tasks:
- [x] Create test script with actual addresses
- [x] Run tests and identify errors
- [ ] Fix ERR_INVALID_LOCALE (add locale field)
- [ ] Fix ERR_AUTHENTICATE (fix HMAC for GET requests)
- [ ] Verify all endpoints return 200
- [ ] Document successful API responses
- [ ] Update all code examples with fixes

#### Success Criteria:
- [ ] Quotation returns price: ₱150-₱250
- [ ] Cities endpoint returns 3 regions
- [ ] Vehicle types endpoint returns 3+ options
- [ ] All HMAC signatures valid
- [ ] No 4xx/5xx errors

---

### Phase 1: Quotation System (3 hours)
**Status**: 🔴 BLOCKED (Fix Phase 0 first)  
**Changes**: Add locale to all requests

```typescript
// UPDATED: Add locale field
const body = JSON.stringify({
  data: {
    market: this.market,
    language: 'en_PH',  // ✅ NEW REQUIRED FIELD
    serviceType: 'COURIER',
    stops: [/* ... */],
    deliveries: [/* ... */],
    item: {/* ... */}
  }
});
```

---

### Phase 2: Order Placement (3 hours)
**Status**: 🔴 BLOCKED (Fix Phase 0 first)  
**Changes**: Add locale, update error handling

```typescript
// UPDATED: Enhanced error handling
try {
  const lalamoveOrder = await lalamove.createOrder({
    quotationId: body.quotationId,
    language: 'en_PH',  // ✅ ADD THIS
    // ... rest of config
  });
} catch (error) {
  // Handle specific error codes
  if (error.id === 'ERR_INVALID_LOCALE') {
    return NextResponse.json(
      { error: 'Invalid locale configuration' },
      { status: 400 }
    );
  }
  
  if (error.id === 'ERR_AUTHENTICATE') {
    return NextResponse.json(
      { error: 'API authentication failed - check credentials' },
      { status: 500 }
    );
  }
  
  // ... other error handling
}
```

---

## 🚀 NEXT IMMEDIATE ACTIONS

### Right Now (10 minutes):
1. **Apply Fix 1**: Add `language: 'en_PH'` to test script
2. **Apply Fix 2**: Fix HMAC signature calculation
3. **Re-run test**: `node scripts/test-lalamove-delivery.js`
4. **Verify**: All tests should pass with 200 status

### After Successful Test (30 minutes):
1. **Update Integration Guide**: Add locale to all examples
2. **Document Errors**: Add troubleshooting section
3. **Update Phases**: Adjust timelines based on findings
4. **Create Postman Collection**: With corrected requests

### Ready for Development (Next Session):
1. **Start Phase 1**: Build quotation system with fixes applied
2. **Build LalamoveClient**: With proper locale and HMAC
3. **Create Frontend UI**: Quotation display component
4. **Test End-to-End**: From checkout to quotation display

---

## 📖 LESSONS LEARNED

### 1. Always Check API Documentation First
- Lalamove requires `language` field for PH market
- Not documented clearly in basic examples
- **Action**: Read full API docs before coding

### 2. HMAC Signatures Are Tricky
- GET requests with query params need special handling
- Query string must be included in signature path
- **Action**: Test signature logic separately first

### 3. Test Early, Test Often
- Found 3 critical issues before building anything
- Saved hours of debugging frontend code
- **Action**: Always create test scripts first

### 4. Sandbox != Production
- Sandbox may have different validation rules
- Test both environments before launch
- **Action**: Verify sandbox behavior matches production

---

## 💡 RECOMMENDATIONS

### For Immediate Implementation:
1. ✅ **Start with Phase 0** - Fix API integration first
2. ✅ **Create comprehensive test suite** - Cover all endpoints
3. ✅ **Document all errors** - Build troubleshooting guide
4. ✅ **Update all examples** - Ensure accuracy

### For Long-Term Success:
1. 📝 **Add API monitoring** - Log all requests/responses
2. 🔄 **Implement retry logic** - Handle transient failures
3. 📊 **Track error rates** - Identify patterns
4. 🧪 **Automated testing** - CI/CD integration

---

**Next Update**: After applying fixes and re-running tests  
**Questions**: Check troubleshooting section in updated integration guide
