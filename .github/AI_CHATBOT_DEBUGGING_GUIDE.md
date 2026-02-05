# AI Chatbot Product Cards - Debugging Guide

## Quick Verification Steps

### 1. Check Dev Server is Running
```bash
# Terminal 1: Start dev server
npm run dev

# Should see:
# ✓ Ready in 2.2s
# - Local: http://localhost:3000
```

### 2. Open Browser Console
1. Navigate to: http://localhost:3000
2. Open DevTools (F12)
3. Go to Console tab
4. Click chatbot button (bottom-right)

### 3. Send Test Message
Type in chatbot: **"show me fresh mushrooms"**

### 4. Check Console Logs
You should see logs like:
```
[ChatContext] Sending message to API
[Chatbot API] Starting RAG search for: show me fresh mushrooms
[Chatbot API] RAG response: {
  hasContent: true,
  productCardCount: 5,
  source: 'rag'
}
[ChatContext] API Response received: {
  hasContent: true,
  productCardCount: 5,
  source: 'rag'
}
[ChatContext] Storing product cards: {
  messageId: 'assistant-1738364520000',
  cardCount: 5,
  firstCard: 'Fresh Button Mushrooms'
}
```

## Firebase Errors (SAFE TO IGNORE)

These warnings are **NOT BLOCKING** the chatbot:

```
[Firebase/Firestore]: Could not reach Cloud Firestore backend
NetworkError when attempting to fetch resource
```

**Why?** Firestore analytics operates in **offline mode** when cloud connection fails. The chatbot works perfectly without cloud analytics.

## Common Issues & Solutions

### Issue 1: Product Cards Not Displaying

**Symptom:** AI response shows but no product cards below

**Debugging:**
1. Check browser console for errors
2. Look for `[ChatContext] No product cards in response`
3. Verify API logs show `productCardCount: 5` (or other number)

**Possible Causes:**

#### A) RAG Search Not Detecting Product Queries
```javascript
// In rag-service.ts, the query might not match product keywords
// Test with: "oyster mushrooms", "shiitake", "mushroom products"
```

**Fix:** Use explicit product keywords in queries

#### B) Product Cards State Not Updating
```typescript
// ChatContext.tsx - verify this code exists:
if (response.productCards && response.productCards.length > 0) {
  setProductCardsByMessageId((prev) => ({
    ...prev,
    [assistantMessage.id]: response.productCards,
  }));
}
```

**Fix:** Already implemented in latest code

#### C) Message Component Not Rendering Cards
Check `src/components/chatbot/Message.tsx`:
```tsx
{productCards && productCards.length > 0 && (
  <div className="grid...">
    {productCards.map((product) => (
      <ProductCard key={product.id} {...product} />
    ))}
  </div>
)}
```

**Fix:** Component already correct

### Issue 2: API Returns Empty productCards Array

**Symptom:** Console shows `productCardCount: 0`

**Debugging:**
```bash
# Check Sanity connection
# Terminal:
cd studio
npm run dev

# Navigate to: http://localhost:3333
# Verify products exist in Sanity
```

**Possible Causes:**

#### A) Sanity API Not Returning Products
Check `src/lib/ai/sanity-rag.ts`:
```typescript
export async function fetchAllProducts(): Promise<RAGProduct[]> {
  const products = await sanityClient.fetch(productsQuery);
  console.log('[Sanity RAG] Fetched products:', products.length);
  return products.map(transformToRAGProduct);
}
```

**Fix:** Add console.log to verify Sanity connection

#### B) TF-IDF Search Not Matching
Low relevance scores filtered out:
```typescript
// In rag-service.ts - check minRelevanceScore
const response = await ragSearch(message, history, {
  maxProducts: 5,
  includeOutOfStock: false,
  minRelevanceScore: 0.1,  // ← Lower this to 0.05 for more results
});
```

**Fix:** Reduce `minRelevanceScore` threshold

### Issue 3: Tests Failing

**Symptom:** `npm run test:chatbot` shows failures

**Common Failures:**

#### A) Fetch Not Defined
```
ReferenceError: fetch is not defined
```

**Fix:** Already added global fetch mock in test file:
```typescript
// src/contexts/__tests__/ChatContext.test.tsx
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
```

#### B) Firebase Mock Errors
```
Firebase not initialized
```

**Fix:** Already mocked in `jest.setup.js`:
```javascript
jest.mock('firebase/firestore', () => ({ ... }));
```

## Testing Checklist

Run these commands in order:

```bash
# 1. Run chatbot tests (should pass 215/215)
npm run test:chatbot

# 2. Run production build (should succeed with 121 routes)
npm run build

# 3. Start dev server
npm run dev

# 4. Open browser: http://localhost:3000
# 5. Click chatbot button
# 6. Type: "show me oyster mushrooms"
# 7. Verify product cards appear
```

## Manual UI Testing

### Test Queries (Should Show Product Cards):

1. **"show me fresh mushrooms"** → 12 products (Fresh category)
2. **"oyster mushrooms"** → Oyster products + kits
3. **"shiitake products"** → Shiitake fresh + dried + kit
4. **"medicinal mushrooms"** → Lion's Mane, Reishi, etc.
5. **"growing kits"** → 5 growing kits
6. **"what mushrooms are in stock?"** → All in-stock products

### Test Queries (Should NOT Show Cards):

1. **"hello"** → General greeting, no products
2. **"how are you?"** → Conversation, no products
3. **"what's your name?"** → No product relevance

## Expected Product Card Features

Each card should have:
- ✅ Product image (from Sanity CDN)
- ✅ Product name
- ✅ Price in ₱ PHP format
- ✅ Stock badge (In Stock / Out of Stock)
- ✅ "Add to Cart" button (working)
- ✅ Heart icon for wishlist (working)
- ✅ Clickable → navigates to product page

## Network Debugging

### Check API Response:

1. Open DevTools → Network tab
2. Filter: `/api/chatbot/message`
3. Send message in chatbot
4. Click the API request
5. Go to Response tab
6. Verify JSON structure:

```json
{
  "success": true,
  "content": "Here are some fresh mushrooms!",
  "productCards": [
    {
      "id": "fresh-oyster-mushrooms",
      "name": "Fresh Oyster Mushrooms",
      "price": 350,
      "image": "https://cdn.sanity.io/...",
      "category": "Fresh Mushrooms",
      "inStock": true,
      "slug": "fresh-oyster-mushrooms",
      "relevanceScore": 0.95
    }
  ],
  "source": "rag"
}
```

## Environment Variables Check

Verify `.env` has these set:

```bash
# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...  # ← Must be valid
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash
NEXT_PUBLIC_CHATBOT_ENABLED=true

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26
```

## Firestore Analytics Errors (OPTIONAL FIX)

If you want to fix Firebase offline warnings:

### Option 1: Disable Firestore Analytics Temporarily
```typescript
// src/contexts/ChatContext.tsx
// Comment out analytics tracking:

// await analytics.logQuery({ ... });
// await analytics.incrementMessageCount(conversationId);
```

### Option 2: Configure Firebase to Use Emulator
```typescript
// src/lib/firebase/config.ts
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

Then start Firebase emulator:
```bash
firebase emulators:start --only firestore
```

### Option 3: Ignore Warnings (Recommended)
Firebase warnings don't affect chatbot functionality. Analytics work in offline mode.

## Performance Metrics

Expected response times:
- **First message:** 2-4 seconds (Sanity fetch + AI generation)
- **Subsequent messages:** 1-2 seconds (cached products)
- **Product card render:** < 100ms

## Success Criteria

✅ **All 215 tests passing**  
✅ **Build successful (121 routes)**  
✅ **Dev server running**  
✅ **Chatbot opens/closes**  
✅ **Messages send and receive**  
✅ **Product cards display** ← **MAIN GOAL**  
✅ **Add to Cart works**  
✅ **Wishlist works**  
✅ **Navigation to product pages works**  

## Still Not Working?

### Last Resort Debugging:

1. **Clear browser cache:**
   - DevTools → Application → Clear storage
   - Refresh page (Ctrl+Shift+R)

2. **Restart dev server:**
   ```bash
   # Kill dev server (Ctrl+C)
   npm run dev
   ```

3. **Check for TypeScript errors:**
   ```bash
   npm run build
   # Fix any errors shown
   ```

4. **Verify Sanity data:**
   ```bash
   node scripts/check-sanity-data.js
   # Should show 28 products
   ```

5. **Test API directly with curl:**
   ```bash
   curl -X POST http://localhost:3000/api/chatbot/message \
     -H "Content-Type: application/json" \
     -d '{"message": "show me oyster mushrooms"}'
   ```

   Should return JSON with `productCards` array.

## Contact Points

If issues persist:
- Check `CLAUDE.md` files in each directory
- Review `.github/AI_CHATBOT_PRODUCT_SEARCH_COMPLETE.md`
- Read `.github/AI_CHATBOT_PRODUCT_CARDS_FIX.md`

---

**Last Updated:** January 31, 2026  
**Status:** Debugging tools added, logging enabled  
**Next Step:** Test in browser with console open  
