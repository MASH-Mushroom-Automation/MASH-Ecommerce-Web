# 🚀 Quick PR Creation Guide

## Super Fast Steps to Create Pull Request

### 1️⃣ Stage & Commit Changes (if any)
```bash
git add .
git commit -m "feat: AI Chatbot - RAG search with product cards

- Fixed product URLs (/product/ instead of /products/)
- Updated Sanity stock data (40 products in stock)
- Product cards display with Add to Cart/Wishlist
- All 215 tests passing
- Build successful"
```

### 2️⃣ Push to GitHub
```bash
git push origin AI-Chatbot
```

If first time pushing this branch:
```bash
git push -u origin AI-Chatbot
```

### 3️⃣ Create PR on GitHub

1. Go to: https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web
2. Click **"Pull requests"** tab
3. Click **"New pull request"**
4. Set **Base**: `main` ← **Compare**: `AI-Chatbot`
5. Click **"Create pull request"**

### 4️⃣ Fill PR Title
```
feat: AI Chatbot with RAG Search Integration
```

### 5️⃣ Copy PR Description

**Copy everything below into the PR description:**

---

# 🤖 AI Chatbot with RAG Search Integration

## Summary
Intelligent AI chatbot that displays product cards directly in chat responses. Users can search products using natural language, get AI recommendations, and add to cart/wishlist.

## Features
- ✅ RAG Search (TF-IDF + Sanity CMS)
- ✅ Product cards (1-3 per query)
- ✅ Add to Cart/Wishlist
- ✅ Natural language search
- ✅ Configurable AI model

## Fixed Bugs
1. **Product URLs**: `/products/` → `/product/` (404 errors fixed)
2. **Stock Data**: Updated 40 products to in-stock
3. **Product Cards**: Now displaying correctly

## Testing
```bash
npm run test:chatbot  # ✅ 215/215 passing
npm run build         # ✅ Successful
```

## How to Test
1. `git checkout AI-Chatbot && npm install`
2. `npm run dev`
3. Open http://localhost:3000
4. Click chatbot → Type: "show me mushrooms"
5. ✅ See 3 product cards with Add to Cart/Wishlist

## Environment Config
```env
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash  # Configurable!
```

## Files Changed
- `src/lib/ai/context-builder.ts` (URL fix)
- `src/components/chatbot/ProductCard.tsx` (URL fix)
- `scripts/update-product-stock.js` (new)
- Tests updated

## Documentation
- [Complete Guide](.github/AI_CHATBOT_COMPLETE.md)
- [Fix Summary](.github/AI_CHATBOT_FIX_SUMMARY.md)

## Success Criteria - ALL MET ✅
- [x] 215 tests passing
- [x] Build successful
- [x] Product cards display
- [x] Add to Cart/Wishlist working
- [x] URLs correct
- [x] All products in stock

**Status**: ✅ Production Ready

---

### 6️⃣ Add Labels (Optional)
- `feature`
- `enhancement`
- `ai`
- `chatbot`

### 7️⃣ Click "Create pull request"

Done! 🎉

---

## After PR is Created

**To merge later**:
```bash
# After approval
git checkout main
git pull origin main
git branch -d AI-Chatbot
```

---

**Full Guide**: See [.github/PULL_REQUEST_GUIDE.md](.github/PULL_REQUEST_GUIDE.md)
