# MASH E-commerce Site - Route Structure

## ✅ Complete Site Map

### Root Pages

- `/` - Homepage (landingPage.tsx)
- `/about` - About MASH mission and values
- `/faq` - Frequently asked questions
- `/returns-policy` - Returns and refunds policy
- `/sell-with-us` - Grower application form

### Customer Routes (under `/` via (customer) route group)

All customer-facing shopping and account pages:

#### Shopping

- `/products` - Product catalog with search and filters
- `/products/[id]` - Individual product details (dynamic route)
- `/stores` - Grower directory
- `/stores/[id]` - Individual grower profile (dynamic route)
- `/cart` - Shopping cart

#### Checkout Flow

- `/checkout/shipping` - Delivery address form
- `/checkout/payment` - Payment method selection
- `/checkout/success` - Order confirmation

#### Account Management

- `/login` - User authentication
- `/signup` - New user registration
- `/account/profile` - User profile and settings
- `/account/orders` - Order history
- `/account/addresses` - Saved delivery addresses
- `/account/preferences` - Shopping preferences and favorites

#### Community

- `/community/recipes` - Recipe collection using MASH mushrooms

### Seller Routes (under `/seller` via (seller) route group)

Grower portal for business management:

- `/seller/dashboard` - Sales overview and statistics
- `/seller/orders` - Order management and fulfillment
- `/seller/products` - Product inventory management
- `/seller/profile` - Shop profile and branding
- `/seller/returns` - Returns and refunds management

## 🎨 Design System

All pages use **shadcn/ui** components:

- Card, Badge, Button, Input, Select, Table, Form
- Consistent Philippine marketplace context (₱ currency, GCash, Metro Manila)
- MASH branding (mushroom emoji 🍄, green accents)
- Mobile-responsive layouts

## 📁 File Structure

```
src/
├── app/
│   ├── (customer)/          # Customer route group
│   │   ├── products/
│   │   ├── stores/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── community/
│   │   ├── login/
│   │   └── signup/
│   ├── (seller)/            # Seller route group
│   │   └── seller/
│   │       ├── dashboard/
│   │       ├── orders/
│   │       ├── products/
│   │       ├── profile/
│   │       └── returns/
│   ├── about/
│   ├── faq/
│   ├── returns-policy/
│   ├── sell-with-us/
│   ├── layout.tsx           # Root layout with navigation
│   └── page.tsx             # Homepage
└── [pageName]Page.tsx       # Page component files (28 total)
```

## ✅ Build Status

**All routes compiled successfully!**

- 28 static/dynamic routes
- TypeScript validation passed
- ESLint checks passed
- Production build ready

## 🔗 Navigation

Updated root layout includes links to:

- Products
- Growers (stores)
- Recipes
- About
- Cart
- Login

## 🚀 Next Steps

1. ✅ All pages created with shadcn UI
2. ✅ Routes organized into (customer) and (seller) groups
3. ✅ Navigation updated
4. ✅ TypeScript build successful
5. Ready for backend integration (API routes in `/api/products`)
6. Ready for authentication implementation
7. Ready for database connection
