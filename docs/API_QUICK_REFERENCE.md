# 🚀 MASH Backend API - Quick Reference

## ✅ Status: CONNECTED & OPERATIONAL

---

## 📡 Backend API

**URL**: `http://localhost:3000`  
**API Base**: `http://localhost:3000/api/v1`  
**Status**: ✅ OPERATIONAL  
**Products**: 9 items available  
**Framework**: NestJS + Prisma + PostgreSQL

---

## 🔧 Frontend Configuration

### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false  # false = real API, true = mock data
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```

### Development Server

```bash
npm run dev
# Running at: http://localhost:3000
```

---

## 📦 Available Products (from Backend)

| ID  | Product Name                 | Price | Stock |
| --- | ---------------------------- | ----- | ----- |
| 1   | Fresh White Oyster Mushrooms | ₱120  | 45    |
| 2   | Mushroom Chips               | ₱140  | 30    |
| 3   | Blue Oyster Mushrooms        | ₱150  | 25    |
| 4   | White Oyster Growing Kit     | ₱350  | 18    |
| 5   | Crispy Mushroom Chicharon    | ₱150  | 40    |
| 6   | Bagoong Mushroom             | ₱380  | 12    |
| 7   | Blue Oyster Growing Kit      | ₱370  | 15    |
| 8   | Premium Golden Oyster Kit    | ₱450  | 8     |
| 9   | King Oyster Growing Kit      | ₱420  | 10    |

**Total**: 9 products, 203 items in stock

---

## 💻 Code Usage

### Import

```typescript
import { ProductsApi } from "@/lib/api/products";
```

### Fetch All Products

```typescript
const response = await ProductsApi.getProducts({
  page: 1,
  limit: 12,
});
console.log(response.data); // Array of products
```

### Fetch Single Product

```typescript
const response = await ProductsApi.getProductById("product-id");
console.log(response.data); // Single product
```

### Search Products

```typescript
const response = await ProductsApi.searchProducts("oyster");
console.log(response.data); // Matching products
```

---

## 🧪 Testing

### Test Backend API

```bash
# Get all products
curl http://localhost:3000/api/v1/products

# Get single product (example ID)
curl http://localhost:3000/api/v1/products/cmhspbus70000vpakh1ykdsp5

# Search products
curl "http://localhost:3000/api/v1/products?search=oyster"
```

### Test Frontend

```bash
# Start dev server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 🔄 Switch API Mode

### Use Real Backend API (Production)

```env
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Use Mock Data (Testing)

```env
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

## 📁 Key Files

| File                                       | Purpose                   |
| ------------------------------------------ | ------------------------- |
| `.env.local`                               | Environment configuration |
| `src/lib/api/client.ts`                    | Axios API client          |
| `src/lib/api/products.ts`                  | Products API service      |
| `docs/RAILWAY_API_INTEGRATION_COMPLETE.md` | Full documentation        |
| `docs/BACKEND_API_CONNECTION_GUIDE.md`     | Backend guide             |

---

## ✅ Integration Checklist

- [x] Backend API verified operational
- [x] Environment variables configured
- [x] API client created
- [x] Products service integrated
- [x] Development server running
- [x] TypeScript compilation passing
- [x] Feature flags enabled
- [x] Documentation complete

---

## 🎯 Next Steps

1. **Test in Browser**: Open http://localhost:3000
2. **Update Components**: Replace mock data with `ProductsApi` calls
3. **Add Loading States**: Show spinners while fetching
4. **Error Handling**: Add error boundaries
5. **Pagination**: Implement page navigation
6. **Search**: Add search functionality
7. **Filters**: Category, price, grower filters
8. **React Query**: Add caching layer
9. **Authentication**: Integrate Clerk auth
10. **Production**: Deploy to Vercel

---

## 🚨 Troubleshooting

### Products not loading?

1. Check `.env.local` has correct API URL
2. Verify `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. Check browser console for errors
4. Test backend API directly with curl

### CORS errors?

- Backend has CORS configured
- Check if request headers are correct
- Verify API URL is exactly: `http://localhost:3000/api/v1`

### Timeout errors?

- Increase timeout: `NEXT_PUBLIC_API_TIMEOUT=60000`
- Check backend status
- Check internet connection

---

## 📞 Support

**Email**: pp.namias@gmail.com  
**Backend Repo**: https://github.com/MASH-Mushroom-Automation/MASH-Backend  
**Issues**: https://github.com/MASH-Mushroom-Automation/MASH-Backend/issues

---

## 🎉 Status

**Backend**: ✅ OPERATIONAL  
**Frontend**: ✅ CONFIGURED  
**Integration**: ✅ COMPLETE  
**Ready for**: Component Updates

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0
