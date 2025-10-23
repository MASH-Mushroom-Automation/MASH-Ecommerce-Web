# Quick Reference Guide

## 📁 Project Structure

```
src/app/
├── (auth)/        → Authentication pages (login, signup, etc.)
├── (shop)/        → Shopping pages (catalog, products, checkout)
├── (user)/        → User pages (profile, onboarding)
├── about/         → About page
├── grower/        → Grower listings
└── page.tsx       → Home/Landing page
```

## 🔐 Middleware & Route Protection

**Protected Routes** (require authentication):
- `/profile`
- `/checkout`
- `/onboarding/*`

**Auth Routes** (redirect if authenticated):
- `/login`, `/signup`, `/forgot-password`, etc.

**Public Routes** (accessible to all):
- `/`, `/catalog`, `/product/*`, `/about`, `/grower`

## 📦 Import Patterns

### UI Components
```typescript
// Old way
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// New way (using barrel exports)
import { Button, Input } from "@/components/ui";
```

### Layout Components
```typescript
import { Header, Footer } from "@/components/layout";
```

### All Components
```typescript
import { Header, Footer, Button, Input } from "@/components";
```

## 🎨 Route Group Features

### (auth) - Authentication
- **Layout:** Simplified header, centered content
- **Loading:** Spinner in card
- **Error:** Auth-specific error handling

### (shop) - Shopping
- **Loading:** "Loading products..." message
- **Error:** Shopping error boundary

### (user) - User Pages
- **Loading:** Generic loading spinner
- **Error:** User error boundary

## 🚀 Quick Commands

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## 📝 Common Tasks

### Adding a New Protected Route
1. Create page in appropriate route group
2. Add route to `middleware.ts` `protectedRoutes` array

### Adding a New Public Route
1. Create page in `app/` directory
2. Add to `middleware.ts` `publicRoutes` array (if needed)

### Creating a New Component
1. Add component to `components/ui/` or `components/layout/`
2. Export is automatic via barrel exports

### Adding Loading State
Create `loading.tsx` in the route folder

### Adding Error Boundary
Create `error.tsx` in the route folder

## 🔧 Configuration Files

- **Middleware:** `src/middleware.ts`
- **Root Layout:** `src/app/layout.tsx`
- **Auth Layout:** `src/app/(auth)/layout.tsx`
- **Global Styles:** `src/app/globals.css`

## 📊 Route Groups Explained

Route groups use `(folder)` syntax:
- Groups related routes together
- **Does NOT affect URL** - `/catalog` stays `/catalog`
- Allows shared layouts per group
- Helps organize large applications

Example:
```
app/(shop)/catalog/page.tsx  →  URL: /catalog
app/(shop)/checkout/page.tsx →  URL: /checkout
```

## 🎯 Best Practices

1. **Use route groups** for logical organization
2. **Add loading.tsx** for better UX
3. **Add error.tsx** for error handling
4. **Use barrel exports** for cleaner imports
5. **Update middleware** when adding protected routes
6. **Keep layouts simple** and focused

## 🐛 Troubleshooting

### Routes not working after refactor?
- Check file is named `page.tsx`
- Verify route group parentheses: `(auth)` not `auth`

### Middleware not protecting routes?
- Check cookie name matches your auth implementation
- Verify route is in `protectedRoutes` array

### Imports not working?
- Check barrel export files exist
- Verify component is exported from its file

### Loading state not showing?
- Ensure `loading.tsx` is in correct folder
- Check it's a default export

---

**Last Updated:** October 22, 2025
